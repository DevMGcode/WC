package com.mundial2026.backend.push.repository;

import com.mundial2026.backend.push.domain.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByUserId(Long userId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    boolean existsByEndpoint(String endpoint);

    void deleteByEndpoint(String endpoint);
}
