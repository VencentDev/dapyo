package com.vencentdev.backend.modules.user.repository;

import com.vencentdev.backend.modules.user.entity.User;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByExternalId(String externalId);

  Optional<User> findByEmail(String email);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select user from User user where user.id = :id")
  Optional<User> findByIdForUpdate(@Param("id") UUID id);

  List<User> findTop20ByIdNotAndDisplayNameContainingIgnoreCaseOrderByDisplayNameAsc(
      UUID excludedUserId, String displayName);

  boolean existsByEmail(String email);
}
