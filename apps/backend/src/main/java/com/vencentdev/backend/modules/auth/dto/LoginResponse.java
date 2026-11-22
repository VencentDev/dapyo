package com.vencentdev.backend.modules.auth.dto;

import com.vencentdev.backend.modules.user.dto.UserResponse;

public record LoginResponse(
    UserResponse user, String accessToken, String tokenType, long expiresIn) {}
