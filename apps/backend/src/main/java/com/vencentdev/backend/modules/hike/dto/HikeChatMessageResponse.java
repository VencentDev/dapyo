package com.vencentdev.backend.modules.hike.dto;

import com.vencentdev.backend.modules.hike.enums.HikeMessageType;
import java.time.Instant;
import java.util.UUID;

public record HikeChatMessageResponse(
    UUID id,
    UUID hikeId,
    UUID senderId,
    String senderName,
    boolean sentByCurrentUser,
    HikeMessageType messageType,
    String body,
    Instant sentAt) {}
