package com.mundial2026.backend.subscription.domain;

/**
 * Pasarelas de pago soportadas por el sistema.
 *
 * Por ahora solo Mercado Pago, que cubre el 100% del público colombiano
 * (tarjeta, Nequi, PSE, Daviplata, efectivo, Apple/Google Pay) y soporta
 * pagos internacionales.
 */
public enum PaymentProvider {
    /** Mercado Pago: tarjeta, Nequi, PSE, Daviplata, efectivo, Apple/Google Pay */
    MERCADO_PAGO
}
