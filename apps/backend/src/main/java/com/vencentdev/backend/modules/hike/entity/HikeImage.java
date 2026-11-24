package com.vencentdev.backend.modules.hike.entity;

import com.vencentdev.backend.common.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import lombok.Setter;

@Entity
@Table(name = "hike_images")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class HikeImage extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "hike_id", nullable = false)
  private UUID hikeId;

  @Column(name = "storage_key", nullable = false, unique = true, length = 80)
  private String storageKey;

  @Column(name = "mime_type", nullable = false, length = 64)
  private String mimeType;

  @Column(name = "byte_size", nullable = false)
  private long byteSize;

  @Column(length = 500)
  private String caption;

  @Column(name = "display_order", nullable = false)
  private int displayOrder;
}
