package com.vencentdev.backend.modules.hike.dto;

import java.util.UUID;

public record HikeLikeResponse(UUID hikeId, long likeCount, boolean likedByCurrentUser) {}
