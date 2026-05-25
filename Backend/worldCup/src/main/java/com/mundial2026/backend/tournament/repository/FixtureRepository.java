package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface FixtureRepository extends JpaRepository<Fixture, Long> {

    List<Fixture> findByStatusOrderByKickoffAtAsc(FixtureStatus status);

    Optional<Fixture> findByExternalProviderId(Long externalProviderId);

    boolean existsByKickoffAtBetween(OffsetDateTime from, OffsetDateTime to);
}
