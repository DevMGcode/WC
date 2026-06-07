'use client';

// ─── Tipos compartidos ────────────────────────────────────────────────────────

export type PaymentGateway = 'MERCADO_PAGO';
export type ProductType    = 'PHYSICAL' | 'DIGITAL';
export type PaymentStatus  = 'idle' | 'loading' | 'processing' | 'success' | 'error' | 'cancelled';

export interface ProductDetails {
  id:             string;
  name:           string;
  description?:   string;
  quantity:       number;
  unitPrice:      number;
  fiatCurrency:   string; // ISO 4217, ej. "COP"
  cryptoCurrency: string; // legacy, ya no se usa con Mercado Pago — mantener por compatibilidad
  type:           ProductType;
}

export interface AvailabilityResponse {
  available: boolean;
  reason?:   'REGION_RESTRICTED' | 'PRODUCT_TYPE_BLOCKED' | 'STORE_POLICY' | 'MAINTENANCE' | 'KYC_REQUIRED';
  message?:  string;
  gateways?: {
    mercadoPago: boolean;
  };
}

// ─── Mercado Pago ─────────────────────────────────────────────────────────────

export interface MercadoPagoPreferencePayload {
  amount:         number;
  productDetails: ProductDetails;
}

export interface MercadoPagoPreferenceResponse {
  preferenceId:     string;
  initPoint:        string; // URL de producción
  sandboxInitPoint: string; // URL de pruebas (con tarjetas TEST)
  publicKey:        string;
}
