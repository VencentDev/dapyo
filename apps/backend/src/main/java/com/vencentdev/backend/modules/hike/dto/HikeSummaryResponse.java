package com.vencentdev.backend.modules.hike.dto;

import com.vencentdev.backend.modules.hike.enums.HikeAdmissionMode;
import com.vencentdev.backend.modules.user.enums.onboarding.TrailDifficulty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record HikeSummaryResponse(
    UUID id,
    String locationName,
    String mountainName,
    BigDecimal distanceKm,
    BigDecimal latitude,
    BigDecimal longitude,
    LocalDate scheduledDate,
    TrailDifficulty difficulty,
    int difficultyRating,
    int maxParticipants,
    int joinedMemberCount,
    int externalGuestCount,
    int availablePlaces,
    HikeAdmissionMode admissionMode,
    PublicHikerResponse organizer) {}
