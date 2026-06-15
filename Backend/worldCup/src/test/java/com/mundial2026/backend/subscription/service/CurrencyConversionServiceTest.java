package com.mundial2026.backend.subscription.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests del servicio de conversión USD→COP.
 * Verifica el cálculo, el caché de 1 hora y el fallback cuando la API falla.
 */
@ExtendWith(MockitoExtension.class)
class CurrencyConversionServiceTest {

    @Mock RestTemplate restTemplate;

    CurrencyConversionService service;

    @BeforeEach
    void setUp() {
        service = new CurrencyConversionService(restTemplate);
    }

    private void mockRate(double rate) {
        Map<String, Object> rates = Map.of("COP", rate);
        Map<String, Object> response = Map.of("rates", rates);
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);
    }

    @Test
    void usdToCop_convertsCorrectlyAndRoundsToWholePesos() {
        mockRate(4000.0);

        BigDecimal result = service.usdToCop(new BigDecimal("9.99"));

        // 9.99 × 4000 = 39960 (sin decimales)
        assertThat(result).isEqualByComparingTo(new BigDecimal("39960"));
    }

    @Test
    void usdToCop_cachesRateForOneHour_callsApiOnlyOnce() {
        mockRate(3500.0);

        service.usdToCop(new BigDecimal("1.00"));
        service.usdToCop(new BigDecimal("2.00"));
        service.usdToCop(new BigDecimal("9.99"));

        // La API solo se llama una vez; las siguientes usan el caché
        verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    }

    @Test
    void usdToCop_whenApiFails_usesHardcodedFallback() {
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API caída"));

        BigDecimal result = service.usdToCop(new BigDecimal("9.99"));

        // Fallback = 3504 COP/USD (basado en pago real de 35.009 COP por 9,99 USD)
        // 9.99 × 3504 = 35004.96 → redondea a 35005
        assertThat(result).isEqualByComparingTo(new BigDecimal("35005"));
    }

    @Test
    void usdToCop_withinCacheTtl_doesNotCallApiAgain() {
        // Primera llamada carga la tasa en caché
        mockRate(3800.0);
        service.usdToCop(new BigDecimal("1.00"));

        // Llamadas siguientes dentro de la hora reutilizan el caché
        BigDecimal result = service.usdToCop(new BigDecimal("9.99"));

        // 9.99 × 3800 = 37962
        assertThat(result).isEqualByComparingTo(new BigDecimal("37962"));
        verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    }

    @Test
    void usdToCop_withHighPrecisionRate_roundsCorrectly() {
        mockRate(3486.62); // tasa real aproximada a junio 2026

        BigDecimal result = service.usdToCop(new BigDecimal("9.99"));

        // 9.99 × 3486.62 = 34831.3338 → redondea a 34831
        assertThat(result.scale()).isEqualTo(0);
        assertThat(result.intValue()).isEqualTo(34831);
    }
}
