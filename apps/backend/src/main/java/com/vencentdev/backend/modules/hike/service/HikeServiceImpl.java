package com.vencentdev.backend.modules.hike.service;

import com.vencentdev.backend.common.exception.BadRequestException;
import com.vencentdev.backend.common.exception.ConflictException;
import com.vencentdev.backend.common.exception.ForbiddenException;
import com.vencentdev.backend.common.exception.ResourceNotFoundException;
import com.vencentdev.backend.common.web.PageResponse;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.hike.dto.HikeCreateRequest;
import com.vencentdev.backend.modules.hike.dto.HikeDetailResponse;
import com.vencentdev.backend.modules.hike.dto.HikeGuestCountUpdateRequest;
import com.vencentdev.backend.modules.hike.dto.HikeImageResponse;
import com.vencentdev.backend.modules.hike.dto.HikeJoinRequestResponse;
import com.vencentdev.backend.modules.hike.dto.HikeLikeResponse;
import com.vencentdev.backend.modules.hike.dto.HikeMemberAddRequest;
import com.vencentdev.backend.modules.hike.dto.HikeParticipantResponse;
import com.vencentdev.backend.modules.hike.dto.HikeSummaryResponse;
import com.vencentdev.backend.modules.hike.dto.HikeViewerStatus;
import com.vencentdev.backend.modules.hike.dto.PublicHikerResponse;
import com.vencentdev.backend.modules.hike.entity.Hike;
import com.vencentdev.backend.modules.hike.entity.HikeMessage;
import com.vencentdev.backend.modules.hike.entity.HikeParticipant;
import com.vencentdev.backend.modules.hike.enums.HikeAdmissionMode;
import com.vencentdev.backend.modules.hike.enums.HikeMessageType;
import com.vencentdev.backend.modules.hike.enums.HikeParticipantStatus;
import com.vencentdev.backend.modules.hike.enums.HikeStatus;
import com.vencentdev.backend.modules.hike.repository.HikeImageRepository;
import com.vencentdev.backend.modules.hike.repository.HikeLikeRepository;
import com.vencentdev.backend.modules.hike.repository.HikeMessageRepository;
import com.vencentdev.backend.modules.hike.repository.HikeParticipantRepository;
import com.vencentdev.backend.modules.hike.repository.HikeRepository;
import com.vencentdev.backend.modules.trailmates.service.TrailmateService;
import com.vencentdev.backend.modules.user.entity.User;
import com.vencentdev.backend.modules.user.repository.UserRepository;
import com.vencentdev.backend.modules.user.service.UserService;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.StreamSupport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HikeServiceImpl implements HikeService {

  private static final ZoneId HIKES_ZONE = ZoneId.of("Asia/Manila");

  private final HikeRepository hikes;
  private final HikeParticipantRepository participants;
  private final HikeImageRepository images;
  private final HikeLikeRepository likes;
  private final HikeMessageRepository messages;
  private final UserRepository usersRepository;
  private final UserService users;
  private final TrailmateService trailmates;

  public HikeServiceImpl(
      HikeRepository hikes,
      HikeParticipantRepository participants,
      HikeImageRepository images,
      HikeLikeRepository likes,
      HikeMessageRepository messages,
      UserRepository usersRepository,
      UserService users,
      TrailmateService trailmates) {
    this.hikes = hikes;
    this.participants = participants;
    this.images = images;
    this.likes = likes;
    this.messages = messages;
    this.usersRepository = usersRepository;
    this.users = users;
    this.trailmates = trailmates;
  }

  @Override
  @Transactional
  public HikeDetailResponse createHike(AuthenticatedUser principal, HikeCreateRequest request) {
    if (!request.scheduledDate().isAfter(LocalDate.now(HIKES_ZONE))) {
      throw new BadRequestException("Hike date must be in the future");
    }

    UUID organizerId = users.resolveInternalId(principal);
    List<UUID> memberIds = request.initialMemberIds();
    LinkedHashSet<UUID> uniqueMemberIds = new LinkedHashSet<>(memberIds);
    if (uniqueMemberIds.size() != memberIds.size()) {
      throw new BadRequestException("Each Trailmate can only be added once");
    }
    if (uniqueMemberIds.contains(organizerId)) {
      throw new BadRequestException("The organizer is already included in the group size");
    }

    List<User> selectedUsers =
        StreamSupport.stream(usersRepository.findAllById(uniqueMemberIds).spliterator(), false)
            .toList();
    if (selectedUsers.size() != uniqueMemberIds.size()) {
      throw new ResourceNotFoundException("One or more selected hikers were not found");
    }
    if (!trailmates.areAcceptedConnections(organizerId, uniqueMemberIds)) {
      throw new BadRequestException("Only accepted Trailmates can be added to a hike");
    }
    if (1L + uniqueMemberIds.size() + request.externalGuestCount() > request.maxParticipants()) {
      throw new BadRequestException("The selected group is larger than the hike capacity");
    }
    List<String> guestNames =
        request.externalGuestNames() == null
            ? List.of()
            : request.externalGuestNames().stream().map(String::trim).toList();
    if (guestNames.size() > request.externalGuestCount()) {
      throw new BadRequestException("Guest names cannot exceed the guest count");
    }

    Hike hike =
        hikes.save(
            Hike.builder()
                .organizerId(organizerId)
                .locationName(request.locationName().trim())
                .mountainName(request.mountainName().trim())
                .distanceKm(
                    request.distanceKm() == null
                        ? null
                        : request.distanceKm().setScale(2, RoundingMode.HALF_UP))
                .latitude(request.latitude().setScale(6, RoundingMode.HALF_UP))
                .longitude(request.longitude().setScale(6, RoundingMode.HALF_UP))
                .scheduledDate(request.scheduledDate())
                .difficulty(request.difficulty())
                .difficultyRating(difficultyRating(request))
                .maxParticipants(request.maxParticipants())
                .externalGuestCount(request.externalGuestCount())
                .externalGuestNames(guestNames)
                .admissionMode(request.admissionMode())
                .description(request.description().trim())
                .requirements(normalizeOptionalText(request.requirements()))
                .status(HikeStatus.PUBLISHED)
                .build());
    Instant joinedAt = Instant.now();
    participants.saveAll(
        uniqueMemberIds.stream()
            .map(
                userId ->
                    HikeParticipant.builder()
                        .hikeId(hike.getId())
                        .userId(userId)
                        .status(HikeParticipantStatus.JOINED)
                        .joinedAt(joinedAt)
                        .build())
            .toList());

    return toDetail(hike, organizerId);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<HikeSummaryResponse> getUpcomingHikes(
      Pageable pageable, AuthenticatedUser principal) {
    Pageable boundedPageable =
        PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 50));
    Page<Hike> page =
        hikes.findByStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAsc(
            HikeStatus.PUBLISHED, LocalDate.now(HIKES_ZONE), boundedPageable);
    List<UUID> hikeIds = page.getContent().stream().map(Hike::getId).toList();
    Map<UUID, Long> likeCounts = new HashMap<>();
    if (!hikeIds.isEmpty()) {
      likes
          .findLikeCountsByHikeIds(hikeIds)
          .forEach(likeCount -> likeCounts.put(likeCount.getHikeId(), likeCount.getLikeCount()));
    }
    UUID viewerId = resolveViewerId(principal);
    Set<UUID> likedHikeIds =
        viewerId == null || hikeIds.isEmpty()
            ? Set.of()
            : new HashSet<>(likes.findLikedHikeIdsByUserIdAndHikeIdIn(viewerId, hikeIds));
    return PageResponse.from(
        page.map(
            hike ->
                toSummary(
                    hike,
                    likeCounts.getOrDefault(hike.getId(), 0L),
                    likedHikeIds.contains(hike.getId()))));
  }

  @Override
  @Transactional(readOnly = true)
  public HikeDetailResponse getHike(UUID hikeId, AuthenticatedUser principal) {
    Hike hike = findPublishedHike(hikeId);
    return toDetail(hike, resolveViewerId(principal));
  }

  @Override
  @Transactional
  public HikeDetailResponse joinHike(UUID hikeId, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    UUID userId = users.resolveInternalId(principal);
    if (hike.getOrganizerId().equals(userId)) {
      throw new ConflictException("You are already organizing this hike");
    }
    if (hike.getScheduledDate().isBefore(LocalDate.now(HIKES_ZONE))) {
      throw new ConflictException("This hike has already started");
    }
    ensureAvailablePlace(hike);

    HikeParticipant participant = participants.findByHikeIdAndUserId(hikeId, userId).orElse(null);
    if (participant != null
        && (participant.getStatus() == HikeParticipantStatus.JOINED
            || participant.getStatus() == HikeParticipantStatus.PENDING)) {
      throw new ConflictException("You have already joined or requested this hike");
    }

    HikeParticipantStatus nextStatus =
        hike.getAdmissionMode() == HikeAdmissionMode.OPEN
            ? HikeParticipantStatus.JOINED
            : HikeParticipantStatus.PENDING;
    if (participant == null) {
      participant =
          HikeParticipant.builder()
              .hikeId(hikeId)
              .userId(userId)
              .status(nextStatus)
              .joinedAt(nextStatus == HikeParticipantStatus.JOINED ? Instant.now() : null)
              .build();
    } else {
      participant.setStatus(nextStatus);
      participant.setJoinedAt(nextStatus == HikeParticipantStatus.JOINED ? Instant.now() : null);
    }
    participants.save(participant);
    if (nextStatus == HikeParticipantStatus.JOINED) {
      recordMemberJoined(hike, userId);
    }
    return toDetail(hike, userId);
  }

  @Override
  @Transactional
  public HikeLikeResponse likeHike(UUID hikeId, AuthenticatedUser principal) {
    findPublishedHike(hikeId);
    UUID userId = users.resolveInternalId(principal);
    likes.insertIfAbsent(hikeId, userId);
    return toLikeResponse(hikeId, true);
  }

  @Override
  @Transactional
  public HikeLikeResponse unlikeHike(UUID hikeId, AuthenticatedUser principal) {
    findPublishedHike(hikeId);
    UUID userId = users.resolveInternalId(principal);
    likes.deleteByHikeIdAndUserId(hikeId, userId);
    return toLikeResponse(hikeId, false);
  }

  @Override
  @Transactional
  public List<HikeJoinRequestResponse> getJoinRequests(UUID hikeId, AuthenticatedUser principal) {
    UUID organizerId = users.resolveInternalId(principal);
    Hike hike = findPublishedHike(hikeId);
    requireOrganizer(hike, organizerId);
    return participants
        .findByHikeIdAndStatusOrderByCreatedAtAsc(hikeId, HikeParticipantStatus.PENDING)
        .stream()
        .map(
            participant -> {
              User user = findUser(participant.getUserId());
              return new HikeJoinRequestResponse(
                  user.getId(),
                  user.getDisplayName(),
                  null,
                  timestampOrNow(participant.getCreatedAt()));
            })
        .toList();
  }

  @Override
  @Transactional
  public HikeDetailResponse acceptJoinRequest(
      UUID hikeId, UUID userId, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    requireOrganizer(hike, users.resolveInternalId(principal));
    HikeParticipant participant = findParticipant(hikeId, userId);
    if (participant.getStatus() != HikeParticipantStatus.PENDING) {
      throw new ConflictException("This join request is no longer pending");
    }
    ensureAvailablePlace(hike);
    participant.setStatus(HikeParticipantStatus.JOINED);
    participant.setJoinedAt(Instant.now());
    participants.save(participant);
    recordMemberJoined(hike, userId);
    return toDetail(hike, hike.getOrganizerId());
  }

  @Override
  @Transactional
  public void declineJoinRequest(UUID hikeId, UUID userId, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    requireOrganizer(hike, users.resolveInternalId(principal));
    HikeParticipant participant = findParticipant(hikeId, userId);
    if (participant.getStatus() != HikeParticipantStatus.PENDING) {
      throw new ConflictException("This join request is no longer pending");
    }
    participant.setStatus(HikeParticipantStatus.DECLINED);
    participants.save(participant);
  }

  @Override
  @Transactional
  public HikeDetailResponse addTrailmate(
      UUID hikeId, HikeMemberAddRequest request, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    UUID organizerId = users.resolveInternalId(principal);
    requireOrganizer(hike, organizerId);
    if (organizerId.equals(request.userId())) {
      throw new BadRequestException("The organizer is already included in the group size");
    }
    User member = findUser(request.userId());
    if (!trailmates.areAcceptedConnections(organizerId, Set.of(request.userId()))) {
      throw new BadRequestException("Only accepted Trailmates can be added to a hike");
    }
    ensureAvailablePlace(hike);

    HikeParticipant participant =
        participants.findByHikeIdAndUserId(hikeId, request.userId()).orElse(null);
    if (participant != null
        && (participant.getStatus() == HikeParticipantStatus.JOINED
            || participant.getStatus() == HikeParticipantStatus.PENDING)) {
      throw new ConflictException("This hiker is already in the group");
    }
    if (participant == null) {
      participant =
          HikeParticipant.builder()
              .hikeId(hikeId)
              .userId(request.userId())
              .status(HikeParticipantStatus.JOINED)
              .joinedAt(Instant.now())
              .build();
    } else {
      participant.setStatus(HikeParticipantStatus.JOINED);
      participant.setJoinedAt(Instant.now());
    }
    participants.save(participant);
    recordMemberJoined(hike, member.getId());
    return toDetail(hike, organizerId);
  }

  @Override
  @Transactional
  public HikeDetailResponse updateGuestCount(
      UUID hikeId, HikeGuestCountUpdateRequest request, AuthenticatedUser principal) {
    Hike hike = findPublishedHikeForUpdate(hikeId);
    requireOrganizer(hike, users.resolveInternalId(principal));
    if (1L + joinedCount(hikeId) + request.externalGuestCount() > hike.getMaxParticipants()) {
      throw new ConflictException("The guest count would put the hike over capacity");
    }
    hike.setExternalGuestCount(request.externalGuestCount());
    if (hike.getExternalGuestNames().size() > request.externalGuestCount()) {
      hike.setExternalGuestNames(
          List.copyOf(hike.getExternalGuestNames().subList(0, request.externalGuestCount())));
    }
    return toDetail(hike, hike.getOrganizerId());
  }

  private HikeSummaryResponse toSummary(Hike hike, long likeCount, boolean likedByCurrentUser) {
    int joined = joinedCount(hike.getId());
    return new HikeSummaryResponse(
        hike.getId(),
        hike.getLocationName(),
        hike.getMountainName(),
        hike.getDistanceKm(),
        hike.getLatitude(),
        hike.getLongitude(),
        hike.getScheduledDate(),
        hike.getDifficulty(),
        hike.getDifficultyRating(),
        hike.getMaxParticipants(),
        joined,
        hike.getExternalGuestCount(),
        likeCount,
        likedByCurrentUser,
        availablePlaces(hike, joined),
        hike.getAdmissionMode(),
        toPublicHiker(findUser(hike.getOrganizerId())));
  }

  private HikeDetailResponse toDetail(Hike hike, UUID viewerId) {
    List<HikeParticipant> joinedParticipants =
        participants.findByHikeIdAndStatusOrderByCreatedAtAsc(
            hike.getId(), HikeParticipantStatus.JOINED);
    List<HikeParticipantResponse> participantResponses =
        joinedParticipants.stream()
            .map(
                participant -> {
                  User user = findUser(participant.getUserId());
                  return new HikeParticipantResponse(
                      user.getId(), user.getDisplayName(), null, participant.getJoinedAt());
                })
            .toList();
    List<HikeImageResponse> imageResponses =
        images.findByHikeIdOrderByDisplayOrderAscCreatedAtAsc(hike.getId()).stream()
            .map(
                image ->
                    new HikeImageResponse(
                        image.getId(),
                        "/api/v1/hikes/" + hike.getId() + "/images/" + image.getId(),
                        image.getCaption(),
                        image.getMimeType(),
                        image.getByteSize(),
                        image.getDisplayOrder()))
            .toList();
    int joinedCount = joinedParticipants.size();

    return new HikeDetailResponse(
        hike.getId(),
        hike.getLocationName(),
        hike.getMountainName(),
        hike.getDistanceKm(),
        hike.getLatitude(),
        hike.getLongitude(),
        hike.getScheduledDate(),
        hike.getDifficulty(),
        hike.getDifficultyRating(),
        hike.getMaxParticipants(),
        joinedCount,
        hike.getExternalGuestCount(),
        hike.getExternalGuestNames(),
        likes.countByHikeId(hike.getId()),
        viewerId != null && likes.existsByHikeIdAndUserId(hike.getId(), viewerId),
        availablePlaces(hike, joinedCount),
        hike.getAdmissionMode(),
        hike.getDescription(),
        hike.getRequirements(),
        toPublicHiker(findUser(hike.getOrganizerId())),
        participantResponses,
        imageResponses,
        viewerStatus(hike, viewerId));
  }

  private HikeLikeResponse toLikeResponse(UUID hikeId, boolean likedByCurrentUser) {
    return new HikeLikeResponse(hikeId, likes.countByHikeId(hikeId), likedByCurrentUser);
  }

  private void recordMemberJoined(Hike hike, UUID userId) {
    messages.save(
        HikeMessage.builder()
            .hikeId(hike.getId())
            .senderId(userId)
            .messageType(HikeMessageType.MEMBER_JOINED)
            .body("joined the hike")
            .build());
  }

  private UUID resolveViewerId(AuthenticatedUser principal) {
    return principal == null
        ? null
        : usersRepository.findByExternalId(principal.subject()).map(User::getId).orElse(null);
  }

  private HikeViewerStatus viewerStatus(Hike hike, UUID viewerId) {
    if (viewerId == null) {
      return null;
    }
    if (hike.getOrganizerId().equals(viewerId)) {
      return HikeViewerStatus.HOST;
    }
    return participants
        .findByHikeIdAndUserId(hike.getId(), viewerId)
        .map(
            participant ->
                switch (participant.getStatus()) {
                  case JOINED -> HikeViewerStatus.JOINED;
                  case PENDING -> HikeViewerStatus.PENDING;
                  case DECLINED, REMOVED -> HikeViewerStatus.NOT_JOINED;
                })
        .orElse(HikeViewerStatus.NOT_JOINED);
  }

  private Hike findPublishedHike(UUID hikeId) {
    Hike hike =
        hikes.findById(hikeId).orElseThrow(() -> new ResourceNotFoundException("Hike not found"));
    if (hike.getStatus() != HikeStatus.PUBLISHED) {
      throw new ResourceNotFoundException("Hike not found");
    }
    return hike;
  }

  private Hike findPublishedHikeForUpdate(UUID hikeId) {
    Hike hike =
        hikes
            .findByIdForUpdate(hikeId)
            .orElseThrow(() -> new ResourceNotFoundException("Hike not found"));
    if (hike.getStatus() != HikeStatus.PUBLISHED) {
      throw new ResourceNotFoundException("Hike not found");
    }
    return hike;
  }

  private HikeParticipant findParticipant(UUID hikeId, UUID userId) {
    return participants
        .findByHikeIdAndUserId(hikeId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Hike join request not found"));
  }

  private User findUser(UUID userId) {
    return usersRepository
        .findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  private PublicHikerResponse toPublicHiker(User user) {
    return new PublicHikerResponse(user.getId(), user.getDisplayName(), null);
  }

  private int joinedCount(UUID hikeId) {
    return Math.toIntExact(
        participants.countByHikeIdAndStatus(hikeId, HikeParticipantStatus.JOINED));
  }

  private int availablePlaces(Hike hike, int joinedCount) {
    return hike.getMaxParticipants() - 1 - joinedCount - hike.getExternalGuestCount();
  }

  private int difficultyRating(HikeCreateRequest request) {
    if (request.difficultyRating() != null) {
      return request.difficultyRating();
    }
    return switch (request.difficulty()) {
      case EASY -> 2;
      case MODERATE -> 3;
      case CHALLENGING -> 5;
    };
  }

  private void ensureAvailablePlace(Hike hike) {
    if (availablePlaces(hike, joinedCount(hike.getId())) <= 0) {
      throw new ConflictException("This hike is full");
    }
  }

  private void requireOrganizer(Hike hike, UUID userId) {
    if (!hike.getOrganizerId().equals(userId)) {
      throw new ForbiddenException("Only the organizer can manage this hike");
    }
  }

  private String normalizeOptionalText(String text) {
    if (text == null || text.isBlank()) {
      return null;
    }
    return text.trim();
  }

  private Instant timestampOrNow(Instant timestamp) {
    return timestamp == null ? Instant.now() : timestamp;
  }
}
