package com.vencentdev.backend.modules.hike.dto;

import java.util.UUID;

public record PublicHikerResponse(UUID id, String displayName, String avatarUrl) {}
