package com.vencentdev.backend.modules.trailmates.repository;

import com.vencentdev.backend.modules.trailmates.entity.TrailmateRelationship;
import com.vencentdev.backend.modules.trailmates.enums.TrailmateRelationshipStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrailmateRelationshipRepository
    extends JpaRepository<TrailmateRelationship, UUID> {

  Optional<TrailmateRelationship> findByMemberAIdAndMemberBId(UUID memberAId, UUID memberBId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query(
      "select relationship from TrailmateRelationship relationship "
          + "where relationship.memberAId = :memberAId and relationship.memberBId = :memberBId")
  Optional<TrailmateRelationship> findPairForUpdate(
      @Param("memberAId") UUID memberAId, @Param("memberBId") UUID memberBId);

  List<TrailmateRelationship> findByMemberAIdOrMemberBIdOrderByCreatedAtDesc(
      UUID memberAId, UUID memberBId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select relationship from TrailmateRelationship relationship where relationship.id = :id")
  Optional<TrailmateRelationship> findByIdForUpdate(@Param("id") UUID id);

  boolean existsByMemberAIdAndMemberBIdAndStatus(
      UUID memberAId, UUID memberBId, TrailmateRelationshipStatus status);
}
