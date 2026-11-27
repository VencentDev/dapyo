package com.vencentdev.backend.modules.hike.repository;

import com.vencentdev.backend.modules.hike.entity.HikeMessage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HikeMessageRepository extends JpaRepository<HikeMessage, UUID> {

  List<HikeMessage> findTop100ByHikeIdOrderByCreatedAtDesc(UUID hikeId);
}
