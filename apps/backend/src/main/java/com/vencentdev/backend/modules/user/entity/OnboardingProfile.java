package com.vencentdev.backend.modules.user.entity;

import com.vencentdev.backend.common.persistence.AuditableEntity;
import com.vencentdev.backend.modules.user.enums.onboarding.AgeRange;
import com.vencentdev.backend.modules.user.enums.onboarding.ExperienceLevel;
import com.vencentdev.backend.modules.user.enums.onboarding.Interest;
import com.vencentdev.backend.modules.user.enums.onboarding.ReferralSource;
import com.vencentdev.backend.modules.user.enums.onboarding.TrailDifficulty;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_onboarding_profiles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class OnboardingProfile extends AuditableEntity {

  @Id
  @Column(name = "user_id", nullable = false)
  @EqualsAndHashCode.Include
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(name = "experience_level", length = 32)
  private ExperienceLevel experienceLevel;

  @Enumerated(EnumType.STRING)
  @Column(name = "preferred_difficulty", length = 32)
  private TrailDifficulty preferredDifficulty;

  @Column(name = "analytics_consent")
  private Boolean analyticsConsent;

  @Column(name = "analytics_consent_version", length = 64)
  private String analyticsConsentVersion;

  @Column(name = "analytics_consent_at")
  private Instant analyticsConsentAt;

  @Enumerated(EnumType.STRING)
  @Column(name = "age_range", length = 32)
  private AgeRange ageRange;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_onboarding_interests", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "interest", nullable = false, length = 32)
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private Set<Interest> interests = new LinkedHashSet<>();

  @Enumerated(EnumType.STRING)
  @Column(name = "referral_source", length = 32)
  private ReferralSource referralSource;

  @Column(name = "completed_at")
  private Instant completedAt;
}
