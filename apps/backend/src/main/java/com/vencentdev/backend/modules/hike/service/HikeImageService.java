package com.vencentdev.backend.modules.hike.service;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.hike.dto.HikeImageResponse;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface HikeImageService {

  HikeImageResponse upload(
      UUID hikeId, MultipartFile file, String caption, AuthenticatedUser principal);

  HikeImageDownload download(UUID hikeId, UUID imageId);

  void delete(UUID hikeId, UUID imageId, AuthenticatedUser principal);
}
