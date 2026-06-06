'use client';

// ─── Tipos compartidos ────────────────────────────────────────────────────────

export type PaymentGateway = 'BINANCE_PAY' | 'BINANCE_CONNECT';
export type ProductType    = 'PHYSICAL' | 'DIGITAL';
export type PaymentStatus  = 'idle' | 'loading' | 'processing' | 'success' | 'error' | 'cancelled';

export interface ProductDetails {
  id:            string;
  name:          string;
  description?:  string;
  quantity:      number;
  unitPrice:     number;
  fiatCurrency:  string; // ISO 4217, ej. "USD"
  cryptoCurrency:string; // ej. "USDT"
  type:          ProductType;
}

export interface AvailabilityResponse {
  available: boolean;
  reason?:   'REGION_RESTRICTED' | 'PRODUCT_TYPE_BLOCKED' | 'STORE_POLICY' | 'MAINTENANCE' | 'KYC_REQUIRED';
  message?:  string;
  gateways?: {
    binancePay:     boolean;
    binanceConnect: boolean;
  };
}

// ─── Binance Pay ──────────────────────────────────────────────────────────────

export interface BinancePayOrderPayload {
  amount:         number;
  productDetails: ProductDetails;
}

export interface BinancePayOrderResponse {
  checkoutUrl: string;
  deeplink:    string | null;
  prepayId?:   string;
}

// ─── Binance Connect ──────────────────────────────────────────────────────────

export interface BinanceConnectSessionPayload {
  amount:         number;
  fiatCurrency:   string;
  cryptoCurrency: string;
  productDetails: ProductDetails;
}

export interface BinanceConnectSessionResponse {
  merchantCode: string;
  timestamp:    number;
  signature:    string;
  returnUrl:    string;
  quoteId?:     string;
}

export interface BinanceConnectSuccessPayload {
  orderId:        string;
  cryptoAmount:   string;
  fiatAmount:     string;
  fiatCurrency:   string;
  cryptoCurrency: string;
  status:         'COMPLETED';
}

export interface BinanceConnectFailurePayload {
  errorCode:    string;
  errorMessage: string;
}

export interface BinanceConnectConfig {
  merchantCode:   string;
  timestamp:      number;
  signature:      string;
  fiatCurrency:   string;
  cryptoCurrency: string;
  amount:         string;
  returnUrl:      string;
  quoteId?:       string;
  theme?:         'light' | 'dark';
  locale?:        string;
  onSuccess?:     (payload: BinanceConnectSuccessPayload) => void;
  onFailure?:     (payload: BinanceConnectFailurePayload) => void;
  onCancel?:      () => void;
}

// Declaración global del SDK de Binance Connect (inyectado vía script tag)
declare global {
  interface Window {
    BinanceConnect?: {
      init:  (config: BinanceConnectConfig) => void;
      open:  () => void;
      close: () => void;
    };
  }
}
