package com.vencentdev.backend.modules.user.repository;

import com.vencentdev.backend.modules.user.entity.OnboardingProfile;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OnboardingProfileRepository extends JpaRepository<OnboardingProfile, UUID> {}
