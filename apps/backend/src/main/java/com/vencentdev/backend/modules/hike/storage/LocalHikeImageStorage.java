package com.vencentdev.backend.modules.hike.storage;

import com.vencentdev.backend.modules.hike.config.HikeMediaProperties;
import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class LocalHikeImageStorage implements HikeImageStorage {

  private final Path root;

  public LocalHikeImageStorage(HikeMediaProperties properties) {
    this.root = properties.mediaDir().toAbsolutePath().normalize();
  }

  @Override
  public String store(byte[] content) throws IOException {
    Files.createDirectories(root);
    String key = UUID.randomUUID().toString();
    Path destination = resolve(key);
    Path temporary = Files.createTempFile(root, ".hike-image-", ".upload");
    try {
      Files.write(temporary, content);
      try {
        Files.move(temporary, destination, StandardCopyOption.ATOMIC_MOVE);
      } catch (AtomicMoveNotSupportedException exception) {
        Files.move(temporary, destination);
      }
      return key;
    } finally {
      Files.deleteIfExists(temporary);
    }
  }

  @Override
  public byte[] read(String storageKey) throws IOException {
    return Files.readAllBytes(resolve(storageKey));
  }

  @Override
  public void delete(String storageKey) throws IOException {
    Files.deleteIfExists(resolve(storageKey));
  }

  private Path resolve(String storageKey) throws IOException {
    try {
      if (!UUID.fromString(storageKey).toString().equals(storageKey)) {
        throw new IOException("Invalid image storage key");
      }
    } catch (IllegalArgumentException exception) {
      throw new IOException("Invalid image storage key", exception);
    }
    Path resolved = root.resolve(storageKey).normalize();
    if (!root.equals(resolved.getParent())) {
      throw new IOException("Invalid image storage path");
    }
    return resolved;
  }
}
