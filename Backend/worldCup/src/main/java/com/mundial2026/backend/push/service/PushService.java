package com.mundial2026.backend.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.push.api.dto.PushSubscriptionRequest;
import com.mundial2026.backend.push.domain.PushSubscription;
import com.mundial2026.backend.push.repository.PushSubscriptionRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Envío de notificaciones Web Push (VAPID) y gestión de suscripciones.
 *
 * Es gratis: las notificaciones viajan por los servicios push de los navegadores
 * (Google/Mozilla/Apple). Solo necesitamos las claves VAPID (en application.yml)
 * y las suscripciones que cada navegador genera al aceptar el permiso.
 */
@Slf4j
@Service
public class PushService {

    private final PushSubscriptionRepository subscriptionRepository;
    private final AppUserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String vapidPublicKey;
    private final String vapidPrivateKey;
    private final String vapidSubject;

    private nl.martijndwars.webpush.PushService pushService;

    public PushService(
            PushSubscriptionRepository subscriptionRepository,
            AppUserRepository userRepository,
            @Value("${app.push.vapid.public-key}") String vapidPublicKey,
            @Value("${app.push.vapid.private-key}") String vapidPrivateKey,
            @Value("${app.push.vapid.subject}") String vapidSubject) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.vapidPublicKey = vapidPublicKey;
        this.vapidPrivateKey = vapidPrivateKey;
        this.vapidSubject = vapidSubject;
    }

    @PostConstruct
    void init() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        try {
            this.pushService = new nl.martijndwars.webpush.PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            log.info("[Push] PushService inicializado con clave VAPID pública {}…", vapidPublicKey.substring(0, 12));
        } catch (Exception e) {
            log.error("[Push] No se pudo inicializar PushService: {}", e.getMessage());
        }
    }

    /** La clave pública VAPID que el frontend necesita para suscribirse. */
    public String getPublicKey() {
        return vapidPublicKey;
    }

    // ─── Suscripciones ────────────────────────────────────────────────────────

    /** Guarda (o actualiza) la suscripción de un navegador del usuario. */
    @Transactional
    public void saveSubscription(Long userId, PushSubscriptionRequest req) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));

        PushSubscription sub = subscriptionRepository.findByEndpoint(req.endpoint())
                .orElseGet(PushSubscription::new);
        sub.setUser(user);
        sub.setEndpoint(req.endpoint());
        sub.setP256dh(req.p256dh());
        sub.setAuth(req.auth());
        subscriptionRepository.save(sub);
        log.info("[Push] Suscripción guardada userId={} endpoint={}…", userId, shortEndpoint(req.endpoint()));
    }

    /** Elimina una suscripción por su endpoint (al desactivar notificaciones). */
    @Transactional
    public void deleteSubscription(String endpoint) {
        subscriptionRepository.deleteByEndpoint(endpoint);
    }

    // ─── Envío ────────────────────────────────────────────────────────────────

    /**
     * Envía una notificación a TODOS los dispositivos suscritos del usuario.
     * Si un endpoint ya no existe (410/404), lo borra para no reintentar.
     * Devuelve cuántos envíos fueron aceptados.
     */
    @Transactional
    public int sendToUser(Long userId, String title, String body, String url) {
        List<PushSubscription> subs = subscriptionRepository.findByUserId(userId);
        if (subs.isEmpty() || pushService == null) return 0;

        byte[] payload = buildPayload(title, body, url);
        int sent = 0;
        for (PushSubscription sub : subs) {
            try {
                Notification notification = new Notification(sub.getEndpoint(), sub.getP256dh(), sub.getAuth(), payload);
                var response = pushService.send(notification);
                int status = response.getStatusLine().getStatusCode();
                if (status == 404 || status == 410) {
                    subscriptionRepository.delete(sub); // suscripción caducada
                } else if (status >= 200 && status < 300) {
                    sent++;
                } else {
                    log.warn("[Push] Envío rechazado status={} endpoint={}…", status, shortEndpoint(sub.getEndpoint()));
                }
            } catch (Exception e) {
                log.warn("[Push] Error enviando a {}…: {}", shortEndpoint(sub.getEndpoint()), e.getMessage());
            }
        }
        return sent;
    }

    private byte[] buildPayload(String title, String body, String url) {
        Map<String, String> data = new LinkedHashMap<>();
        data.put("title", title);
        data.put("body", body);
        data.put("url", url != null ? url : "/");
        try {
            return objectMapper.writeValueAsBytes(data);
        } catch (Exception e) {
            return ("{\"title\":\"" + title + "\"}").getBytes();
        }
    }

    private String shortEndpoint(String endpoint) {
        return endpoint.length() > 40 ? endpoint.substring(0, 40) : endpoint;
    }
}
