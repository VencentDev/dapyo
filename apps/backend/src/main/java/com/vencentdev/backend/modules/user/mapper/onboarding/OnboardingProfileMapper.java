package com.vencentdev.backend.modules.user.mapper.onboarding;

import com.vencentdev.backend.modules.user.dto.onboarding.OnboardingProfileResponse;
import com.vencentdev.backend.modules.user.entity.OnboardingProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OnboardingProfileMapper {

  @Mapping(target = "completed", expression = "java(profile.getCompletedAt() != null)")
  OnboardingProfileResponse toResponse(OnboardingProfile profile);
}
