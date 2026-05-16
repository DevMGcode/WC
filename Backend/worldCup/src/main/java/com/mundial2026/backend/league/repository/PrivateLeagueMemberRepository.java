package com.mundial2026.backend.league.repository;

import com.mundial2026.backend.league.domain.PrivateLeagueMember;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrivateLeagueMemberRepository extends JpaRepository<PrivateLeagueMember, Long> {

    @EntityGraph(attributePaths = {"user", "league", "league.tournament"})
    List<PrivateLeagueMember> findByLeagueIdOrderByJoinedAtAsc(Long leagueId);

    @EntityGraph(attributePaths = {"user", "league", "league.tournament"})
    List<PrivateLeagueMember> findByUserIdOrderByJoinedAtDesc(Long userId);

    Optional<PrivateLeagueMember> findByLeagueIdAndUserId(Long leagueId, Long userId);

    boolean existsByLeagueIdAndUserId(Long leagueId, Long userId);

    long countByLeagueId(Long leagueId);

    void deleteByLeagueIdAndUserId(Long leagueId, Long userId);
}
