package com.vencentdev.backend.modules.hike.service;

import com.vencentdev.backend.common.exception.BadRequestException;
import com.vencentdev.backend.common.exception.ForbiddenException;
import com.vencentdev.backend.common.exception.ResourceNotFoundException;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.hike.dto.HikeImageResponse;
import com.vencentdev.backend.modules.hike.entity.Hike;
import com.vencentdev.backend.modules.hike.entity.HikeImage;
import com.vencentdev.backend.modules.hike.enums.HikeStatus;
import com.vencentdev.backend.modules.hike.repository.HikeImageRepository;
import com.vencentdev.backend.modules.hike.repository.HikeRepository;
import com.vencentdev.backend.modules.hike.storage.HikeImageStorage;
import com.vencentdev.backend.modules.user.service.UserService;
import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

@Service
public class HikeImageServiceImpl implements HikeImageService {

  private static final Logger log = LoggerFactory.getLogger(HikeImageServiceImpl.class);
  private static final int MAX_IMAGES_PER_HIKE = 5;
  private static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;

  private final HikeRepository hikes;
  private final HikeImageRepository images;
  private final HikeImageStorage storage;
  private final UserService users;

  public HikeImageServiceImpl(
      HikeRepository hikes,
      HikeImageRepository images,
      HikeImageStorage storage,
      UserService users) {
    this.hikes = hikes;
    this.images = images;
    this.storage = storage;
    this.users = users;
  }

  @Override
  @Transactional
  public HikeImageResponse upload(
      UUID hikeId, MultipartFile file, String caption, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    requireOrganizer(hike, users.resolveInternalId(principal));
    if (images.countByHikeId(hikeId) >= MAX_IMAGES_PER_HIKE) {
      throw new BadRequestException("A hike can have at most five images");
    }
    if (file == null || file.isEmpty()) {
      throw new BadRequestException("Choose an image to upload");
    }
    if (file.getSize() > MAX_IMAGE_BYTES) {
      throw new BadRequestException("Each image must be 10 MB or smaller");
    }
    if (caption != null && caption.length() > 500) {
      throw new BadRequestException("Image captions must be 500 characters or fewer");
    }

    byte[] content;
    try {
      content = file.getBytes();
    } catch (IOException exception) {
      throw new IllegalStateException("Could not read uploaded hike image", exception);
    }
    String contentType = detectContentType(content);
    String declaredContentType = file.getContentType();
    if (declaredContentType != null
        && !"application/octet-stream".equals(declaredContentType)
        && !contentType.equalsIgnoreCase(declaredContentType)) {
      throw new BadRequestException("The uploaded file type does not match its image content");
    }
    rejectDuplicateContent(hikeId, content);

    String storageKey;
    try {
      storageKey = storage.store(content);
    } catch (IOException exception) {
      throw new IllegalStateException("Could not store hike image", exception);
    }
    registerRollbackCleanup(storageKey);

    int displayOrder =
        images.findByHikeIdOrderByDisplayOrderAscCreatedAtAsc(hikeId).stream()
                .mapToInt(HikeImage::getDisplayOrder)
                .max()
                .orElse(-1)
            + 1;
    HikeImage image =
        HikeImage.builder()
            .hikeId(hikeId)
            .storageKey(storageKey)
            .mimeType(contentType)
            .byteSize(content.length)
            .caption(caption == null || caption.isBlank() ? null : caption.trim())
            .displayOrder(displayOrder)
            .build();
    try {
      return toResponse(images.saveAndFlush(image));
    } catch (RuntimeException exception) {
      try {
        storage.delete(storageKey);
      } catch (IOException cleanupException) {
        exception.addSuppressed(cleanupException);
      }
      throw exception;
    }
  }

  @Override
  @Transactional(readOnly = true)
  public HikeImageDownload download(UUID hikeId, UUID imageId) {
    Hike hike = findPublishedHike(hikeId);
    HikeImage image =
        images
            .findByIdAndHikeId(imageId, hike.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Hike image not found"));
    try {
      return new HikeImageDownload(storage.read(image.getStorageKey()), image.getMimeType());
    } catch (IOException exception) {
      if (exception instanceof java.nio.file.NoSuchFileException) {
        throw new ResourceNotFoundException("Hike image not found");
      }
      throw new IllegalStateException("Could not read hike image", exception);
    }
  }

  @Override
  @Transactional
  public void delete(UUID hikeId, UUID imageId, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    requireOrganizer(hike, users.resolveInternalId(principal));
    HikeImage image =
        images
            .findByIdAndHikeId(imageId, hikeId)
            .orElseThrow(() -> new ResourceNotFoundException("Hike image not found"));
    images.delete(image);
    images.flush();
    registerAfterCommitDelete(image.getStorageKey());
  }

  private Hike findPublishedHike(UUID hikeId) {
    Hike hike =
        hikes.findById(hikeId).orElseThrow(() -> new ResourceNotFoundException("Hike not found"));
    if (hike.getStatus() != HikeStatus.PUBLISHED) {
      throw new ResourceNotFoundException("Hike not found");
    }
    return hike;
  }

  private Hike findPublishedHikeForUpdate(UUID hikeId) {
    Hike hike =
        hikes
            .findByIdForUpdate(hikeId)
            .orElseThrow(() -> new ResourceNotFoundException("Hike not found"));
    if (hike.getStatus() != HikeStatus.PUBLISHED) {
      throw new ResourceNotFoundException("Hike not found");
    }
    return hike;
  }

  private void requireOrganizer(Hike hike, UUID userId) {
    if (!hike.getOrganizerId().equals(userId)) {
      throw new ForbiddenException("Only the organizer can manage hike images");
    }
  }

  private String detectContentType(byte[] content) {
    if (startsWith(content, new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a})) {
      return "image/png";
    }
    if (startsWith(content, new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff})) {
      return "image/jpeg";
    }
    if (content.length >= 12
        && Arrays.equals(Arrays.copyOfRange(content, 0, 4), new byte[] {'R', 'I', 'F', 'F'})
        && Arrays.equals(Arrays.copyOfRange(content, 8, 12), new byte[] {'W', 'E', 'B', 'P'})) {
      return "image/webp";
    }
    throw new BadRequestException("Upload a JPEG, PNG, or WebP image");
  }

  private void rejectDuplicateContent(UUID hikeId, byte[] content) {
    for (HikeImage existing : images.findByHikeIdOrderByDisplayOrderAscCreatedAtAsc(hikeId)) {
      try {
        if (Arrays.equals(content, storage.read(existing.getStorageKey()))) {
          throw new BadRequestException("This image has already been added to the hike");
        }
      } catch (IOException exception) {
        throw new IllegalStateException("Could not check for duplicate hike images", exception);
      }
    }
  }

  private boolean startsWith(byte[] content, byte[] signature) {
    if (content.length < signature.length) {
      return false;
    }
    for (int index = 0; index < signature.length; index++) {
      if (content[index] != signature[index]) {
        return false;
      }
    }
    return true;
  }

  private HikeImageResponse toResponse(HikeImage image) {
    return new HikeImageResponse(
        image.getId(),
        "/api/v1/hikes/" + image.getHikeId() + "/images/" + image.getId(),
        image.getCaption(),
        image.getMimeType(),
        image.getByteSize(),
        image.getDisplayOrder());
  }

  private void registerRollbackCleanup(String storageKey) {
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCompletion(int status) {
            if (status != STATUS_COMMITTED) {
              deleteStoredFile(storageKey);
            }
          }
        });
  }

  private void registerAfterCommitDelete(String storageKey) {
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            deleteStoredFile(storageKey);
          }
        });
  }

  private void deleteStoredFile(String storageKey) {
    try {
      storage.delete(storageKey);
    } catch (IOException exception) {
      log.error("Could not clean up stored hike image", exception);
    }
  }
}
