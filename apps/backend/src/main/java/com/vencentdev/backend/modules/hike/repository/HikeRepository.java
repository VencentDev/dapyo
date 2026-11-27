package com.vencentdev.backend.modules.hike.repository;

import com.vencentdev.backend.modules.hike.entity.Hike;
import com.vencentdev.backend.modules.hike.enums.HikeParticipantStatus;
import com.vencentdev.backend.modules.hike.enums.HikeStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HikeRepository extends JpaRepository<Hike, UUID> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select hike from Hike hike where hike.id = :id")
  Optional<Hike> findByIdForUpdate(@Param("id") UUID id);

  Page<Hike> findByStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAsc(
      HikeStatus status, LocalDate date, Pageable pageable);

  @Query(
      "select hike from Hike hike where hike.status = :status and "
          + "(hike.organizerId = :userId or exists "
          + "(select participant.id from HikeParticipant participant "
          + "where participant.hikeId = hike.id and participant.userId = :userId "
          + "and participant.status = :joinedStatus)) "
          + "order by hike.scheduledDate asc")
  List<Hike> findChatHikesByUserId(
      @Param("userId") UUID userId,
      @Param("status") HikeStatus status,
      @Param("joinedStatus") HikeParticipantStatus joinedStatus);
}
