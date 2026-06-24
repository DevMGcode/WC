package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.api.dto.MatchEventRequest;
import com.mundial2026.backend.tournament.api.dto.MatchEventResponse;
import com.mundial2026.backend.realtime.event.FixtureEventOccurredEvent;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.MatchEvent;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.MatchEventRepository;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchEventService {

    private final MatchEventRepository  matchEventRepository;
    private final FixtureRepository     fixtureRepository;
    private final TeamRepository        teamRepository;
    private final ApplicationEventPublisher eventPublisher;

    /* ── Lectura pública ── */

    public List<MatchEventResponse> getEvents(Long fixtureId) {
        return matchEventRepository.findByFixtureIdOrderByMinuteAsc(fixtureId)
                .stream().map(this::toResponse).toList();
    }

    /* ── Admin: entrada manual ── */

    @Transactional
    public MatchEventResponse addManual(Long fixtureId, MatchEventRequest req) {
        Fixture fixture = fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new IllegalArgumentException("Partido no encontrado: " + fixtureId));

        Team team = req.teamId() != null
                ? teamRepository.findById(req.teamId()).orElse(null)
                : null;

        MatchEvent event = new MatchEvent();
        event.setFixture(fixture);
        event.setPlayerName(req.playerName().trim());
        event.setTeam(team);
        event.setMinute(req.minute());
        event.setEventType(req.eventType() != null ? req.eventType().toUpperCase() : "GOAL");
        event.setSource(MatchEvent.Source.MANUAL);
        event.setVerified(false);
        event.setMismatch(false);

        matchEventRepository.save(event);
        log.info("[MatchEvent] Gol manual registrado: {} min {} (partido {})", req.playerName(), req.minute(), fixtureId);
        return toResponse(event);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        matchEventRepository.deleteById(eventId);
    }

    /* ── Sincronización desde API (llamado por ExternalFixtureService) ──
     *
     * Lógica:
     * 1. Si ya existen registros MANUAL para este partido → comparar nombre por nombre.
     *    - Coincidencia normalizada → marcar verified=true, guardar api_player_name.
     *    - Distinto → marcar mismatch=true, corregir player_name con el de la API, guardar original en api_player_name.
     * 2. Si NO hay registros manuales → insertar directamente los de la API (source=API, verified=true).
     */
    @Transactional
    public void syncFromApi(Long fixtureId, List<ApiGoal> apiGoals) {
        if (apiGoals == null || apiGoals.isEmpty()) return;

        List<MatchEvent> manualEvents = matchEventRepository
                .findByFixtureIdAndSource(fixtureId, MatchEvent.Source.MANUAL);

        if (manualEvents.isEmpty()) {
            // No hay entrada manual: insertar todo lo que devuelve la API
            Fixture fixture = fixtureRepository.findById(fixtureId).orElse(null);
            if (fixture == null) return;

            // Borrar cualquier registro API anterior de este partido antes de reinsertar
            matchEventRepository.findByFixtureIdAndSource(fixtureId, MatchEvent.Source.API)
                    .forEach(matchEventRepository::delete);

            for (ApiGoal g : apiGoals) {
                Team team = resolveTeam(g.teamId());
                MatchEvent e = new MatchEvent();
                e.setFixture(fixture);
                e.setPlayerName(g.playerName());
                e.setTeam(team);
                e.setMinute(g.minute());
                e.setEventType("GOAL");
                e.setSource(MatchEvent.Source.API);
                e.setVerified(true);
                e.setApiPlayerName(g.playerName());
                e.setMismatch(false);
                matchEventRepository.save(e);
            }
            log.info("[MatchEvent] {} goles insertados desde API para partido {}", apiGoals.size(), fixtureId);

        } else {
            // Hay entrada manual: comparar y corregir
            for (MatchEvent manual : manualEvents) {
                // Buscar el gol de la API que mejor coincide (por minuto o nombre)
                ApiGoal bestMatch = findBestApiMatch(manual, apiGoals);
                if (bestMatch == null) continue;

                manual.setApiPlayerName(bestMatch.playerName());

                if (normalizedEquals(manual.getPlayerName(), bestMatch.playerName())) {
                    manual.setVerified(true);
                    manual.setMismatch(false);
                    log.info("[MatchEvent] Verificado: '{}' (partido {})", manual.getPlayerName(), fixtureId);
                } else {
                    // La API dice un nombre distinto: corregir con el dato oficial
                    log.info("[MatchEvent] Corrección: '{}' → '{}' (partido {})",
                            manual.getPlayerName(), bestMatch.playerName(), fixtureId);
                    manual.setMismatch(true);
                    manual.setVerified(true);
                    manual.setPlayerName(bestMatch.playerName());
                }
                matchEventRepository.save(manual);
            }

            // Agregar goles de la API que no tenían entrada manual (p.ej. el admin no los sabía)
            for (ApiGoal g : apiGoals) {
                boolean yaCubierto = manualEvents.stream()
                        .anyMatch(m -> findBestApiMatch(m, List.of(g)) != null);
                if (!yaCubierto) {
                    Fixture fixture = fixtureRepository.findById(fixtureId).orElse(null);
                    if (fixture == null) continue;
                    Team team = resolveTeam(g.teamId());
                    MatchEvent e = new MatchEvent();
                    e.setFixture(fixture);
                    e.setPlayerName(g.playerName());
                    e.setTeam(team);
                    e.setMinute(g.minute());
                    e.setEventType("GOAL");
                    e.setSource(MatchEvent.Source.API);
                    e.setVerified(true);
                    e.setApiPlayerName(g.playerName());
                    e.setMismatch(false);
                    matchEventRepository.save(e);
                    log.info("[MatchEvent] Gol extra de API añadido: '{}' min {} (partido {})",
                            g.playerName(), g.minute(), fixtureId);
                }
            }
        }
    }

    /* ── Persistencia de goles en vivo desde LiveEventPollingService ──
     *
     * Llamado cada vez que el polling detecta un GOAL/OWN_GOAL/PENALTY_GOAL nuevo.
     * Usa source=API, verified=false para que el admin pueda corregir si hay error.
     * Deduplicado por (fixtureId, minute, internalTeamId) — el mismo dedup que el
     * Caffeine de LiveEventPollingService pero persistente ante reinicios.
     */
    @Transactional
    public void persistLiveGoal(Long fixtureId, String playerName,
                                Long internalTeamId, Integer minute, String eventType) {
        persistLiveGoal(fixtureId, playerName, internalTeamId, minute, null, eventType);
    }

    @Transactional
    public void persistLiveGoal(Long fixtureId, String playerName,
                                Long internalTeamId, Integer minute, Integer extraMinute, String eventType) {
        if (playerName == null || playerName.isBlank()) return;
        if (internalTeamId != null && minute != null
                && matchEventRepository.existsSimilarGoal(fixtureId, playerName, internalTeamId, minute - 5, minute + 5)) {
            return;
        }
        Fixture fixture = fixtureRepository.findById(fixtureId).orElse(null);
        if (fixture == null) return;

        Team team = internalTeamId != null ? teamRepository.findById(internalTeamId).orElse(null) : null;

        MatchEvent event = new MatchEvent();
        event.setFixture(fixture);
        event.setPlayerName(playerName.trim());
        event.setTeam(team);
        event.setMinute(minute);
        event.setExtraMinute(extraMinute);
        event.setEventType(eventType != null ? eventType : "GOAL");
        event.setSource(MatchEvent.Source.API);
        event.setVerified(false);
        event.setMismatch(false);

        matchEventRepository.save(event);
        log.info("[MatchEvent] Gol en vivo persistido: {} min {}+{} (partido {})", playerName, minute, extraMinute, fixtureId);
    }

    /* ── Persistencia de tarjetas en vivo desde LiveEventPollingService ── */
    @Transactional
    public void persistLiveCard(Long fixtureId, String playerName,
                                Long internalTeamId, Integer minute, Integer extraMinute, String eventType) {
        if (playerName == null || playerName.isBlank()) return;
        if (minute != null
                && matchEventRepository.existsCardAt(fixtureId, playerName, eventType, minute - 2, minute + 2)) {
            return;
        }
        Fixture fixture = fixtureRepository.findById(fixtureId).orElse(null);
        if (fixture == null) return;

        Team team = internalTeamId != null ? teamRepository.findById(internalTeamId).orElse(null) : null;

        MatchEvent event = new MatchEvent();
        event.setFixture(fixture);
        event.setPlayerName(playerName.trim());
        event.setTeam(team);
        event.setMinute(minute);
        event.setExtraMinute(extraMinute);
        event.setEventType(eventType);
        event.setSource(MatchEvent.Source.API);
        event.setVerified(false);
        event.setMismatch(false);

        matchEventRepository.save(event);
        log.info("[MatchEvent] Tarjeta persistida: {} {} min {}+{} (partido {})", eventType, playerName, minute, extraMinute, fixtureId);
    }

    /* ── Persistencia de sustituciones en vivo desde LiveEventPollingService ── */
    @Transactional
    public void persistLiveSub(Long fixtureId, String playerIn, String playerOut,
                               Long internalTeamId, Integer minute, Integer extraMinute) {
        if (playerIn == null || playerIn.isBlank()) return;
        if (minute != null
                && matchEventRepository.existsSubstitutionAt(fixtureId, playerIn, minute - 2, minute + 2)) {
            return;
        }
        Fixture fixture = fixtureRepository.findById(fixtureId).orElse(null);
        if (fixture == null) return;

        Team team = internalTeamId != null ? teamRepository.findById(internalTeamId).orElse(null) : null;

        MatchEvent event = new MatchEvent();
        event.setFixture(fixture);
        event.setPlayerName(playerIn.trim());
        event.setPlayerOut(playerOut != null ? playerOut.trim() : null);
        event.setTeam(team);
        event.setMinute(minute);
        event.setExtraMinute(extraMinute);
        event.setEventType("SUBSTITUTION");
        event.setSource(MatchEvent.Source.API);
        event.setVerified(false);
        event.setMismatch(false);

        matchEventRepository.save(event);
        log.info("[MatchEvent] Sustitución persistida: {} → {} min {}+{} (partido {})",
                playerOut, playerIn, minute, extraMinute, fixtureId);
    }

    /* ── Persistencia de cambios de estado (DESCANSO, INICIO 2T, TIEMPO COMPLETO…) ── */

    @Transactional
    public void persistStatusChange(Long fixtureId, String detail, Integer minute, Integer extraMinute,
                                    Integer homeScore, Integer awayScore) {
        if (matchEventRepository.existsStatusChangeForFixture(fixtureId, detail)) return;
        Fixture fixture = fixtureRepository.findById(fixtureId).orElse(null);
        if (fixture == null) return;

        MatchEvent event = new MatchEvent();
        event.setFixture(fixture);
        event.setPlayerName("");
        event.setMinute(minute);
        event.setExtraMinute(extraMinute);
        event.setDetail(detail);
        event.setEventType("STATUS_CHANGE");
        event.setSource(MatchEvent.Source.API);
        event.setVerified(true);
        event.setMismatch(false);
        event.setHomeScoreAtEvent(homeScore);
        event.setAwayScoreAtEvent(awayScore);

        matchEventRepository.save(event);
        log.info("[MatchEvent] STATUS_CHANGE '{}' persistido — partido {} ({}:{}) min {}+{}",
                detail, fixtureId, homeScore, awayScore, minute, extraMinute);

        // Publicar por WebSocket para que los clientes en vivo lo reciban sin recargar
        eventPublisher.publishEvent(new FixtureEventOccurredEvent(
                new com.mundial2026.backend.realtime.payload.MatchEvent(
                        fixtureId,
                        com.mundial2026.backend.realtime.payload.MatchEvent.Type.STATUS_CHANGE,
                        null, null, "", null, null,
                        minute, extraMinute, detail,
                        java.time.Instant.now()
                )
        ));
    }

    /**
     * Retroactivo: inserta los tres STATUS_CHANGE (halftime / second half / fulltime)
     * para un partido ya finalizado que no los tiene aún.
     * El marcador al descanso se reconstruye contando goles en DB hasta el minuto 45.
     * Idempotente: si "halftime" ya existe no hace nada.
     */
    @Transactional
    public void backfillStatusChangesIfMissing(Long fixtureId,
                                               Long homeTeamId, Long awayTeamId,
                                               Integer finalHomeScore, Integer finalAwayScore,
                                               Integer fixtureExtraMinutes) {
        if (matchEventRepository.existsStatusChangeForFixture(fixtureId, "halftime")) return;
        if (finalHomeScore == null || finalAwayScore == null) return;

        int homeHt = matchEventRepository.countGoalsForTeamUpToMinute(fixtureId, homeTeamId, 45)
                   + matchEventRepository.countOwnGoalsByTeamUpToMinute(fixtureId, awayTeamId, 45);
        int awayHt = matchEventRepository.countGoalsForTeamUpToMinute(fixtureId, awayTeamId, 45)
                   + matchEventRepository.countOwnGoalsByTeamUpToMinute(fixtureId, homeTeamId, 45);

        persistStatusChange(fixtureId, "halftime",    45, null,               homeHt,          awayHt);
        persistStatusChange(fixtureId, "second half", 46, null,               homeHt,          awayHt);
        persistStatusChange(fixtureId, "fulltime",    90, fixtureExtraMinutes, finalHomeScore, finalAwayScore);
        log.info("[MatchEvent] STATUS_CHANGE retroactivos para fixture {} (HT {}-{}, FT {}-{}, +{})",
                fixtureId, homeHt, awayHt, finalHomeScore, finalAwayScore, fixtureExtraMinutes);
    }

    /** Persiste el inicio del segundo tiempo solo si ya existe un evento de descanso
     *  pero todavía no hay uno de inicio de segundo tiempo. Idempotente. */
    @Transactional
    public void persistSecondHalfIfNeeded(Long fixtureId, Integer homeScore, Integer awayScore) {
        if (!matchEventRepository.existsStatusChangeForFixture(fixtureId, "halftime")) return;
        persistStatusChange(fixtureId, "second half", 46, null, homeScore, awayScore);
    }

    /* ── Record para transportar datos del gol desde la API ── */
    public record ApiGoal(String playerName, Integer minute, Long teamId) {}

    /* ── Helpers privados ── */

    private ApiGoal findBestApiMatch(MatchEvent manual, List<ApiGoal> apiGoals) {
        // 1. Coincidencia exacta de minuto
        if (manual.getMinute() != null) {
            for (ApiGoal g : apiGoals) {
                if (manual.getMinute().equals(g.minute())) return g;
            }
        }
        // 2. Coincidencia normalizada de nombre
        for (ApiGoal g : apiGoals) {
            if (normalizedEquals(manual.getPlayerName(), g.playerName())) return g;
        }
        // 3. El nombre del manual está contenido en el de la API (apellido)
        String manNorm = normalize(manual.getPlayerName());
        for (ApiGoal g : apiGoals) {
            String apiNorm = normalize(g.playerName());
            if (apiNorm.contains(manNorm) || manNorm.contains(apiNorm)) return g;
        }
        return null;
    }

    private boolean normalizedEquals(String a, String b) {
        return normalize(a).equals(normalize(b));
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase()
                .replaceAll("[áàä]", "a")
                .replaceAll("[éèë]", "e")
                .replaceAll("[íìï]", "i")
                .replaceAll("[óòö]", "o")
                .replaceAll("[úùü]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9 ]", "")
                .replaceAll("\\s+", " ");
    }

    private Team resolveTeam(Long teamId) {
        if (teamId == null) return null;
        return teamRepository.findById(teamId).orElse(null);
    }

    private MatchEventResponse toResponse(MatchEvent e) {
        return new MatchEventResponse(
                e.getId(),
                e.getFixture().getId(),
                e.getPlayerName(),
                e.getPlayerOut(),
                e.getTeam() != null ? e.getTeam().getId() : null,
                e.getTeam() != null ? e.getTeam().getName() : null,
                e.getTeam() != null ? e.getTeam().getFifaCode() : null,
                e.getMinute(),
                e.getExtraMinute(),
                e.getEventType(),
                e.getDetail(),
                e.getSource().name(),
                e.getVerified(),
                e.getApiPlayerName(),
                e.getMismatch(),
                e.getHomeScoreAtEvent(),
                e.getAwayScoreAtEvent()
        );
    }
}
