package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.GroupStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupStageRepository extends JpaRepository<GroupStage, Long> {
    List<GroupStage> findByTournamentIdOrderByCodeAsc(Long tournamentId);
}
