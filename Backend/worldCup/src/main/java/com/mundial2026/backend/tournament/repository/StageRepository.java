package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StageRepository extends JpaRepository<Stage, Long> {

    List<Stage> findByTournamentIdOrderBySortOrderAsc(Long tournamentId);

    Optional<Stage> findByTournamentIdAndCode(Long tournamentId, String code);
}
