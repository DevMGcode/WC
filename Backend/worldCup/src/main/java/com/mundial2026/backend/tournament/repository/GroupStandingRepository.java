package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.GroupStanding;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupStandingRepository extends JpaRepository<GroupStanding, Long> {

    @EntityGraph(attributePaths = {"team"})
    List<GroupStanding> findByGroupStageIdOrderByPositionAsc(Long groupStageId);

    Optional<GroupStanding> findByGroupStageIdAndTeamId(Long groupStageId, Long teamId);
}
