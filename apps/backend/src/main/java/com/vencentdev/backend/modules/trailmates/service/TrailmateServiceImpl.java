package com.vencentdev.backend.modules.trailmates.service;

import com.vencentdev.backend.common.exception.BadRequestException;
import com.vencentdev.backend.common.exception.ConflictException;
import com.vencentdev.backend.common.exception.ForbiddenException;
import com.vencentdev.backend.common.exception.ResourceNotFoundException;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestCreateRequest;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestResponse;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestsResponse;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateResponse;
import com.vencentdev.backend.modules.trailmates.entity.TrailmateRelationship;
import com.vencentdev.backend.modules.trailmates.enums.TrailmateRelationshipStatus;
import com.vencentdev.backend.modules.trailmates.repository.TrailmateRelationshipRepository;
import com.vencentdev.backend.modules.user.entity.User;
import com.vencentdev.backend.modules.user.repository.UserRepository;
import com.vencentdev.backend.modules.user.service.UserService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrailmateServiceImpl implements TrailmateService {

  private final TrailmateRelationshipRepository relationships;
  private final UserRepository usersRepository;
  private final UserService users;

  public TrailmateServiceImpl(
      TrailmateRelationshipRepository relationships,
      UserRepository usersRepository,
      UserService users) {
    this.relationships = relationships;
    this.usersRepository = usersRepository;
    this.users = users;
  }

  @Override
  @Transactional
  public List<TrailmateResponse> getTrailmates(AuthenticatedUser principal) {
    UUID currentUserId = users.resolveInternalId(principal);
    List<TrailmateRelationship> connections =
        relationships
            .findByMemberAIdOrMemberBIdOrderByCreatedAtDesc(currentUserId, currentUserId)
            .stream()
            .filter(
                relationship -> relationship.getStatus() == TrailmateRelationshipStatus.ACCEPTED)
            .toList();
    Map<UUID, User> profiles = profilesFor(connections, currentUserId);

    return connections.stream()
        .map(
            relationship -> {
              UUID otherId = otherMemberId(relationship, currentUserId);
              User profile = profiles.get(otherId);
              return new TrailmateResponse(
                  otherId,
                  profile.getDisplayName(),
                  null,
                  timestampOrNow(relationship.getUpdatedAt()));
            })
        .sorted(
            Comparator.comparing(
                    TrailmateResponse::displayName,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                .thenComparing(TrailmateResponse::userId))
        .toList();
  }

  @Override
  @Transactional
  public TrailmateRequestsResponse getRequests(AuthenticatedUser principal) {
    UUID currentUserId = users.resolveInternalId(principal);
    List<TrailmateRelationship> pending =
        relationships
            .findByMemberAIdOrMemberBIdOrderByCreatedAtDesc(currentUserId, currentUserId)
            .stream()
            .filter(relationship -> relationship.getStatus() == TrailmateRelationshipStatus.PENDING)
            .toList();
    Map<UUID, User> profiles = profilesFor(pending, currentUserId);
    List<TrailmateRequestResponse> incoming = new ArrayList<>();
    List<TrailmateRequestResponse> outgoing = new ArrayList<>();

    for (TrailmateRelationship relationship : pending) {
      UUID otherId = otherMemberId(relationship, currentUserId);
      User profile = profiles.get(otherId);
      TrailmateRequestResponse response =
          new TrailmateRequestResponse(
              relationship.getId(),
              otherId,
              profile.getDisplayName(),
              null,
              timestampOrNow(relationship.getCreatedAt()));
      if (relationship.getRequesterId().equals(currentUserId)) {
        outgoing.add(response);
      } else {
        incoming.add(response);
      }
    }

    return new TrailmateRequestsResponse(List.copyOf(incoming), List.copyOf(outgoing));
  }

  @Override
  @Transactional
  public TrailmateRequestResponse sendRequest(
      AuthenticatedUser principal, TrailmateRequestCreateRequest request) {
    UUID requesterId = users.resolveInternalId(principal);
    UUID recipientId = request.userId();
    if (requesterId.equals(recipientId)) {
      throw new BadRequestException("You cannot send a Trailmates request to yourself");
    }

    MemberPair pair = lockPair(requesterId, recipientId);
    TrailmateRelationship relationship =
        relationships.findPairForUpdate(pair.memberAId(), pair.memberBId()).orElse(null);
    if (relationship == null) {
      relationship =
          relationships.saveAndFlush(
              TrailmateRelationship.builder()
                  .memberAId(pair.memberAId())
                  .memberBId(pair.memberBId())
                  .requesterId(requesterId)
                  .status(TrailmateRelationshipStatus.PENDING)
                  .build());
    } else if (relationship.getStatus() == TrailmateRelationshipStatus.DECLINED) {
      relationship.setRequesterId(requesterId);
      relationship.setStatus(TrailmateRelationshipStatus.PENDING);
      relationship = relationships.saveAndFlush(relationship);
    } else {
      throw new ConflictException("A pending request or Trailmates connection already exists");
    }

    User profile = usersRepository.findById(recipientId).orElseThrow();
    return new TrailmateRequestResponse(
        relationship.getId(),
        recipientId,
        profile.getDisplayName(),
        null,
        timestampOrNow(relationship.getCreatedAt()));
  }

  @Override
  @Transactional
  public void acceptRequest(AuthenticatedUser principal, UUID requestId) {
    UUID currentUserId = users.resolveInternalId(principal);
    TrailmateRelationship relationship = findPendingRequestForUpdate(requestId);
    requireRecipient(relationship, currentUserId);
    relationship.setStatus(TrailmateRelationshipStatus.ACCEPTED);
  }

  @Override
  @Transactional
  public void declineRequest(AuthenticatedUser principal, UUID requestId) {
    UUID currentUserId = users.resolveInternalId(principal);
    TrailmateRelationship relationship = findPendingRequestForUpdate(requestId);
    requireRecipient(relationship, currentUserId);
    relationship.setStatus(TrailmateRelationshipStatus.DECLINED);
  }

  @Override
  @Transactional
  public void removeTrailmate(AuthenticatedUser principal, UUID userId) {
    UUID currentUserId = users.resolveInternalId(principal);
    if (currentUserId.equals(userId)) {
      throw new BadRequestException("You cannot remove yourself as a Trailmate");
    }

    MemberPair pair = lockPair(currentUserId, userId);
    TrailmateRelationship relationship =
        relationships
            .findPairForUpdate(pair.memberAId(), pair.memberBId())
            .orElseThrow(() -> new ResourceNotFoundException("Trailmates connection not found"));
    if (relationship.getStatus() != TrailmateRelationshipStatus.ACCEPTED) {
      throw new ConflictException("Only accepted Trailmates connections can be removed");
    }
    relationships.delete(relationship);
  }

  @Override
  @Transactional(readOnly = true)
  public boolean areAcceptedConnections(UUID userId, Set<UUID> otherUserIds) {
    if (otherUserIds.isEmpty()) {
      return true;
    }
    Set<UUID> acceptedIds =
        relationships.findByMemberAIdOrMemberBIdOrderByCreatedAtDesc(userId, userId).stream()
            .filter(
                relationship -> relationship.getStatus() == TrailmateRelationshipStatus.ACCEPTED)
            .map(relationship -> otherMemberId(relationship, userId))
            .collect(Collectors.toSet());
    return acceptedIds.containsAll(otherUserIds);
  }

  private TrailmateRelationship findPendingRequestForUpdate(UUID requestId) {
    TrailmateRelationship relationship =
        relationships
            .findByIdForUpdate(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Trailmates request not found"));
    if (relationship.getStatus() != TrailmateRelationshipStatus.PENDING) {
      throw new ConflictException("This Trailmates request is no longer pending");
    }
    return relationship;
  }

  private void requireRecipient(TrailmateRelationship relationship, UUID currentUserId) {
    if (relationship.getRequesterId().equals(currentUserId)) {
      throw new ForbiddenException("Only the recipient can respond to this Trailmates request");
    }
    if (!relationship.getMemberAId().equals(currentUserId)
        && !relationship.getMemberBId().equals(currentUserId)) {
      throw new ForbiddenException("You cannot manage this Trailmates request");
    }
  }

  private MemberPair lockPair(UUID firstUserId, UUID secondUserId) {
    MemberPair pair = orderedPair(firstUserId, secondUserId);
    usersRepository
        .findByIdForUpdate(pair.memberAId())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    usersRepository
        .findByIdForUpdate(pair.memberBId())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    return pair;
  }

  private MemberPair orderedPair(UUID firstUserId, UUID secondUserId) {
    if (firstUserId.toString().compareTo(secondUserId.toString()) < 0) {
      return new MemberPair(firstUserId, secondUserId);
    }
    return new MemberPair(secondUserId, firstUserId);
  }

  private Map<UUID, User> profilesFor(List<TrailmateRelationship> rows, UUID currentUserId) {
    List<UUID> otherIds =
        rows.stream().map(row -> otherMemberId(row, currentUserId)).distinct().toList();
    Map<UUID, User> profiles = new HashMap<>();
    usersRepository.findAllById(otherIds).forEach(user -> profiles.put(user.getId(), user));
    return profiles;
  }

  private UUID otherMemberId(TrailmateRelationship relationship, UUID currentUserId) {
    return relationship.getMemberAId().equals(currentUserId)
        ? relationship.getMemberBId()
        : relationship.getMemberAId();
  }

  private Instant timestampOrNow(Instant timestamp) {
    return timestamp == null ? Instant.now() : timestamp;
  }

  private record MemberPair(UUID memberAId, UUID memberBId) {}
}
