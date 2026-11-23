package com.vencentdev.backend.modules.user.controller.onboarding;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.CurrentUser;
import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileRequest;
import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileResponse;
import com.vencentdev.backend.modules.user.service.onboarding.UserOnboardingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/onboarding")
public class UserOnboardingController {

  private final UserOnboardingService onboarding;

  public UserOnboardingController(UserOnboardingService onboarding) {
    this.onboarding = onboarding;
  }

  @GetMapping
  public OnboardingProfileResponse get(@CurrentUser AuthenticatedUser user) {
    return onboarding.get(user);
  }

  @PutMapping
  public OnboardingProfileResponse save(
      @CurrentUser AuthenticatedUser user, @Valid @RequestBody OnboardingProfileRequest request) {
    return onboarding.save(user, request);
  }
}
