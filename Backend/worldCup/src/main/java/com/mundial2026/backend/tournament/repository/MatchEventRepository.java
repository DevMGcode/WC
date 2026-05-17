package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.MatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MatchEventRepository extends JpaRepository<MatchEvent, Long> {

    @Query("SELECT e FROM MatchEvent e LEFT JOIN FETCH e.team WHERE e.fixture.id = :fixtureId ORDER BY e.minute ASC NULLS LAST")
    List<MatchEvent> findByFixtureIdOrderByMinuteAsc(Long fixtureId);

    List<MatchEvent> findByFixtureIdAndSource(Long fixtureId, MatchEvent.Source source);

    void deleteByFixtureId(Long fixtureId);
}
