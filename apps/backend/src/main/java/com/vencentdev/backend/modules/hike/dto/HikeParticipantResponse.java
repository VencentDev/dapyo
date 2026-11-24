package com.vencentdev.backend.modules.hike.dto;

import java.time.Instant;
import java.util.UUID;

public record HikeParticipantResponse(
    UUID userId, String displayName, String avatarUrl, Instant joinedAt) {}
