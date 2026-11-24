package com.vencentdev.backend.modules.hike.dto;

import jakarta.validation.constraints.Min;

public record HikeGuestCountUpdateRequest(@Min(0) int externalGuestCount) {}
