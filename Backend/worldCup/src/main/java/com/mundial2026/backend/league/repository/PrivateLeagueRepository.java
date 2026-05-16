package com.mundial2026.backend.league.repository;

import com.mundial2026.backend.league.domain.PrivateLeague;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrivateLeagueRepository extends JpaRepository<PrivateLeague, Long> {

    boolean existsByCode(String code);

    Optional<PrivateLeague> findByCode(String code);

    List<PrivateLeague> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<PrivateLeague> findByTournamentIdOrderByCreatedAtDesc(Long tournamentId);

    @EntityGraph(attributePaths = {"owner", "tournament"})
    List<PrivateLeague> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"owner", "tournament"})
    Optional<PrivateLeague> findWithRelationsById(Long id);
}
