package com.vencentdev.backend.modules.hike.repository;

import com.vencentdev.backend.modules.hike.entity.HikeImage;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HikeImageRepository extends JpaRepository<HikeImage, UUID> {

  List<HikeImage> findByHikeIdOrderByDisplayOrderAscCreatedAtAsc(UUID hikeId);

  Optional<HikeImage> findByIdAndHikeId(UUID id, UUID hikeId);

  int countByHikeId(UUID hikeId);
}
