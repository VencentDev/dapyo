package com.vencentdev.backend.modules.trailmates.dto;

import java.time.Instant;
import java.util.UUID;

public record TrailmateResponse(
    UUID userId, String displayName, String avatarUrl, Instant connectedAt) {}
