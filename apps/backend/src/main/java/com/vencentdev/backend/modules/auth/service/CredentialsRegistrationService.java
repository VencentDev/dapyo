package com.vencentdev.backend.modules.auth.service;

import com.vencentdev.backend.modules.auth.dto.RegisterRequest;
import com.vencentdev.backend.modules.user.dto.UserResponse;
import com.vencentdev.backend.modules.user.service.UserService;
import com.vencentdev.backend.modules.user.service.onboarding.UserOnboardingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CredentialsRegistrationService {

  private final UserService users;
  private final UserOnboardingService onboarding;

  public CredentialsRegistrationService(UserService users, UserOnboardingService onboarding) {
    this.users = users;
    this.onboarding = onboarding;
  }

  @Transactional
  public UserResponse register(RegisterRequest request) {
    UserResponse user = users.register(request);
    onboarding.initializeFor(user.id());
    return user;
  }
}
