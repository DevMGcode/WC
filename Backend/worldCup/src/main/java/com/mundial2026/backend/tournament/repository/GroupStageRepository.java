package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.GroupStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupStageRepository extends JpaRepository<GroupStage, Long> {

    Optional<GroupStage> findByTournamentIdAndCode(Long tournamentId, String code);
}
