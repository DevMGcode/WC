package com.mundial2026.backend.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Cada 5 minutos intenta sincronizar goleadores desde football-data.org
 * para partidos FINISHED de las últimas 24 h que aún no tengan datos de la API.
 *
 * Flujo: Admin puede haber ingresado goles manualmente antes de que llegue la API.
 * Cuando la API responde, MatchEventService compara y corrige si es necesario.
 * Si el admin no ingresó nada, los goles se insertan directamente desde la API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScorerSyncScheduler {

    private final ExternalFixtureService externalFixtureService;

    @Scheduled(fixedRate = 300_000) // cada 5 minutos
    public void syncScorers() {
        if (!externalFixtureService.isConfigured()) return;
        try {
            externalFixtureService.syncScorersForRecentlyFinished();
        } catch (Exception e) {
            log.warn("[ScorerSync] Error en sincronización automática: {}", e.getMessage());
        }
    }
}
