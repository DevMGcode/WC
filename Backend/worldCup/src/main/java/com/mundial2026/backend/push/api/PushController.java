package com.mundial2026.backend.push.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.push.api.dto.PushSubscriptionRequest;
import com.mundial2026.backend.push.api.dto.PushUnsubscribeRequest;
import com.mundial2026.backend.push.service.NotificationDispatchService;
import com.mundial2026.backend.push.service.PushService;
import com.mundial2026.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PushController {

    private final PushService pushService;
    private final NotificationDispatchService dispatchService;
    private final SecurityUtils securityUtils;

    /** Clave pública VAPID que el frontend necesita para suscribirse al push. */
    @GetMapping("/push/vapid-public-key")
    public ResponseEntity<ApiResponse<Map<String, String>>> getVapidPublicKey() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Clave pública VAPID",
                Map.of("publicKey", pushService.getPublicKey())
        ));
    }

    /** Guarda la suscripción del navegador del usuario (tras aceptar el permiso). */
    @PostMapping("/users/{id}/push/subscribe")
    public ResponseEntity<ApiResponse<Void>> subscribe(
            @PathVariable Long id,
            @Valid @RequestBody PushSubscriptionRequest request) {
        securityUtils.requireSelfOrAdmin(id);
        pushService.saveSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Suscripción registrada", null));
    }

    /** Elimina la suscripción de un navegador (al desactivar notificaciones). */
    @PostMapping("/users/{id}/push/unsubscribe")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(
            @PathVariable Long id,
            @Valid @RequestBody PushUnsubscribeRequest request) {
        securityUtils.requireSelfOrAdmin(id);
        pushService.deleteSubscription(request.endpoint());
        return ResponseEntity.ok(ApiResponse.ok("Suscripción eliminada", null));
    }

    /** Envía una notificación de PRUEBA a los dispositivos del propio usuario. */
    @PostMapping("/users/{id}/push/test")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> sendTest(@PathVariable Long id) {
        securityUtils.requireSelfOrAdmin(id);
        int sent = pushService.sendToUser(id,
                "⚽ Orionix Gol",
                "¡Notificaciones activadas! Te avisaremos de tus partidos y porras.",
                "/");
        return ResponseEntity.ok(ApiResponse.ok("Notificación de prueba enviada", Map.of("sent", sent)));
    }

    /** Admin: dispara YA los recordatorios de partido (sin esperar el scheduler). */
    @PostMapping("/admin/push/dispatch-reminders")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> dispatchReminders() {
        int sent = dispatchService.dispatchMatchReminders();
        return ResponseEntity.ok(ApiResponse.ok("Recordatorios disparados", Map.of("sent", sent)));
    }

    /** Admin: dispara YA los avisos de resultado (sin esperar el scheduler). */
    @PostMapping("/admin/push/dispatch-results")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> dispatchResults() {
        int sent = dispatchService.dispatchResultNotifications();
        return ResponseEntity.ok(ApiResponse.ok("Avisos de resultado disparados", Map.of("sent", sent)));
    }
}
