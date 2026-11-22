package com.vencentdev.backend.modules.user.service.onboarding;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.user.dto.UserResponse;
import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileRequest;
import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileResponse;
import com.vencentdev.backend.modules.user.entity.OnboardingProfile;
import com.vencentdev.backend.modules.user.mapper.onboarding.OnboardingProfileMapper;
import com.vencentdev.backend.modules.user.repository.OnboardingProfileRepository;
import com.vencentdev.backend.modules.user.service.UserService;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserOnboardingServiceImpl implements UserOnboardingService {

  private static final String ANALYTICS_CONSENT_VERSION = "onboarding-2026-11-v1";

  private final UserService users;
  private final OnboardingProfileRepository profiles;
  private final OnboardingProfileMapper mapper;

  public UserOnboardingServiceImpl(
      UserService users, OnboardingProfileRepository profiles, OnboardingProfileMapper mapper) {
    this.users = users;
    this.profiles = profiles;
    this.mapper = mapper;
  }

  @Override
  @Transactional
  public OnboardingProfileResponse get(AuthenticatedUser principal) {
    UserResponse user = users.findOrProvision(principal);
    return mapper.toResponse(findOrInitialize(user.id()));
  }

  @Override
  @Transactional
  public OnboardingProfileResponse save(
      AuthenticatedUser principal, OnboardingProfileRequest request) {
    UserResponse user = users.findOrProvision(principal);
    OnboardingProfile profile = findOrInitialize(user.id());
    profile.setExperienceLevel(request.experienceLevel());
    profile.setPreferredDifficulty(request.preferredDifficulty());

    if (request.analyticsConsent() != null) {
      profile.setAnalyticsConsent(request.analyticsConsent());
      profile.setCompletedAt(
          profile.getCompletedAt() == null ? Instant.now() : profile.getCompletedAt());
      if (request.analyticsConsent()) {
        profile.setAnalyticsConsentVersion(ANALYTICS_CONSENT_VERSION);
        profile.setAnalyticsConsentAt(Instant.now());
        profile.setAgeRange(request.ageRange());
        profile.setInterests(
            request.interests() == null
                ? new LinkedHashSet<>()
                : new LinkedHashSet<>(request.interests()));
        profile.setReferralSource(request.referralSource());
      } else {
        clearOptionalAnalytics(profile);
      }
    }

    return mapper.toResponse(profiles.save(profile));
  }

  @Override
  @Transactional
  public void initializeFor(UUID userId) {
    findOrInitialize(userId);
  }

  private OnboardingProfile findOrInitialize(UUID userId) {
    return profiles
        .findById(userId)
        .orElseGet(
            () ->
                profiles.save(
                    OnboardingProfile.builder()
                        .userId(userId)
                        .interests(new LinkedHashSet<>())
                        .build()));
  }

  private void clearOptionalAnalytics(OnboardingProfile profile) {
    profile.setAnalyticsConsentVersion(null);
    profile.setAnalyticsConsentAt(null);
    profile.setAgeRange(null);
    profile.setInterests(new LinkedHashSet<>());
    profile.setReferralSource(null);
  }
}
