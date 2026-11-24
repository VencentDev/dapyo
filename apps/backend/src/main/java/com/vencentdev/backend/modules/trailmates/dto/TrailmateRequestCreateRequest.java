package com.vencentdev.backend.modules.trailmates.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TrailmateRequestCreateRequest(@NotNull UUID userId) {}
