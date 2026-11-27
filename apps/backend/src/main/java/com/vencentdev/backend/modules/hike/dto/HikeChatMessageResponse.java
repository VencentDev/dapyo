package com.vencentdev.backend.modules.hike.dto;

import java.time.Instant;
import java.util.UUID;

public record HikeChatMessageResponse(
    UUID id,
    UUID hikeId,
    UUID senderId,
    String senderName,
    boolean sentByCurrentUser,
    String body,
    Instant sentAt) {}
