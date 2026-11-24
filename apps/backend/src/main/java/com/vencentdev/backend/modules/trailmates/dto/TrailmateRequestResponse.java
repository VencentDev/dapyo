package com.vencentdev.backend.modules.trailmates.dto;

import java.time.Instant;
import java.util.UUID;

public record TrailmateRequestResponse(
    UUID id, UUID userId, String displayName, String avatarUrl, Instant requestedAt) {}
