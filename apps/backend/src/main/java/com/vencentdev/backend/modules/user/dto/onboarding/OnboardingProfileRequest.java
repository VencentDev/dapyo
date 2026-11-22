package com.vencentdev.backend.modules.user.dto.onboarding;

import com.vencentdev.backend.modules.user.enums.onboarding.AgeRange;
import com.vencentdev.backend.modules.user.enums.onboarding.ExperienceLevel;
import com.vencentdev.backend.modules.user.enums.onboarding.Interest;
import com.vencentdev.backend.modules.user.enums.onboarding.ReferralSource;
import com.vencentdev.backend.modules.user.enums.onboarding.TrailDifficulty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record OnboardingProfileRequest(
    @NotNull ExperienceLevel experienceLevel,
    @NotNull TrailDifficulty preferredDifficulty,
    Boolean analyticsConsent,
    AgeRange ageRange,
    Set<Interest> interests,
    ReferralSource referralSource) {}
