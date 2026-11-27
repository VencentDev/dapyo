package com.vencentdev.backend.modules.hike.dto;

import java.time.LocalDate;
import java.util.UUID;

public record HikeChatSummaryResponse(
    UUID hikeId, String name, String locationName, LocalDate scheduledDate, int memberCount) {}
