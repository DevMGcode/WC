package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.realtime.event.FixtureEventOccurredEvent;
import com.mundial2026.backend.realtime.payload.MatchEvent;
import com.mundial2026.backend.tournament.api.dto.MatchEventRequest;
import com.mundial2026.backend.tournament.api.dto.MatchEventResponse;
import com.mundial2026.backend.tournament.service.MatchEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class MatchEventController {

    private final MatchEventService matchEventService;
    private final ApplicationEventPublisher eventPublisher;

    /** Consulta pública — todos pueden ver los goleadores de un partido */
    @GetMapping("/fixtures/{fixtureId}/events")
    public ResponseEntity<ApiResponse<List<MatchEventResponse>>> getEvents(
            @PathVariable Long fixtureId) {
        return ResponseEntity.ok(ApiResponse.ok("Eventos obtenidos",
                matchEventService.getEvents(fixtureId)));
    }

    /** Admin — registrar gol manualmente */
    @PostMapping("/admin/fixtures/{fixtureId}/events")
    public ResponseEntity<ApiResponse<MatchEventResponse>> addEvent(
            @PathVariable Long fixtureId,
            @RequestBody MatchEventRequest req) {
        if (req.playerName() == null || req.playerName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.ok("El nombre del jugador es obligatorio", null));
        }
        MatchEventResponse saved = matchEventService.addManual(fixtureId, req);

        // Publicar al WebSocket para que los clientes en vivo actualicen los goleadores al instante
        MatchEvent wsPayload = new MatchEvent(
                fixtureId,
                parseEventType(req.eventType()),
                saved.teamId(),
                null,
                saved.playerName(),
                saved.teamFifaCode(),
                saved.minute(),
                null,
                null,
                Instant.now()
        );
        eventPublisher.publishEvent(new FixtureEventOccurredEvent(wsPayload));

        return ResponseEntity.ok(ApiResponse.ok("Gol registrado", saved));
    }

    private MatchEvent.Type parseEventType(String eventType) {
        if (eventType == null) return MatchEvent.Type.GOAL;
        return switch (eventType.toUpperCase()) {
            case "OWN_GOAL"     -> MatchEvent.Type.OWN_GOAL;
            case "PENALTY_GOAL" -> MatchEvent.Type.PENALTY_GOAL;
            default             -> MatchEvent.Type.GOAL;
        };
    }

    /** Admin — eliminar un evento */
    @DeleteMapping("/admin/fixtures/events/{eventId}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long eventId) {
        matchEventService.deleteEvent(eventId);
        return ResponseEntity.ok(ApiResponse.ok("Evento eliminado", null));
    }
}
