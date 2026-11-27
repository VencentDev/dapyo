package com.vencentdev.backend.modules.hike.repository;

import com.vencentdev.backend.modules.hike.entity.HikeLike;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HikeLikeRepository extends JpaRepository<HikeLike, UUID> {

  @Modifying
  @Query(
      value =
          "INSERT INTO hike_likes (hike_id, user_id) VALUES (:hikeId, :userId) "
              + "ON CONFLICT (hike_id, user_id) DO NOTHING",
      nativeQuery = true)
  int insertIfAbsent(@Param("hikeId") UUID hikeId, @Param("userId") UUID userId);

  @Modifying
  @Query(
      value = "DELETE FROM hike_likes WHERE hike_id = :hikeId AND user_id = :userId",
      nativeQuery = true)
  int deleteByHikeIdAndUserId(@Param("hikeId") UUID hikeId, @Param("userId") UUID userId);

  boolean existsByHikeIdAndUserId(UUID hikeId, UUID userId);

  long countByHikeId(UUID hikeId);

  @Query(
      "select hikeLike.hikeId as hikeId, count(hikeLike.id) as likeCount "
          + "from HikeLike hikeLike where hikeLike.hikeId in :hikeIds "
          + "group by hikeLike.hikeId")
  List<HikeLikeCount> findLikeCountsByHikeIds(@Param("hikeIds") Collection<UUID> hikeIds);

  @Query(
      "select hikeLike.hikeId from HikeLike hikeLike "
          + "where hikeLike.userId = :userId and hikeLike.hikeId in :hikeIds")
  List<UUID> findLikedHikeIdsByUserIdAndHikeIdIn(
      @Param("userId") UUID userId, @Param("hikeIds") Collection<UUID> hikeIds);

  interface HikeLikeCount {
    UUID getHikeId();

    long getLikeCount();
  }
}
