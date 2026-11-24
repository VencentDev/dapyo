package com.vencentdev.backend.modules.hike.dto;

import java.util.UUID;

public record HikeImageResponse(
    UUID imageId, String url, String caption, String mimeType, long byteSize, int displayOrder) {}
