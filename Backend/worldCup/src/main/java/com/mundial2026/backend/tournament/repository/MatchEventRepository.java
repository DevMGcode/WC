package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.MatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MatchEventRepository extends JpaRepository<MatchEvent, Long> {

    @Query("SELECT e FROM MatchEvent e LEFT JOIN FETCH e.team WHERE e.fixture.id = :fixtureId ORDER BY e.minute ASC NULLS LAST")
    List<MatchEvent> findByFixtureIdOrderByMinuteAsc(Long fixtureId);

    List<MatchEvent> findByFixtureIdAndSource(Long fixtureId, MatchEvent.Source source);

    /** Todos los goles del torneo — base del fallback local de top goleadores. */
    @Query("SELECT e FROM MatchEvent e LEFT JOIN FETCH e.team WHERE e.eventType = 'GOAL'")
    List<MatchEvent> findGoalEvents();

    void deleteByFixtureId(Long fixtureId);

    /**
     * Dedup para goles en vivo: mismo jugador + mismo equipo dentro de una ventana de ±5 min.
     * Evita duplicados cuando API-Football cambia el elapsed minute entre polls sucesivos
     * (ej: gol detectado en min 76 y vuelto a detectar en min 77 en el siguiente poll).
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END FROM MatchEvent e WHERE e.fixture.id = :fixtureId AND e.playerName = :playerName AND e.team.id = :teamId AND e.minute BETWEEN :minMinute AND :maxMinute AND e.eventType IN ('GOAL','OWN_GOAL','PENALTY_GOAL')")
    boolean existsSimilarGoal(Long fixtureId, String playerName, Long teamId, Integer minMinute, Integer maxMinute);

    /** Dedup para sustituciones: ventana ±2 min para absorber cambios de minuto entre polls. */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END FROM MatchEvent e WHERE e.fixture.id = :fixtureId AND e.playerName = :playerIn AND e.eventType = 'SUBSTITUTION' AND e.minute BETWEEN :minMinute AND :maxMinute")
    boolean existsSubstitutionAt(Long fixtureId, String playerIn, Integer minMinute, Integer maxMinute);

    /** Dedup para tarjetas: mismo jugador + mismo tipo dentro de ±2 min. */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END FROM MatchEvent e WHERE e.fixture.id = :fixtureId AND e.playerName = :playerName AND e.eventType = :eventType AND e.minute BETWEEN :minMinute AND :maxMinute")
    boolean existsCardAt(Long fixtureId, String playerName, String eventType, Integer minMinute, Integer maxMinute);

    /** Dedup para STATUS_CHANGE: un único evento por partido y detalle (halftime, second half, fulltime…). */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END FROM MatchEvent e WHERE e.fixture.id = :fixtureId AND e.eventType = 'STATUS_CHANGE' AND e.detail = :detail")
    boolean existsStatusChangeForFixture(Long fixtureId, String detail);

    /** Goles (no autogoles) de un equipo en un partido hasta un minuto dado. Usado para calcular marcador al descanso. */
    @Query("SELECT COUNT(e) FROM MatchEvent e WHERE e.fixture.id = :fixtureId AND e.team IS NOT NULL AND e.team.id = :teamId AND e.eventType IN ('GOAL','PENALTY_GOAL') AND e.minute IS NOT NULL AND e.minute <= :upToMinute")
    int countGoalsForTeamUpToMinute(Long fixtureId, Long teamId, Integer upToMinute);

    /** Autogoles de un equipo (que suman al marcador del rival) hasta un minuto dado. */
    @Query("SELECT COUNT(e) FROM MatchEvent e WHERE e.fixture.id = :fixtureId AND e.team IS NOT NULL AND e.team.id = :teamId AND e.eventType = 'OWN_GOAL' AND e.minute IS NOT NULL AND e.minute <= :upToMinute")
    int countOwnGoalsByTeamUpToMinute(Long fixtureId, Long teamId, Integer upToMinute);
}
