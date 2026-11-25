package com.vencentdev.backend.modules.trailmates.controller;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.CurrentUser;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestCreateRequest;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestResponse;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateRequestsResponse;
import com.vencentdev.backend.modules.trailmates.dto.TrailmateResponse;
import com.vencentdev.backend.modules.trailmates.service.TrailmateService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/trailmates")
public class TrailmateController {

  private final TrailmateService trailmates;

  public TrailmateController(TrailmateService trailmates) {
    this.trailmates = trailmates;
  }

  @GetMapping
  public List<TrailmateResponse> getTrailmates(@CurrentUser AuthenticatedUser user) {
    return trailmates.getTrailmates(user);
  }

  @GetMapping("/requests")
  public TrailmateRequestsResponse getRequests(@CurrentUser AuthenticatedUser user) {
    return trailmates.getRequests(user);
  }

  @PostMapping("/requests")
  @ResponseStatus(HttpStatus.CREATED)
  public TrailmateRequestResponse sendRequest(
      @CurrentUser AuthenticatedUser user,
      @Valid @RequestBody TrailmateRequestCreateRequest request) {
    return trailmates.sendRequest(user, request);
  }

  @PostMapping("/requests/{id}/accept")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void acceptRequest(@CurrentUser AuthenticatedUser user, @PathVariable UUID id) {
    trailmates.acceptRequest(user, id);
  }

  @PostMapping("/requests/{id}/decline")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void declineRequest(@CurrentUser AuthenticatedUser user, @PathVariable UUID id) {
    trailmates.declineRequest(user, id);
  }

  @DeleteMapping("/{userId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void removeTrailmate(@CurrentUser AuthenticatedUser user, @PathVariable UUID userId) {
    trailmates.removeTrailmate(user, userId);
  }
}
