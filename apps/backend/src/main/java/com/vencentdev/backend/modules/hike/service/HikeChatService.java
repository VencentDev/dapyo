package com.vencentdev.backend.modules.hike.service;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.hike.dto.HikeChatMessageRequest;
import com.vencentdev.backend.modules.hike.dto.HikeChatMessageResponse;
import com.vencentdev.backend.modules.hike.dto.HikeChatSummaryResponse;
import java.util.List;
import java.util.UUID;

public interface HikeChatService {

  List<HikeChatSummaryResponse> getChats(AuthenticatedUser principal);

  List<HikeChatMessageResponse> getMessages(UUID hikeId, AuthenticatedUser principal);

  HikeChatMessageResponse sendMessage(
      UUID hikeId, HikeChatMessageRequest request, AuthenticatedUser principal);
}
