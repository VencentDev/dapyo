package com.vencentdev.backend.modules.hike.service;

import com.vencentdev.backend.common.web.PageResponse;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.hike.dto.HikeCreateRequest;
import com.vencentdev.backend.modules.hike.dto.HikeDetailResponse;
import com.vencentdev.backend.modules.hike.dto.HikeGuestCountUpdateRequest;
import com.vencentdev.backend.modules.hike.dto.HikeJoinRequestResponse;
import com.vencentdev.backend.modules.hike.dto.HikeLikeResponse;
import com.vencentdev.backend.modules.hike.dto.HikeMemberAddRequest;
import com.vencentdev.backend.modules.hike.dto.HikeSummaryResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface HikeService {

  HikeDetailResponse createHike(AuthenticatedUser principal, HikeCreateRequest request);

  PageResponse<HikeSummaryResponse> getUpcomingHikes(
      Pageable pageable, AuthenticatedUser principal);

  HikeDetailResponse getHike(UUID hikeId, AuthenticatedUser principal);

  HikeDetailResponse joinHike(UUID hikeId, AuthenticatedUser principal);

  HikeLikeResponse likeHike(UUID hikeId, AuthenticatedUser principal);

  HikeLikeResponse unlikeHike(UUID hikeId, AuthenticatedUser principal);

  List<HikeJoinRequestResponse> getJoinRequests(UUID hikeId, AuthenticatedUser principal);

  HikeDetailResponse acceptJoinRequest(UUID hikeId, UUID userId, AuthenticatedUser principal);

  void declineJoinRequest(UUID hikeId, UUID userId, AuthenticatedUser principal);

  HikeDetailResponse addTrailmate(
      UUID hikeId, HikeMemberAddRequest request, AuthenticatedUser principal);

  HikeDetailResponse updateGuestCount(
      UUID hikeId, HikeGuestCountUpdateRequest request, AuthenticatedUser principal);
}
