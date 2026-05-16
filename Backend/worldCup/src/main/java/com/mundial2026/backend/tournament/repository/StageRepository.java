package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long> {
    List<Stage> findByTournamentIdOrderBySortOrderAsc(Long tournamentId);
}
