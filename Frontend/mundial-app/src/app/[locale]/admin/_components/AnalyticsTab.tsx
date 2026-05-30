'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';
import { AnimatedNumber } from './AdminShared';
import { IconUsers, IconBall, IconExternal } from './AdminIcons';
import { apiFetch } from '@/lib/apiFetch';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GLITCHTIP_DSN = process.env.NEXT_PUBLIC_GLITCHTIP_DSN;

/**
 * Extrae host + projectId desde un DSN tipo:
 *   https://<key>@app.glitchtip.com/<projectId>
 * Devuelve la URL del dashboard de issues de ese proyecto.
 */
function glitchtipDashboardUrl(dsn?: string): string | null {
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, '').split('/')[0];
    if (!projectId) return null;
    return `${url.protocol}//${url.host}/issues?project=${projectId}`;
  } catch {
    return null;
  }
}

interface AppStats { totalUsers: number | null; totalPredictions: number | null; }

export default function AnalyticsTab() {
  const [stats,   setStats]   = useState<AppStats>({ totalUsers: null, totalPredictions: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiFetch('/api/v1/predictions/count').then(r => r.ok ? r.json() : null),
      apiFetch('/api/v1/users/count').then(r => r.ok ? r.json() : null),
    ]).then(([predRes, userRes]) => {
      setStats({
        totalPredictions: predRes.status === 'fulfilled' && predRes.value?.data != null ? predRes.value.data : null,
        totalUsers:       userRes.status === 'fulfilled' && userRes.value?.data != null ? userRes.value.data : null,
      });
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Usuarios registrados', sublabel: 'Total en la plataforma', value: stats.totalUsers,       icon: <IconUsers />, from: hex.green.base,  to: hex.green.bright, glow: alpha(hex.green.base, 0.3) },
    { label: 'Predicciones totales', sublabel: 'Porras registradas',     value: stats.totalPredictions, icon: <IconBall />,  from: hex.green.hover, to: '#059669',         glow: 'rgba(16,185,129,0.3)' },
  ];

  const glitchtipUrl = glitchtipDashboardUrl(GLITCHTIP_DSN);

  return (
    <div className="space-y-4">
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
      {/* Stat cards */}
      <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3 md:content-start">
        {statCards.map(({ label, sublabel, value, icon, from, to, glow }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
            className="relative rounded-2xl overflow-hidden group"
            style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.95)}, ${alpha(hex.bg.secondary, 0.90)})`, border: `1px solid ${from}40`, boxShadow: `0 0 28px ${glow}28, 0 8px 24px rgba(2,6,23,0.5)` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at 50% 100%, ${from}18 0%, transparent 70%)` }} />
            <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${from}, transparent)` }} />
            <div className="relative p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 16px ${glow}` }}>
                {icon}
              </div>
              <div className="min-w-0">
                {loading ? (
                  <div className="h-8 w-14 rounded-lg animate-pulse mb-1" style={{ background: alpha(hex.text.secondary, 0.12) }} />
                ) : (
                  <div className="text-4xl font-black leading-none"
                    style={{ fontFamily: 'var(--font-display)', background: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {value !== null ? <AnimatedNumber value={value} /> : '—'}
                  </div>
                )}
                <p className="text-[11px] font-bold mt-0.5 truncate" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{label}</p>
                <p className="text-[9px] mt-0.5 truncate" style={{ color: alpha(hex.text.secondary, 0.45) }}>{sublabel}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GA4 Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="md:col-span-2 relative rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.95)}, ${alpha(hex.bg.secondary, 0.90)})`, border: '1px solid rgba(249,115,22,0.35)', boxShadow: '0 0 30px rgba(249,115,22,0.1), 0 8px 24px rgba(2,6,23,0.5)' }}>
        <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }} />
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 30%, #f97316 0%, transparent 60%)' }} />

        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'linear-gradient(135deg,#f97316,#facc15)', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
              📊
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>GOOGLE ANALYTICS 4</p>
              <p className="text-xs" style={{ color: alpha(hex.text.secondary, 0.6) }}>Seguimiento de visitas y comportamiento</p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: GA_ID ? alpha(hex.green.hover, 0.1) : alphaOf('gold', 0.1),
                border: `1px solid ${GA_ID ? alpha(hex.green.hover, 0.3) : alpha(hex.gold.base, 0.3)}`,
                color: GA_ID ? hex.green.hover : hex.gold.base,
              }}>
              <span className={`w-1.5 h-1.5 rounded-full ${GA_ID ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {GA_ID ? 'Activo' : 'Sin configurar'}
            </div>
          </div>

          {GA_ID ? (
            <>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4"
                style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: alpha(hex.text.secondary, 0.5) }}>ID</span>
                <span className="font-mono text-xs font-bold text-orionix-green-bright">{GA_ID}</span>
              </div>
              <motion.a
                href="https://analytics.google.com/analytics/web/#/a394949491p537871988/reports/intelligenthome"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(90deg,#f97316,#fb923c,#facc15)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                VER DASHBOARD DE ANALYTICS <IconExternal />
              </motion.a>
            </>
          ) : (
            <div className="rounded-xl p-3.5 text-xs font-medium"
              style={{ background: alphaOf('gold', 0.08), border: borders.brand('gold', 0.2), color: alphaOf('gold', 0.9) }}>
              Agrega <span className="font-mono">NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX</span> en <span className="font-mono">.env.local</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>

    {/* ── GlitchTip Card (Error tracking open-source) ── */}
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.95)}, ${alpha(hex.bg.secondary, 0.90)})`, border: '1px solid rgba(236,72,153,0.35)', boxShadow: '0 0 30px rgba(236,72,153,0.1), 0 8px 24px rgba(2,6,23,0.5)' }}>
      <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ec4899, transparent)' }} />
      <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 20% 30%, #ec4899 0%, transparent 60%)' }} />

      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', boxShadow: '0 4px 16px rgba(236,72,153,0.4)' }}>
            🐛
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>GLITCHTIP · ERROR TRACKING</p>
            <p className="text-xs" style={{ color: alpha(hex.text.secondary, 0.6) }}>Captura de errores y excepciones en runtime (open-source, SDK-compatible con Sentry)</p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: GLITCHTIP_DSN ? alpha(hex.green.hover, 0.1) : alphaOf('gold', 0.1),
              border: `1px solid ${GLITCHTIP_DSN ? alpha(hex.green.hover, 0.3) : alpha(hex.gold.base, 0.3)}`,
              color: GLITCHTIP_DSN ? hex.green.hover : hex.gold.base,
            }}>
            <span className={`w-1.5 h-1.5 rounded-full ${GLITCHTIP_DSN ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {GLITCHTIP_DSN ? 'Activo' : 'Sin configurar'}
          </div>
        </div>

        {GLITCHTIP_DSN ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl p-3" style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: alpha(hex.text.secondary, 0.5) }}>Plan</p>
                <p className="text-sm font-black text-orionix-green-bright">Free</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: alpha(hex.text.secondary, 0.5) }}>Cuota</p>
                <p className="text-sm font-black text-orionix-green-bright">1.000<span className="text-[10px] opacity-60"> evt/mes</span></p>
              </div>
              <div className="rounded-xl p-3" style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: alpha(hex.text.secondary, 0.5) }}>Trace rate</p>
                <p className="text-sm font-black text-orionix-green-bright">10%</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: alpha(hex.text.secondary, 0.5) }}>Licencia</p>
                <p className="text-sm font-black text-orionix-green-bright">MIT</p>
              </div>
            </div>
            {glitchtipUrl && (
              <motion.a
                href={glitchtipUrl} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(90deg,#ec4899,#d946ef,#a855f7)', boxShadow: '0 4px 20px rgba(236,72,153,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                VER ISSUES EN GLITCHTIP <IconExternal />
              </motion.a>
            )}
          </>
        ) : (
          <div className="rounded-xl p-3.5 text-xs font-medium"
            style={{ background: alphaOf('gold', 0.08), border: borders.brand('gold', 0.2), color: alphaOf('gold', 0.9) }}>
            Agrega <span className="font-mono">NEXT_PUBLIC_GLITCHTIP_DSN=https://&lt;key&gt;@app.glitchtip.com/&lt;projectId&gt;</span> en <span className="font-mono">.env.local</span>
          </div>
        )}
      </div>
    </motion.div>
    </div>
  );
}
