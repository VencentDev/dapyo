package com.vencentdev.backend.modules.hike.controller;

import com.vencentdev.backend.common.web.PageResponse;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.CurrentUser;
import com.vencentdev.backend.modules.hike.dto.HikeCreateRequest;
import com.vencentdev.backend.modules.hike.dto.HikeDetailResponse;
import com.vencentdev.backend.modules.hike.dto.HikeGuestCountUpdateRequest;
import com.vencentdev.backend.modules.hike.dto.HikeImageResponse;
import com.vencentdev.backend.modules.hike.dto.HikeJoinRequestResponse;
import com.vencentdev.backend.modules.hike.dto.HikeLikeResponse;
import com.vencentdev.backend.modules.hike.dto.HikeMemberAddRequest;
import com.vencentdev.backend.modules.hike.dto.HikeSummaryResponse;
import com.vencentdev.backend.modules.hike.service.HikeImageDownload;
import com.vencentdev.backend.modules.hike.service.HikeImageService;
import com.vencentdev.backend.modules.hike.service.HikeService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/hikes")
public class HikeController {

  private static final int MAX_PAGE_SIZE = 50;

  private final HikeService hikes;
  private final HikeImageService hikeImages;

  public HikeController(HikeService hikes, HikeImageService hikeImages) {
    this.hikes = hikes;
    this.hikeImages = hikeImages;
  }

  @GetMapping
  public PageResponse<HikeSummaryResponse> getUpcomingHikes(
      @PageableDefault(size = 20, sort = "scheduledDate", direction = Sort.Direction.ASC)
          Pageable pageable,
      @CurrentUser AuthenticatedUser user) {
    int pageSize = Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);
    Pageable boundedPageable = PageRequest.of(pageable.getPageNumber(), pageSize);
    return hikes.getUpcomingHikes(boundedPageable, user);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public HikeDetailResponse createHike(
      @CurrentUser AuthenticatedUser user, @Valid @RequestBody HikeCreateRequest request) {
    return hikes.createHike(user, request);
  }

  @GetMapping("/{id}")
  public HikeDetailResponse getHike(@PathVariable UUID id, @CurrentUser AuthenticatedUser user) {
    return hikes.getHike(id, user);
  }

  @PostMapping("/{id}/join")
  public HikeDetailResponse joinHike(@PathVariable UUID id, @CurrentUser AuthenticatedUser user) {
    return hikes.joinHike(id, user);
  }

  @PostMapping("/{id}/likes")
  public HikeLikeResponse likeHike(@PathVariable UUID id, @CurrentUser AuthenticatedUser user) {
    return hikes.likeHike(id, user);
  }

  @DeleteMapping("/{id}/likes")
  public HikeLikeResponse unlikeHike(@PathVariable UUID id, @CurrentUser AuthenticatedUser user) {
    return hikes.unlikeHike(id, user);
  }

  @GetMapping("/{id}/join-requests")
  public List<HikeJoinRequestResponse> getJoinRequests(
      @PathVariable UUID id, @CurrentUser AuthenticatedUser user) {
    return hikes.getJoinRequests(id, user);
  }

  @PostMapping("/{id}/join-requests/{userId}/accept")
  public HikeDetailResponse acceptJoinRequest(
      @PathVariable UUID id, @PathVariable UUID userId, @CurrentUser AuthenticatedUser user) {
    return hikes.acceptJoinRequest(id, userId, user);
  }

  @PostMapping("/{id}/join-requests/{userId}/decline")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void declineJoinRequest(
      @PathVariable UUID id, @PathVariable UUID userId, @CurrentUser AuthenticatedUser user) {
    hikes.declineJoinRequest(id, userId, user);
  }

  @PostMapping("/{id}/members")
  public HikeDetailResponse addTrailmate(
      @PathVariable UUID id,
      @Valid @RequestBody HikeMemberAddRequest request,
      @CurrentUser AuthenticatedUser user) {
    return hikes.addTrailmate(id, request, user);
  }

  @PatchMapping("/{id}/guests")
  public HikeDetailResponse updateGuestCount(
      @PathVariable UUID id,
      @Valid @RequestBody HikeGuestCountUpdateRequest request,
      @CurrentUser AuthenticatedUser user) {
    return hikes.updateGuestCount(id, request, user);
  }

  @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public HikeImageResponse uploadImage(
      @PathVariable UUID id,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "caption", required = false) String caption,
      @CurrentUser AuthenticatedUser user) {
    return hikeImages.upload(id, file, caption, user);
  }

  @GetMapping("/{id}/images/{imageId}")
  public ResponseEntity<byte[]> downloadImage(@PathVariable UUID id, @PathVariable UUID imageId) {
    HikeImageDownload download = hikeImages.download(id, imageId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(download.contentType()))
        .header("X-Content-Type-Options", "nosniff")
        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
        .body(download.content());
  }

  @DeleteMapping("/{id}/images/{imageId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteImage(
      @PathVariable UUID id, @PathVariable UUID imageId, @CurrentUser AuthenticatedUser user) {
    hikeImages.delete(id, imageId, user);
  }
}
