package com.vencentdev.backend.modules.user.dto;

import java.util.UUID;

public record PublicUserSearchResponse(UUID id, String displayName, String avatarUrl) {}
