package com.mundial2026.backend.push.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Dispara las notificaciones push automáticas en intervalos.
 * La deduplicación (no enviar dos veces) la garantizan las banderas por partido
 * dentro de NotificationDispatchService, así que correr esto seguido es seguro.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationScheduler {

    private final NotificationDispatchService dispatchService;

    /** Recordatorios de partido — cada 5 minutos (basta para avisar ~1h antes). */
    @Scheduled(fixedRate = 5 * 60_000)
    public void matchReminders() {
        try {
            dispatchService.dispatchMatchReminders();
        } catch (Exception e) {
            log.warn("[Push] Fallo enviando recordatorios: {}", e.getMessage());
        }
    }

    /** Avisos de resultado — cada 2 minutos (timely cuando termina un partido). */
    @Scheduled(fixedRate = 2 * 60_000)
    public void resultNotifications() {
        try {
            dispatchService.dispatchResultNotifications();
        } catch (Exception e) {
            log.warn("[Push] Fallo enviando resultados: {}", e.getMessage());
        }
    }
}
