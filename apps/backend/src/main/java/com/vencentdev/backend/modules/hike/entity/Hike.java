package com.vencentdev.backend.modules.hike.entity;

import com.vencentdev.backend.common.persistence.AuditableEntity;
import com.vencentdev.backend.modules.hike.enums.HikeAdmissionMode;
import com.vencentdev.backend.modules.hike.enums.HikeStatus;
import com.vencentdev.backend.modules.user.enums.onboarding.TrailDifficulty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hikes")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Hike extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "organizer_id", nullable = false)
  private UUID organizerId;

  @Column(name = "location_name", nullable = false, length = 500)
  private String locationName;

  @Column(name = "mountain_name", nullable = false, length = 200)
  private String mountainName;

  @Column(name = "distance_km", precision = 7, scale = 2)
  private BigDecimal distanceKm;

  @Column(nullable = false, precision = 9, scale = 6)
  private BigDecimal latitude;

  @Column(nullable = false, precision = 9, scale = 6)
  private BigDecimal longitude;

  @Column(name = "scheduled_start_at", nullable = false)
  private Instant scheduledStartAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private TrailDifficulty difficulty;

  @Column(name = "max_participants", nullable = false)
  private int maxParticipants;

  @Column(name = "external_guest_count", nullable = false)
  private int externalGuestCount;

  @Enumerated(EnumType.STRING)
  @Column(name = "admission_mode", nullable = false, length = 24)
  private HikeAdmissionMode admissionMode;

  @Column(nullable = false, length = 4000)
  private String description;

  @Column(length = 4000)
  private String requirements;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  @Builder.Default
  private HikeStatus status = HikeStatus.PUBLISHED;
}
