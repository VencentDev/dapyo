package com.vencentdev.backend.modules.hike.controller;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.CurrentUser;
import com.vencentdev.backend.modules.hike.dto.HikeChatMessageRequest;
import com.vencentdev.backend.modules.hike.dto.HikeChatMessageResponse;
import com.vencentdev.backend.modules.hike.dto.HikeChatSummaryResponse;
import com.vencentdev.backend.modules.hike.service.HikeChatService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HikeChatController {

  private final HikeChatService chats;

  public HikeChatController(HikeChatService chats) {
    this.chats = chats;
  }

  @GetMapping("/hike-chats")
  public List<HikeChatSummaryResponse> getChats(@CurrentUser AuthenticatedUser user) {
    return chats.getChats(user);
  }

  @GetMapping("/hikes/{hikeId}/messages")
  public List<HikeChatMessageResponse> getMessages(
      @PathVariable UUID hikeId, @CurrentUser AuthenticatedUser user) {
    return chats.getMessages(hikeId, user);
  }

  @PostMapping("/hikes/{hikeId}/messages")
  @ResponseStatus(HttpStatus.CREATED)
  public HikeChatMessageResponse sendMessage(
      @PathVariable UUID hikeId,
      @Valid @RequestBody HikeChatMessageRequest request,
      @CurrentUser AuthenticatedUser user) {
    return chats.sendMessage(hikeId, request, user);
  }
}
