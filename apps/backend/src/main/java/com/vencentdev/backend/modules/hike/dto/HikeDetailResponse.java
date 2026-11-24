package com.vencentdev.backend.modules.hike.dto;

import com.vencentdev.backend.modules.hike.enums.HikeAdmissionMode;
import com.vencentdev.backend.modules.user.enums.onboarding.TrailDifficulty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record HikeDetailResponse(
    UUID id,
    String locationName,
    String mountainName,
    BigDecimal distanceKm,
    BigDecimal latitude,
    BigDecimal longitude,
    Instant scheduledStartAt,
    TrailDifficulty difficulty,
    int maxParticipants,
    int joinedMemberCount,
    int externalGuestCount,
    int availablePlaces,
    HikeAdmissionMode admissionMode,
    String description,
    String requirements,
    PublicHikerResponse organizer,
    List<HikeParticipantResponse> participants,
    List<HikeImageResponse> images,
    HikeViewerStatus currentUserStatus) {}
