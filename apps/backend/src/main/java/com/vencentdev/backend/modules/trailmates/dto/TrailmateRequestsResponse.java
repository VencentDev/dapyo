package com.vencentdev.backend.modules.trailmates.dto;

import java.util.List;

public record TrailmateRequestsResponse(
    List<TrailmateRequestResponse> incoming, List<TrailmateRequestResponse> outgoing) {}
