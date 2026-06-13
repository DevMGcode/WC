'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState }        from 'react';
import { motion }                     from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiArrowRight, FiLoader } from 'react-icons/fi';
import { Header }    from '@/components/Navigation';
import { useAuth }   from '@/contexts/AuthContext';
import { hex }       from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

// Página de resultado de pago — recibe ?orderId=&gateway=&status=success|failed
export default function CheckoutResultPage() {
  const params  = useSearchParams();
  const router  = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const orderId   = params.get('preferenceId') ?? params.get('orderId') ?? '—';
  const provider  = params.get('provider') ?? 'MERCADO_PAGO';
  const status    = params.get('status')   ?? 'failed';
  const paymentId = params.get('payment_id') ?? params.get('collection_id') ?? null;
  const isOk      = status === 'success' || status === 'approved';

  const [verifying, setVerifying] = useState(isOk);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  // 1. Verificación activa: cuando MP redirige con status=success, consulta el backend
  //    que a su vez consulta MP directamente. Cubre el caso en que el webhook no llegó
  //    (frecuente con débito Bancolombia en Colombia).
  useEffect(() => {
    if (!isOk || !isAuthenticated || !paymentId) {
      setVerifying(false);
      return;
    }
    if (typeof window === 'undefined') return;

    const token = window.localStorage.getItem('authToken');
    if (!token) { setVerifying(false); return; }

    let cancelled = false;
    (async () => {
      try {
        await fetch(`/api/v1/payments/mercadopago/verify/${paymentId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Si falla la verificación, el webhook puede llegar después — no es crítico.
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOk, isAuthenticated, paymentId]);

  // 2. Refrescar JWT una vez que la verificación terminó, para que isPremium=true
  //    quede reflejado en el token sin requerir logout/login.
  useEffect(() => {
    if (!isOk || !isAuthenticated || verifying) return;
    if (typeof window === 'undefined') return;

    const refreshToken = window.localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!resp.ok) return;
        const json = await resp.json();
        const data = json?.data;
        if (cancelled || !data) return;
        if (data.accessToken)  window.localStorage.setItem('authToken',    data.accessToken);
        if (data.refreshToken) window.localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user) {
          window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: data.user }));
        }
      } catch {
        // Silencioso — el usuario puede hacer logout/login manual si esto falla.
      }
    })();
    return () => { cancelled = true; };
  }, [isOk, isAuthenticated, verifying]);

  const accentColor = isOk ? hex.green.bright : hex.status.danger;
  const accentGlow  = isOk ? alphaOf('green', 0.55) : `${hex.status.danger}55`;

  const gatewayLabel = provider === 'MERCADO_PAGO' ? 'Mercado Pago' : provider;

  return (
    <div className="w-full relative min-h-screen">
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 500, height: 500, top: -140, left: -80,
          background: `radial-gradient(circle, ${alpha(accentColor, 0.06)} 0%, transparent 65%)`,
          filter: 'blur(70px)', zIndex: 0,
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="relative z-10">
        <Header title="Orionix Gol" subtitle="Resultado del pago" centered />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-12 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl p-8 text-center"
          style={{
            background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.92)} 0%, ${alpha(hex.bg.elevated, 0.96)} 100%)`,
            border: `1px solid ${alpha(accentColor, 0.28)}`,
            backdropFilter: 'blur(28px)',
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.70)}, 0 0 60px ${alpha(accentColor, 0.08)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}70, transparent)` }} />

          {/* Ícono resultado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-5"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: alpha(accentColor, 0.10),
                border: `2px solid ${alpha(accentColor, 0.35)}`,
                boxShadow: `0 0 40px ${accentGlow}`,
              }}
            >
              {isOk
                ? <FiCheckCircle size={40} style={{ color: accentColor }} />
                : <FiXCircle     size={40} style={{ color: accentColor }} />
              }
            </div>
          </motion.div>

          {/* Título */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-black text-white mb-2"
            style={{ textShadow: `0 0 20px ${accentGlow}` }}
          >
            {verifying ? 'Confirmando pago...' : isOk ? '¡Pago exitoso!' : 'Pago no completado'}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[13px] mb-6"
            style={{ color: hex.text.secondary }}
          >
            {verifying
              ? 'Estamos verificando tu pago con Mercado Pago. Un momento...'
              : isOk
              ? 'Tu Pase Mundial 2026 ha sido activado. ¡Disfruta todas las funciones premium!'
              : 'El pago no fue procesado. Tus datos no han sido cobrados. Puedes intentarlo de nuevo.'
            }
          </motion.p>

          {/* Detalles */}
          {isOk && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-xl p-4 mb-6 text-left space-y-2"
              style={{
                background: alpha(hex.bg.primary, 0.65),
                border: `1px solid ${alpha(hex.neutral.white, 0.06)}`,
              }}
            >
              {[
                { label: 'Orden',     value: orderId },
                { label: 'Pasarela', value: gatewayLabel },
                { label: 'Estado',   value: 'Completado ✓' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[12px]">
                  <span style={{ color: hex.text.muted }}>{label}</span>
                  <span className="font-bold" style={{ color: hex.text.secondary }}>{value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <motion.button
              whileHover={verifying ? {} : { scale: 1.02, boxShadow: `0 8px 28px ${accentGlow}` }}
              whileTap={verifying ? {} : { scale: 0.97 }}
              onClick={() => !verifying && router.push('/')}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black tracking-wide text-sm"
              style={{
                background: `linear-gradient(135deg, ${alpha(accentColor, 0.18)}, ${alpha(hex.bg.elevated, 0.90)})`,
                border: `1px solid ${alpha(accentColor, 0.35)}`,
                color: accentColor,
                opacity: verifying ? 0.5 : 1,
                cursor: verifying ? 'wait' : 'pointer',
              }}
            >
              {verifying ? <FiLoader size={14} className="animate-spin" /> : null}
              {verifying ? 'Verificando...' : isOk ? 'Ir al inicio' : 'Volver al inicio'}
              {!verifying && <FiArrowRight size={14} />}
            </motion.button>

            {!isOk && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/checkout')}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{
                  background: 'transparent',
                  border: `1px solid ${alpha(hex.neutral.white, 0.10)}`,
                  color: hex.text.muted,
                }}
              >
                Intentar de nuevo
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
