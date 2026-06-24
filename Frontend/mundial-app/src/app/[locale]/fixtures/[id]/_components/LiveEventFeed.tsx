'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MatchEvent } from '@/types';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

// ── Configuración visual por tipo de evento ─────────────────────────────────

interface EventCfg {
  icon: string;
  label: string;
  accent: string;
  glow: string;
}

function getEventCfg(type: MatchEvent['type'], detail?: string | null): EventCfg {
  switch (type) {
    case 'GOAL':
      return { icon: '⚽', label: 'GOL', accent: '#22c55e', glow: 'rgba(34,197,94,0.45)' };
    case 'OWN_GOAL':
      return { icon: '⚽', label: 'AUTOGOL', accent: '#f59e0b', glow: 'rgba(245,158,11,0.45)' };
    case 'PENALTY_GOAL':
      return { icon: '🥅', label: 'PENALTI', accent: '#22c55e', glow: 'rgba(34,197,94,0.45)' };
    case 'PENALTY_MISSED':
      return { icon: '❌', label: 'PENALTI FALLADO', accent: '#ef4444', glow: 'rgba(239,68,68,0.35)' };
    case 'SHOOTOUT_GOAL':
      return { icon: '🥅', label: 'GOL (TANDA)', accent: '#22c55e', glow: 'rgba(34,197,94,0.45)' };
    case 'SHOOTOUT_MISSED':
      return { icon: '❌', label: 'FALLO (TANDA)', accent: '#ef4444', glow: 'rgba(239,68,68,0.35)' };
    case 'YELLOW_CARD':
      return { icon: '🟨', label: 'TARJETA AMARILLA', accent: '#eab308', glow: 'rgba(234,179,8,0.40)' };
    case 'RED_CARD':
      return { icon: '🟥', label: 'TARJETA ROJA', accent: '#ef4444', glow: 'rgba(239,68,68,0.45)' };
    case 'SUBSTITUTION':
      return { icon: '🔄', label: 'SUSTITUCIÓN', accent: '#38bdf8', glow: 'rgba(56,189,248,0.35)' };
    case 'VAR_REVIEW': {
      const varLabels: Record<string, string> = {
        'goal disallowed':   'VAR — Gol anulado',
        'goal confirmed':    'VAR — Gol confirmado',
        'penalty confirmed': 'VAR — Penal confirmado',
        'penalty cancelled': 'VAR — Penal anulado',
        'card upgrade':      'VAR — Tarjeta revisada',
      };
      const varLabel = detail ? (varLabels[detail.toLowerCase()] ?? `VAR — ${detail}`) : 'REVISIÓN VAR';
      return { icon: '📹', label: varLabel, accent: '#a78bfa', glow: 'rgba(167,139,250,0.40)' };
    }
    case 'STATUS_CHANGE': {
      const statusLabels: Record<string, string> = {
        'halftime':       'DESCANSO',
        'half time':      'DESCANSO',
        'second half':    'INICIO 2T',
        'fulltime':       'TIEMPO COMPLETO',
        'full time':      'TIEMPO COMPLETO',
        'extra time':     'TIEMPO EXTRA',
        'penalties':      'TANDAS DE PENALES',
      };
      const statusLabel = detail ? (statusLabels[detail.toLowerCase()] ?? detail.toUpperCase()) : 'CAMBIO DE ESTADO';
      return { icon: '⏱️', label: statusLabel, accent: '#94a3b8', glow: 'rgba(148,163,184,0.25)' };
    }
    default:
      return { icon: '📌', label: 'EVENTO', accent: '#94a3b8', glow: 'rgba(148,163,184,0.25)' };
  }
}

// ── Tarjeta individual de evento ─────────────────────────────────────────────

function EventCard({
  event,
  isLatest,
  isLive,
  homeTeamId,
  homeCode,
  awayCode,
}: {
  event: MatchEvent;
  isLatest: boolean;
  isLive: boolean;
  homeTeamId: number | null;
  homeCode?: string;
  awayCode?: string;
}) {
  const cfg = getEventCfg(event.type, event.detail);
  const isHome = event.teamId !== null && event.teamId === homeTeamId;
  const teamCode = isHome ? homeCode : awayCode;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl flex items-center gap-3 px-4 py-3"
      style={{
        background: isLatest
          ? `linear-gradient(135deg, ${alpha(cfg.accent, 0.14)}, ${alpha(hex.bg.primary, 0.95)})`
          : alpha(hex.bg.primary, 0.80),
        border: `1px solid ${alpha(cfg.accent, isLatest ? 0.45 : 0.18)}`,
        boxShadow: isLatest ? `0 0 24px ${cfg.glow}` : 'none',
      }}
    >
      {/* Barra lateral de color */}
      <div
        className="absolute left-0 inset-y-0 w-[3px] rounded-l-xl"
        style={{ background: cfg.accent }}
      />

      {/* Icono */}
      <span className="text-xl shrink-0 ml-1">{cfg.icon}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[9px] font-black tracking-[0.22em] uppercase"
            style={{ color: cfg.accent }}
          >
            {cfg.label}
          </span>
          {isLatest && isLive && (
            <motion.span
              className="text-[7px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full"
              style={{ background: alpha(cfg.accent, 0.18), color: cfg.accent }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              EN VIVO
            </motion.span>
          )}
        </div>

        {/* Jugador que entra / protagonista */}
        {event.playerName && (
          <p className="text-sm font-black text-white truncate leading-tight">
            {event.playerName}
          </p>
        )}

        {/* Jugador que sale (sustitución) */}
        {event.type === 'SUBSTITUTION' && event.playerOut && (
          <p className="text-[10px] text-orionix-text-muted truncate">
            Sale: {event.playerOut}
          </p>
        )}

        {/* Equipo */}
        {teamCode && (
          <p className="text-[9px] font-bold mt-0.5" style={{ color: alpha(cfg.accent, 0.70) }}>
            {teamCode}
          </p>
        )}
      </div>

      {/* Minuto */}
      <div
        className="shrink-0 text-right px-2 py-1 rounded-lg"
        style={{
          background: alpha(cfg.accent, 0.10),
          border: `1px solid ${alpha(cfg.accent, 0.20)}`,
          minWidth: 36,
        }}
      >
        <p className="text-[11px] font-black tabular-nums" style={{ color: cfg.accent }}>
          {event.minute}
          {event.extraMinute ? `+${event.extraMinute}` : ''}
          <span className="text-[8px]">&apos;</span>
        </p>
      </div>
    </motion.div>
  );
}

// ── Banner flotante para el evento más reciente ──────────────────────────────

function FloatingBanner({ event }: { event: MatchEvent | null }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    // Solo mostrar el banner para tipos relevantes
    const important: MatchEvent['type'][] = [
      'GOAL', 'OWN_GOAL', 'PENALTY_GOAL', 'RED_CARD',
      'SHOOTOUT_GOAL', 'SHOOTOUT_MISSED',
    ];
    if (!important.includes(event.type)) return;

    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 5500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [event]);

  if (!event) return null;
  const cfg = getEventCfg(event.type, event.detail);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={event.occurredAt}
          initial={{ opacity: 0, y: -60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.94 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl max-w-sm w-full"
            style={{
              background: `linear-gradient(135deg, ${alpha(cfg.accent, 0.20)}, ${alpha(hex.bg.primary, 0.97)})`,
              border: `1.5px solid ${alpha(cfg.accent, 0.60)}`,
              boxShadow: `0 8px 48px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.60)`,
            }}
          >
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.4, repeat: 2 }}
            >
              {cfg.icon}
            </motion.span>
            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase" style={{ color: cfg.accent }}>
                {cfg.label}
              </p>
              {event.playerName && (
                <p className="text-base font-black text-white leading-tight">{event.playerName}</p>
              )}
              <p className="text-[10px] font-bold" style={{ color: alpha(cfg.accent, 0.70) }}>
                Min. {event.minute}{event.extraMinute ? `+${event.extraMinute}` : ''}&apos;
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Separador visual para cambios de estado (DESCANSO, INICIO 2T…) ──────────

function StatusDivider({
  event,
  homeCode,
  awayCode,
}: {
  event: MatchEvent;
  homeCode?: string;
  awayCode?: string;
}) {
  const cfg = getEventCfg(event.type, event.detail);
  const hasScore = event.homeScoreAtEvent != null && event.awayScoreAtEvent != null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scaleX: 0.7 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center gap-2 my-1"
    >
      {/* Línea izquierda */}
      <div className="flex-1 h-px" style={{
        background: `linear-gradient(to right, transparent, ${alpha(cfg.accent, 0.35)})`
      }} />

      {/* Contenido central */}
      <div
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl shrink-0"
        style={{
          background: alpha(cfg.accent, 0.08),
          border: `1px solid ${alpha(cfg.accent, 0.25)}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base">{cfg.icon}</span>
          <span className="text-[10px] font-black tracking-[0.20em] uppercase" style={{ color: cfg.accent }}>
            {cfg.label}
          </span>
          {event.minute != null && (
            <span className="text-[9px] font-bold" style={{ color: alpha(cfg.accent, 0.55) }}>
              {event.minute}{event.extraMinute ? `+${event.extraMinute}` : ''}&apos;
            </span>
          )}
        </div>
        {hasScore && (
          <p className="text-[11px] font-black text-white tracking-wide">
            <span style={{ color: alpha(cfg.accent, 0.65) }}>{homeCode}</span>
            {' '}{event.homeScoreAtEvent} – {event.awayScoreAtEvent}{' '}
            <span style={{ color: alpha(cfg.accent, 0.65) }}>{awayCode}</span>
          </p>
        )}
      </div>

      {/* Línea derecha */}
      <div className="flex-1 h-px" style={{
        background: `linear-gradient(to left, transparent, ${alpha(cfg.accent, 0.35)})`
      }} />
    </motion.div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

interface Props {
  events: MatchEvent[];
  isLive?: boolean;
  homeTeamId: number | null;
  homeCode?: string;
  awayCode?: string;
}

export default function LiveEventFeed({ events, isLive = true, homeTeamId, homeCode, awayCode }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ordenar de más reciente a más antiguo.
  // - "fulltime" siempre al tope: fue lo último que ocurrió en el partido.
  // - Otros STATUS_CHANGE restan 0.5 para quedar justo debajo de eventos
  //   regulares al mismo minuto (INICIO 2T en 46' va tras las subs de 46').
  const sortKey = (e: MatchEvent) => {
    if (e.type === 'STATUS_CHANGE' && (e.detail === 'fulltime' || e.detail === 'full time')) {
      return Number.MAX_SAFE_INTEGER;
    }
    const base = (e.minute ?? 0) * 100 + (e.extraMinute ?? 0);
    return e.type === 'STATUS_CHANGE' ? base - 0.5 : base;
  };
  const sorted = [...events].sort((a, b) => sortKey(b) - sortKey(a));

  const latestEvent = sorted[0] ?? null;

  // Cuando llega un nuevo evento, hacer scroll al inicio (más reciente)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [sorted.length]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-3xl"
        >
          {isLive ? '⏳' : '📋'}
        </motion.div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-center"
          style={{ color: alpha(hex.text.secondary, 0.45) }}>
          {isLive ? 'Esperando eventos del partido...' : 'Sin eventos registrados'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Banner flotante para goles y tarjetas rojas */}
      <FloatingBanner event={latestEvent} />

      {/* Contador de eventos + indicador de scroll */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] font-black tracking-[0.2em] uppercase"
          style={{ color: alpha(hex.text.secondary, 0.35) }}>
          {sorted.length} evento{sorted.length !== 1 ? 's' : ''}
        </span>
        {sorted.length > 4 && (
          <span className="text-[9px]" style={{ color: alpha(hex.text.secondary, 0.30) }}>
            ↕ desliza
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="space-y-2 overflow-y-auto"
        style={{
          maxHeight: 460,
          paddingRight: 2,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.10) transparent',
        } as React.CSSProperties}
      >
        <AnimatePresence initial={false}>
          {sorted.map((event, i) => {
            const key = `${event.type}-${event.detail ?? ''}-${event.minute}-${event.extraMinute ?? 0}-${event.teamId ?? 0}-${i}`;
            if (event.type === 'STATUS_CHANGE') {
              return (
                <StatusDivider
                  key={key}
                  event={event}
                  homeCode={homeCode}
                  awayCode={awayCode}
                />
              );
            }
            return (
              <EventCard
                key={key}
                event={event}
                isLatest={i === 0}
                isLive={isLive}
                homeTeamId={homeTeamId}
                homeCode={homeCode}
                awayCode={awayCode}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
