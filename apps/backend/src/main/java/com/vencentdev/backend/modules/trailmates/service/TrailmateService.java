package com.vencentdev.backend.modules.trailmates.service;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestCreateRequest;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestResponse;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestsResponse;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateResponse;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TrailmateService {

  List<TrailmateResponse> getTrailmates(AuthenticatedUser principal);

  TrailmateRequestsResponse getRequests(AuthenticatedUser principal);

  TrailmateRequestResponse sendRequest(
      AuthenticatedUser principal, TrailmateRequestCreateRequest request);

  void acceptRequest(AuthenticatedUser principal, UUID requestId);

  void declineRequest(AuthenticatedUser principal, UUID requestId);

  void removeTrailmate(AuthenticatedUser principal, UUID userId);

  boolean areAcceptedConnections(UUID userId, Set<UUID> otherUserIds);
}
