package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface FixtureRepository extends JpaRepository<Fixture, Long> {
    List<Fixture> findByStatusOrderByKickoffAtAsc(FixtureStatus status);

    @EntityGraph(attributePaths = {"tournament", "stage", "groupStage", "venue", "homeTeam", "awayTeam"})
    List<Fixture> findByTournamentIdOrderByKickoffAtAsc(Long tournamentId);

    @EntityGraph(attributePaths = {"tournament", "stage", "groupStage", "venue", "homeTeam", "awayTeam"})
    Optional<Fixture> findWithRelationsById(Long id);

    @EntityGraph(attributePaths = {"homeTeam", "awayTeam"})
    List<Fixture> findByGroupStageIdOrderByKickoffAtAsc(Long groupStageId);

    Optional<Fixture> findByExternalProviderId(Long externalProviderId);

    List<Fixture> findByExternalProviderIdIsNull();

    void deleteByExternalProviderIdIsNull();

    List<Fixture> findByExternalProviderIdIsNotNull();

    void deleteByExternalProviderIdIsNotNull();

    List<Fixture> findByStatusAndExternalProviderIdNotNullAndKickoffAtAfter(
            FixtureStatus status, OffsetDateTime since);
}
