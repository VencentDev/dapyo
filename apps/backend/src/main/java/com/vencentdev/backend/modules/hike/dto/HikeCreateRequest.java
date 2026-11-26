package com.vencentdev.backend.modules.hike.dto;

import com.vencentdev.backend.modules.hike.enums.HikeAdmissionMode;
import com.vencentdev.backend.modules.user.enums.onboarding.TrailDifficulty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record HikeCreateRequest(
    @NotBlank @Size(max = 500) String locationName,
    @NotBlank @Size(max = 200) String mountainName,
    @DecimalMin(value = "0.1") @DecimalMax("99999.99") BigDecimal distanceKm,
    @NotNull @DecimalMin("-90") @DecimalMax("90") BigDecimal latitude,
    @NotNull @DecimalMin("-180") @DecimalMax("180") BigDecimal longitude,
    @NotNull LocalDate scheduledDate,
    @NotNull TrailDifficulty difficulty,
    @Min(1) @Max(5) Integer difficultyRating,
    @Positive int maxParticipants,
    @NotNull List<@NotNull UUID> initialMemberIds,
    @Min(0) int externalGuestCount,
    List<@NotNull @NotBlank @Size(max = 120) String> externalGuestNames,
    @NotNull HikeAdmissionMode admissionMode,
    @NotBlank @Size(max = 4000) String description,
    @Size(max = 4000) String requirements) {}
