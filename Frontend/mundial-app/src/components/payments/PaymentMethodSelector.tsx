'use client';

// Orquesta las dos pasarelas en paralelo: Binance Pay (cripto) y Binance Connect (fiat).
// Ambas están disponibles simultáneamente; el usuario elige cuál usar.

import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiInfo }        from 'react-icons/fi';
import { hex }                     from '@/lib/design/tokens';
import { alpha }                   from '@/lib/design/effects';
import { BinancePayButton }        from './BinancePayButton';
import { BinanceConnectWidget }    from './BinanceConnectWidget';
import type { ProductDetails }     from '@/lib/payments/types';

interface PaymentMethodSelectorProps {
  productDetails: ProductDetails;
  amount:         number;
}

const GOLD = hex.gold.base;
const BLUE = '#3B82F6';

export function PaymentMethodSelector({ productDetails, amount }: PaymentMethodSelectorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5"
      >
        {/* ── Resumen del pedido ── */}
        <OrderSummary productDetails={productDetails} amount={amount} />

        {/* ── Divisor ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.10)})` }} />
          <p className="text-[11px] font-black tracking-[0.22em] uppercase" style={{ color: hex.text.muted }}>
            Elige tu método de pago
          </p>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alpha(hex.neutral.white, 0.10)}, transparent)` }} />
        </div>

        {/* ── Grid de pasarelas ── */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* ── Binance Pay ── */}
          <GatewayCard
            title="Binance Pay"
            subtitle="Cripto nativo"
            accentColor={GOLD}
            badge="Para usuarios Binance"
            features={['USDT, BNB, BTC y más', 'App nativa o web Binance', 'Sin comisiones de conversión']}
          >
            <BinancePayButton productDetails={productDetails} amount={amount} />
          </GatewayCard>

          {/* ── Binance Connect ── */}
          <GatewayCard
            title="Binance Connect"
            subtitle="Tarjeta / Banco"
            accentColor={BLUE}
            badge="Sin cuenta Binance"
            features={['Visa, Mastercard, PSE', 'Apple Pay · Google Pay', 'KYC incluido en el widget']}
          >
            <BinanceConnectWidget productDetails={productDetails} amount={amount} />
          </GatewayCard>

        </div>

        {/* ── Nota de seguridad ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2.5 rounded-xl px-4 py-3"
          style={{
            background: alpha(hex.bg.soft, 0.60),
            border: `1px solid ${alpha(hex.neutral.white, 0.06)}`,
          }}
        >
          <FiShield size={13} style={{ color: hex.text.muted }} />
          <p className="text-[11px] leading-relaxed" style={{ color: hex.text.muted }}>
            Todos los pagos son procesados de forma segura por Binance. Tu información financiera nunca pasa por nuestros servidores.
          </p>
        </motion.div>

        {/* ── Nota de diferencia entre pasarelas ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{
            background: alpha(hex.bg.soft, 0.50),
            border: `1px solid ${alpha(hex.neutral.white, 0.05)}`,
          }}
        >
          <FiInfo size={13} className="shrink-0 mt-0.5" style={{ color: hex.text.muted }} />
          <p className="text-[11px] leading-relaxed" style={{ color: hex.text.muted }}>
            <strong style={{ color: hex.text.secondary }}>Binance Pay</strong> requiere tener cripto en tu billetera Binance.{' '}
            <strong style={{ color: hex.text.secondary }}>Binance Connect</strong> te permite pagar con tu tarjeta o banco y la plataforma convierte automáticamente.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── GatewayCard ──────────────────────────────────────────────────────────────

interface GatewayCardProps {
  title:        string;
  subtitle:     string;
  accentColor:  string;
  badge:        string;
  features:     string[];
  children:     React.ReactNode;
}

function GatewayCard({ title, subtitle, accentColor, badge, features, children }: GatewayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 55%, ${alpha(hex.bg.secondary, 0.98)} 100%)`,
        border: `1px solid ${alpha(accentColor, 0.22)}`,
        backdropFilter: 'blur(28px)',
        boxShadow: `0 14px 44px ${alpha(hex.neutral.black, 0.55)}, 0 0 0 1px ${alpha(accentColor, 0.06)}`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}70, transparent)` }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-black text-white leading-none">{title}</p>
          <p className="text-[12px] mt-0.5" style={{ color: alpha(accentColor, 0.80) }}>{subtitle}</p>
        </div>
        <span
          className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.12em] uppercase"
          style={{
            background: alpha(accentColor, 0.12),
            border: `1px solid ${alpha(accentColor, 0.28)}`,
            color: accentColor,
          }}
        >
          {badge}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: alpha(accentColor, 0.70) }} />
            <span className="text-[12px]" style={{ color: hex.text.secondary }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* Payment button — separado visualmente */}
      <div className="mt-auto pt-1 border-t" style={{ borderColor: alpha(hex.neutral.white, 0.06) }}>
        {children}
      </div>
    </motion.div>
  );
}

// ── OrderSummary ─────────────────────────────────────────────────────────────

function OrderSummary({ productDetails, amount }: { productDetails: ProductDetails; amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.88)} 0%, ${alpha(hex.bg.elevated, 0.95)} 100%)`,
        border: `1px solid ${alpha(hex.neutral.white, 0.08)}`,
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.45)}, transparent)` }} />
      <p className="text-[11px] font-black tracking-[0.22em] uppercase mb-3" style={{ color: hex.text.muted }}>
        Resumen del pedido
      </p>
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <span style={{ color: hex.text.secondary }}>{productDetails.name}</span>
          <span style={{ color: hex.text.secondary }}>×{productDetails.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: hex.text.muted }}>Moneda de pago</span>
          <span style={{ color: hex.text.secondary }}>{productDetails.fiatCurrency}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: hex.text.muted }}>Recibes en</span>
          <span style={{ color: hex.text.secondary }}>{productDetails.cryptoCurrency}</span>
        </div>
        <div
          className="flex justify-between pt-2 mt-1 font-black"
          style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}
        >
          <span className="text-white">Total</span>
          <span style={{ color: GOLD }}>
            {amount.toFixed(2)} {productDetails.fiatCurrency}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
