package com.vencentdev.backend.modules.user.service;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.dto.LoginRequest;
import com.vencentdev.backend.modules.auth.dto.RegisterRequest;
import com.vencentdev.backend.modules.user.dto.PublicUserSearchResponse;
import com.vencentdev.backend.modules.user.dto.UserResponse;
import com.vencentdev.backend.modules.user.dto.UserUpdateRequest;
import java.util.List;
import java.util.UUID;

public interface UserService {

  UserResponse findOrProvision(AuthenticatedUser principal);

  UserResponse register(RegisterRequest request);

  UserResponse authenticate(LoginRequest request);

  UserResponse getMe(AuthenticatedUser principal);

  UserResponse updateMe(AuthenticatedUser principal, UserUpdateRequest request);

  List<PublicUserSearchResponse> searchPublicProfiles(AuthenticatedUser principal, String query);

  UUID resolveInternalId(AuthenticatedUser principal);
}
