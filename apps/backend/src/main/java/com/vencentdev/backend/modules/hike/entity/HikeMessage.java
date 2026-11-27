package com.vencentdev.backend.modules.hike.entity;

import com.vencentdev.backend.common.persistence.AuditableEntity;
import com.vencentdev.backend.modules.hike.enums.HikeMessageType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hike_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class HikeMessage extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "hike_id", nullable = false)
  private UUID hikeId;

  @Column(name = "sender_id", nullable = false)
  private UUID senderId;

  @Enumerated(EnumType.STRING)
  @Column(name = "message_type", nullable = false, length = 24)
  @Builder.Default
  private HikeMessageType messageType = HikeMessageType.MESSAGE;

  @Column(nullable = false, length = 2000)
  private String body;
}
