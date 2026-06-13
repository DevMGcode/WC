package com.mundial2026.backend.subscription.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Obtiene el tipo de cambio USD → COP en tiempo real desde Frankfurter API
 * (gratuita, sin API key). Cachea el rate por 1 hora para no saturar la API.
 */
@Slf4j
@Service
public class CurrencyConversionService {

    private static final String FRANKFURTER_URL =
            "https://api.frankfurter.app/latest?from=USD&to=COP";

    // Tasa de respaldo basada en pago real confirmado jun 2026 (35.009 COP por 9,99 USD).
    // Se reemplaza en memoria en cuanto Frankfurter responde bien por primera vez.
    private static final BigDecimal HARDCODED_FALLBACK = BigDecimal.valueOf(3_504);

    private static final long CACHE_TTL_MS = 60 * 60 * 1_000L; // 1 hora

    private final RestTemplate restTemplate;

    public CurrencyConversionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Constructor sin args para Spring (crea un RestTemplate por defecto)
    public CurrencyConversionService() {
        this(new RestTemplate());
    }

    // Caché normal (expira cada hora) + última tasa conocida que no expira nunca
    private final AtomicReference<CachedRate> cache       = new AtomicReference<>();
    private final AtomicReference<BigDecimal> lastKnown   = new AtomicReference<>(HARDCODED_FALLBACK);

    /**
     * Convierte un monto en USD a COP usando la tasa de cambio actual.
     * Redondea al peso más cercano (0 decimales).
     */
    public BigDecimal usdToCop(BigDecimal usdAmount) {
        BigDecimal rate = getCurrentRate();
        return usdAmount.multiply(rate).setScale(0, RoundingMode.HALF_UP);
    }

    private BigDecimal getCurrentRate() {
        CachedRate cached = cache.get();
        if (cached != null && !cached.isExpired()) {
            return cached.rate();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(FRANKFURTER_URL, Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            double cop = ((Number) rates.get("COP")).doubleValue();
            BigDecimal rate = BigDecimal.valueOf(cop);
            cache.set(new CachedRate(rate, Instant.now().toEpochMilli()));
            lastKnown.set(rate); // persiste como último valor conocido bueno
            log.info("Tipo de cambio actualizado: 1 USD = {} COP", rate);
            return rate;
        } catch (Exception e) {
            BigDecimal fallback = lastKnown.get();
            log.warn("No se pudo obtener el tipo de cambio USD→COP — usando último valor conocido {} COP: {}",
                    fallback, e.getMessage());
            return fallback;
        }
    }

    private record CachedRate(BigDecimal rate, long fetchedAtMs) {
        boolean isExpired() {
            return Instant.now().toEpochMilli() - fetchedAtMs > CACHE_TTL_MS;
        }
    }
}
