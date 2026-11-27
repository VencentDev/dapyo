package com.vencentdev.backend.modules.hike.service;

import com.vencentdev.backend.common.exception.ForbiddenException;
import com.vencentdev.backend.common.exception.ResourceNotFoundException;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.hike.dto.HikeChatMessageRequest;
import com.vencentdev.backend.modules.hike.dto.HikeChatMessageResponse;
import com.vencentdev.backend.modules.hike.dto.HikeChatSummaryResponse;
import com.vencentdev.backend.modules.hike.entity.Hike;
import com.vencentdev.backend.modules.hike.entity.HikeMessage;
import com.vencentdev.backend.modules.hike.entity.HikeParticipant;
import com.vencentdev.backend.modules.hike.enums.HikeParticipantStatus;
import com.vencentdev.backend.modules.hike.enums.HikeStatus;
import com.vencentdev.backend.modules.hike.repository.HikeMessageRepository;
import com.vencentdev.backend.modules.hike.repository.HikeParticipantRepository;
import com.vencentdev.backend.modules.hike.repository.HikeRepository;
import com.vencentdev.backend.modules.user.entity.User;
import com.vencentdev.backend.modules.user.repository.UserRepository;
import com.vencentdev.backend.modules.user.service.UserService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HikeChatServiceImpl implements HikeChatService {

  private final HikeRepository hikes;
  private final HikeParticipantRepository participants;
  private final HikeMessageRepository messages;
  private final UserRepository usersRepository;
  private final UserService users;

  public HikeChatServiceImpl(
      HikeRepository hikes,
      HikeParticipantRepository participants,
      HikeMessageRepository messages,
      UserRepository usersRepository,
      UserService users) {
    this.hikes = hikes;
    this.participants = participants;
    this.messages = messages;
    this.usersRepository = usersRepository;
    this.users = users;
  }

  @Override
  @Transactional(readOnly = true)
  public List<HikeChatSummaryResponse> getChats(AuthenticatedUser principal) {
    UUID userId = users.resolveInternalId(principal);
    return hikes
        .findChatHikesByUserId(userId, HikeStatus.PUBLISHED, HikeParticipantStatus.JOINED)
        .stream()
        .map(
            hike ->
                new HikeChatSummaryResponse(
                    hike.getId(),
                    hike.getMountainName(),
                    hike.getLocationName(),
                    hike.getScheduledDate(),
                    1
                        + Math.toIntExact(
                            participants.countByHikeIdAndStatus(
                                hike.getId(), HikeParticipantStatus.JOINED))))
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<HikeChatMessageResponse> getMessages(UUID hikeId, AuthenticatedUser principal) {
    UUID userId = users.resolveInternalId(principal);
    Hike hike = findPublishedHike(hikeId);
    requireChatMember(hike, userId);

    List<HikeMessage> recentMessages =
        new ArrayList<>(messages.findTop100ByHikeIdOrderByCreatedAtDesc(hikeId));
    java.util.Collections.reverse(recentMessages);
    return toResponses(recentMessages, userId);
  }

  @Override
  @Transactional
  public HikeChatMessageResponse sendMessage(
      UUID hikeId, HikeChatMessageRequest request, AuthenticatedUser principal) {
    UUID userId = users.resolveInternalId(principal);
    Hike hike = findPublishedHike(hikeId);
    requireChatMember(hike, userId);
    User sender = findUser(userId);
    HikeMessage message =
        messages.saveAndFlush(
            HikeMessage.builder()
                .hikeId(hikeId)
                .senderId(userId)
                .body(request.body().trim())
                .build());
    return toResponse(message, sender.getDisplayName(), userId);
  }

  private List<HikeChatMessageResponse> toResponses(List<HikeMessage> hikeMessages, UUID viewerId) {
    Set<UUID> senderIds =
        hikeMessages.stream()
            .map(HikeMessage::getSenderId)
            .collect(java.util.stream.Collectors.toSet());
    Map<UUID, String> senderNames = new HashMap<>();
    usersRepository
        .findAllById(senderIds)
        .forEach(user -> senderNames.put(user.getId(), user.getDisplayName()));
    return hikeMessages.stream()
        .map(message -> toResponse(message, senderNames.get(message.getSenderId()), viewerId))
        .toList();
  }

  private HikeChatMessageResponse toResponse(
      HikeMessage message, String senderName, UUID viewerId) {
    return new HikeChatMessageResponse(
        message.getId(),
        message.getHikeId(),
        message.getSenderId(),
        senderName == null || senderName.isBlank() ? "Hiker" : senderName,
        message.getSenderId().equals(viewerId),
        message.getBody(),
        message.getCreatedAt());
  }

  private Hike findPublishedHike(UUID hikeId) {
    Hike hike =
        hikes.findById(hikeId).orElseThrow(() -> new ResourceNotFoundException("Hike not found"));
    if (hike.getStatus() != HikeStatus.PUBLISHED) {
      throw new ResourceNotFoundException("Hike not found");
    }
    return hike;
  }

  private void requireChatMember(Hike hike, UUID userId) {
    if (hike.getOrganizerId().equals(userId)) {
      return;
    }
    HikeParticipant participant =
        participants
            .findByHikeIdAndUserId(hike.getId(), userId)
            .orElseThrow(() -> new ForbiddenException("Join this hike to access its group chat"));
    if (participant.getStatus() != HikeParticipantStatus.JOINED) {
      throw new ForbiddenException("Join this hike to access its group chat");
    }
  }

  private User findUser(UUID userId) {
    return usersRepository
        .findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }
}
