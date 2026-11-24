package com.vencentdev.backend.modules.hike.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record HikeMemberAddRequest(@NotNull UUID userId) {}
