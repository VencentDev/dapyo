package com.vencentdev.backend.modules.user.service.onboarding;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileRequest;
import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileResponse;
import java.util.UUID;

public interface UserOnboardingService {

  OnboardingProfileResponse get(AuthenticatedUser principal);

  OnboardingProfileResponse save(AuthenticatedUser principal, OnboardingProfileRequest request);

  void initializeFor(UUID userId);
}
