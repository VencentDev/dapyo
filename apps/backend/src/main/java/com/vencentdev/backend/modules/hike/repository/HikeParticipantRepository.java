package com.vencentdev.backend.modules.hike.repository;

import com.vencentdev.backend.modules.hike.entity.HikeParticipant;
import com.vencentdev.backend.modules.hike.enums.HikeParticipantStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HikeParticipantRepository extends JpaRepository<HikeParticipant, UUID> {

  List<HikeParticipant> findByHikeIdOrderByCreatedAtAsc(UUID hikeId);

  List<HikeParticipant> findByHikeIdAndStatusOrderByCreatedAtAsc(
      UUID hikeId, HikeParticipantStatus status);

  Optional<HikeParticipant> findByHikeIdAndUserId(UUID hikeId, UUID userId);

  long countByHikeIdAndStatus(UUID hikeId, HikeParticipantStatus status);
}
