'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';
import { AnimatedNumber } from './AdminShared';
import { IconUsers, IconBall, IconExternal } from './AdminIcons';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

interface AppStats { totalUsers: number | null; totalPredictions: number | null; }

export default function AnalyticsTab() {
  const [stats,   setStats]   = useState<AppStats>({ totalUsers: null, totalPredictions: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/v1/public/predictions/count').then(r => r.ok ? r.json() : null),
      fetch('/api/v1/public/users/count').then(r => r.ok ? r.json() : null),
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

  return (
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
      {/* Stat cards */}
      <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3 md:content-start">
        {statCards.map(({ label, sublabel, value, icon, from, to, glow }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
            className="relative rounded-2xl overflow-hidden group"
            style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.95)}, ${alpha(hex.bg.secondary, 0.90)})`, border: `1px solid ${from}40`, boxShadow: `0 0 30px ${glow}30, 0 8px 24px rgba(2,6,23,0.5)` }}>
            <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
              style={{ background: `radial-gradient(circle at 40% 40%, ${from} 0%, transparent 65%)` }} />
            <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${from}, transparent)` }} />
            <div className="relative p-5 flex flex-col items-center text-center gap-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 16px ${glow}` }}>
                {icon}
              </div>
              <div>
                {loading ? (
                  <div className="h-10 w-16 rounded-lg animate-pulse mx-auto" style={{ background: alpha(hex.text.secondary, 0.12) }} />
                ) : (
                  <div className="text-5xl font-black leading-none"
                    style={{ fontFamily: 'var(--font-display)', background: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {value !== null ? <AnimatedNumber value={value} /> : '—'}
                  </div>
                )}
                <p className="text-xs font-bold mt-1" style={{ color: hex.text.primary, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.secondary, 0.5) }}>{sublabel}</p>
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
  );
}
