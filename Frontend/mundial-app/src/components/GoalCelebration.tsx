'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { hex } from '@/lib/design/tokens'
import { alpha, alphaOf } from '@/lib/design/effects'

export interface GoalInfo {
  playerName: string | null
  teamFifaCode: string | null
  minute: number | null
  matchLabel: string
  isFavoriteTeam: boolean
}

// Colores de las partículas — mezcla de verdes, dorado, blanco y colores vivos
const CONFETTI_COLORS = [
  '#22c55e', '#16a34a', '#f59e0b', '#fbbf24',
  '#ffffff', '#86efac', '#34d399', '#6ee7b7',
  '#3b82f6', '#a855f7', '#ec4899', '#fb923c',
]

// Partícula determinista: usa `index` para derivar todo (sin Math.random en render)
// para que AnimatePresence pueda unmount limpio sin key-flip issues.
function ConfettiPiece({ index, total }: { index: number; total: number }) {
  const color   = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const left    = `${(index / total) * 100}%`
  const isCircle = index % 3 === 0
  const size    = 5 + (index % 5) * 2.2           // 5–14 px
  const delay   = (index % 12) * 0.055            // 0–0.66 s stagger
  const dur     = 2.4 + (index % 6) * 0.35        // 2.4–4.15 s
  const drift   = (index % 2 === 0 ? 1 : -1) * (25 + (index % 7) * 18)
  const spin    = (index % 2 === 0 ? 1 : -1) * (200 + (index % 5) * 90)

  return (
    <motion.div
      style={{
        position: 'fixed',
        left,
        top: -20,
        width: isCircle ? size : size * 0.55,
        height: isCircle ? size : size * 2.8,
        background: color,
        borderRadius: isCircle ? '50%' : 3,
        zIndex: 9998,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: '115vh',
        x: [0, drift * 0.4, drift, drift * 0.7, drift * 1.2],
        rotate: spin,
        opacity: [1, 1, 1, 0.4, 0],
      }}
      transition={{
        duration: dur,
        delay,
        ease: [0.15, 0.85, 0.55, 1],
        opacity: { times: [0, 0.5, 0.75, 0.9, 1] },
      }}
    />
  )
}

const PARTICLE_COUNT = 42

export function GoalCelebration({ goal }: { goal: GoalInfo | null }) {
  return (
    <AnimatePresence>
      {goal && (
        <>
          {/* Flash de pantalla */}
          <motion.div
            key="goal-flash"
            style={{
              position: 'fixed', inset: 0, zIndex: 9996,
              background: `radial-gradient(ellipse at 50% 0%, ${alpha('#22c55e', 0.18)} 0%, transparent 65%)`,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.55, times: [0, 0.25, 1] }}
          />

          {/* Partículas de confeti */}
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <ConfettiPiece key={i} index={i} total={PARTICLE_COUNT} />
          ))}

          {/* Toast banner principal */}
          <motion.div
            key="goal-toast"
            initial={{ y: -130, opacity: 0, scale: 0.88 }}
            animate={{ y: 0,    opacity: 1, scale: 1 }}
            exit={{    y: -130, opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.9 }}
            style={{
              position: 'fixed',
              top: 18,
              left: '50%',
              translateX: '-50%',
              zIndex: 9999,
              background: `linear-gradient(140deg, ${alpha(hex.bg.elevated, 0.96)}, ${alpha('#071a0e', 0.98)})`,
              border: `1px solid ${alpha('#22c55e', 0.50)}`,
              borderRadius: 22,
              padding: '18px 28px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: [
                `0 8px 48px ${alpha('#22c55e', 0.32)}`,
                `0 2px 80px ${alpha('#22c55e', 0.12)}`,
                `inset 0 1px 0 ${alpha('#fff', 0.07)}`,
              ].join(', '),
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              minWidth: 270,
              maxWidth: '90vw',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {/* Glow superior interior */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 22, pointerEvents: 'none',
              background: `linear-gradient(180deg, ${alpha('#22c55e', 0.09)} 0%, transparent 55%)`,
            }} />

            {/* Contenido */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              {/* Balón animado */}
              <motion.span
                style={{ fontSize: 32, lineHeight: 1, display: 'block', flexShrink: 0 }}
                animate={{ scale: [1, 1.4, 0.9, 1.1, 1], rotate: [0, -20, 20, -10, 0] }}
                transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
              >
                ⚽
              </motion.span>

              <div>
                {/* Etiqueta superior */}
                <motion.p
                  style={{
                    color: goal.isFavoriteTeam ? '#fbbf24' : '#22c55e',
                    fontWeight: 900,
                    fontSize: 10,
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {goal.isFavoriteTeam ? '⭐ ¡Gol de tu equipo!' : '¡Goool!'}
                </motion.p>

                {/* Nombre del goleador */}
                <motion.p
                  style={{ color: '#ffffff', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {goal.playerName ?? 'Gol'}
                  {goal.minute != null && (
                    <span style={{
                      color: '#86efac', fontWeight: 600, fontSize: 13,
                      marginLeft: 8, verticalAlign: 'middle',
                    }}>
                      {goal.minute}&apos;
                    </span>
                  )}
                </motion.p>

                {/* Partido */}
                <p style={{
                  color: alpha('#ffffff', 0.45),
                  fontSize: 11, marginTop: 3, lineHeight: 1,
                }}>
                  {goal.matchLabel}
                </p>
              </div>
            </div>

            {/* Barra de progreso de cierre */}
            <div style={{
              width: '100%', height: 2, borderRadius: 2,
              background: alpha('#22c55e', 0.18),
              overflow: 'hidden', position: 'relative',
            }}>
              <motion.div
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  background: `linear-gradient(90deg, #22c55e, #86efac)`,
                  borderRadius: 2,
                }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 7, ease: 'linear', delay: 0.1 }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
