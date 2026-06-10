'use client';

/**
 * TeamSquadModal — plantilla nacional con diseño coherente con la app.
 *
 * Comportamiento:
 *   - Free / anónimo → ve 11 jugadores + CTA "Hazte Premium para ver todos".
 *   - Premium        → ve la lista completa.
 *
 * Aclaración honesta al usuario: API-Football devuelve la plantilla actual
 * del seleccionado (no la lista oficial de 26 del Mundial). Se explica en
 * un tooltip pequeño debajo del título.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiX, FiInfo, FiLock, FiUser } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import { useTeamSquad, type SquadPlayer } from '@/hooks/useTournamentData';

interface Props {
  open:        boolean;
  onClose:     () => void;
  teamId:      number | null;
  teamName:    string;
  teamShort:   string;
  flagUrl:     string;
  isPremium:   boolean;
  /** Locale para enrutar el botón Premium (preserva /es o /en). */
  locale:      string;
}

const POSITION_COLORS: Record<string, string> = {
  'Goalkeeper': hex.gold.base,
  'Defender':   hex.green.bright,
  'Midfielder': '#60A5FA',
  'Attacker':   '#F87171',
};

function PositionPill({ position }: { position: string | null }) {
  const color = (position && POSITION_COLORS[position]) || alpha(hex.text.muted, 0.6);
  const label = position ? position.slice(0, 3).toUpperCase() : '—';
  return (
    <span className="text-[9px] font-black tracking-[0.18em] px-1.5 py-0.5 rounded"
      style={{ background: alpha(color, 0.12), color, border: `1px solid ${alpha(color, 0.28)}` }}>
      {label}
    </span>
  );
}

function PlayerCard({ p, idx }: { p: SquadPlayer; idx: number }) {
  const posColor = (p.position && POSITION_COLORS[p.position]) || alpha(hex.text.muted, 0.6);
  // Apellido en mayúsculas para impacto visual estilo "stadium scoreboard".
  // El backend devuelve "C. Acevedo" o "G. Ochoa" — tomamos lo que esté tras el último punto.
  const lastName = (() => {
    const parts = (p.playerName || '').split(/\s+/).filter(Boolean);
    return (parts[parts.length - 1] || p.playerName || '').toUpperCase();
  })();
  const initial = (() => {
    const parts = (p.playerName || '').split(/\s+/).filter(Boolean);
    return parts.length > 1 ? parts[0] : '';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.025, 0.5), duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col items-center pt-7 pb-4 px-3 rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(170deg, ${alpha(hex.bg.primary, 0.85)} 0%, ${alpha(hex.neutral.black, 0.95)} 100%)`,
        border: `1px solid ${alphaOf('green', 0.10)}`,
        boxShadow: `0 4px 18px ${alpha(hex.neutral.black, 0.45)}`,
      }}>
      {/* Banner vertical de color de posición — pista visual */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, ${posColor}, transparent)` }} />

      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at center top, ${alphaOf('green', 0.14)}, transparent 65%)` }} />

      {/* Dorsal flotante (esquina superior izquierda) */}
      <div className="absolute top-2 left-2 min-w-[28px] h-7 px-2 rounded-md flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${alphaOf('green', 0.18)}, ${alpha(hex.bg.primary, 0.7)})`,
          border: `1px solid ${alphaOf('green', 0.32)}`,
          boxShadow: `0 0 12px ${alphaOf('green', 0.18)}`,
        }}>
        <span className="text-[12px] font-black tabular-nums leading-none"
          style={{ color: hex.green.bright, textShadow: `0 0 6px ${alphaOf('green', 0.55)}` }}>
          {p.shirtNumber ?? '–'}
        </span>
      </div>

      {/* Posición pill (esquina superior derecha) */}
      <div className="absolute top-2 right-2">
        <PositionPill position={p.position} />
      </div>

      {/* Foto grande circular */}
      <div className="relative w-[78px] h-[78px] rounded-full overflow-hidden mb-3"
        style={{
          border: `2px solid ${alphaOf('green', 0.25)}`,
          boxShadow: `0 6px 20px ${alpha(hex.neutral.black, 0.55)}, 0 0 24px ${alphaOf('green', 0.10)}`,
          background: alpha(hex.bg.primary, 0.8),
        }}>
        {p.photoUrl ? (
          <Image src={p.photoUrl} alt={p.playerName} width={78} height={78}
            className="w-full h-full object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiUser size={32} style={{ color: alpha(hex.text.muted, 0.4) }} />
          </div>
        )}
        {/* Aro de glow al hover */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 14px ${alphaOf('green', 0.35)}` }} />
      </div>

      {/* Nombre */}
      <div className="w-full text-center mb-1">
        {initial && (
          <p className="text-[9px] font-medium tracking-[0.18em] uppercase leading-none mb-0.5"
            style={{ color: alpha(hex.text.muted, 0.5) }}>
            {initial}
          </p>
        )}
        <p className="text-[12px] font-black tracking-[0.05em] truncate leading-tight"
          style={{ color: hex.text.primary }}>
          {lastName}
        </p>
      </div>

      {/* Edad */}
      {p.age != null && (
        <span className="text-[9px] font-bold tracking-[0.18em]"
          style={{ color: alpha(hex.text.muted, 0.55) }}>
          {p.age} AÑOS
        </span>
      )}
    </motion.div>
  );
}

export default function TeamSquadModal({
  open, onClose, teamId, teamName, teamShort, flagUrl, isPremium, locale,
}: Props) {
  const { data, isLoading, isError } = useTeamSquad(teamId, open);
  const players = data ?? [];
  const totalShown = players.length;

  // Portal: evita stacking-context issues con tabs sticky (backdrop-filter crea
  // su propio contexto y rompe el z-index del modal).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Bloqueo de scroll del body + Escape para cerrar mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Backend ya filtra a 11 para Free. El gate Premium se muestra cuando:
  //   - El backend nos devolvió EXACTAMENTE 11 jugadores (señal de que truncó), Y
  //   - El JWT del frontend dice que NO somos Premium.
  //
  // Confiamos en el conteo del backend antes que en `isPremium` del JWT (que
  // puede estar stale si el upgrade ocurrió en esta misma sesión sin re-login).
  // Si totalShown > 11, ya tenemos la plantilla completa — no hay nada que ocultar.
  const FREE_LIMIT = 11;
  const APPROX_FULL = 26;
  const gotFullList = totalShown > FREE_LIMIT;
  const showFreeBadge = !gotFullList && !isPremium;
  const hiddenCount = showFreeBadge ? APPROX_FULL - FREE_LIMIT : 0;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: alpha(hex.neutral.black, 0.78), backdropFilter: 'blur(8px)' }} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${alpha(hex.bg.primary, 0.97)}, ${alpha(hex.neutral.black, 0.99)})`,
                border: `1px solid ${alphaOf('green', 0.22)}`,
                boxShadow: `0 30px 90px ${alpha(hex.neutral.black, 0.75)}, 0 0 80px ${alphaOf('green', 0.10)}`,
              }}>
              {/* Borde superior con gradient */}
              <div className="h-px" style={{ background: gradients.divider('green', 0.65) }} />

              {/* Header */}
              <div className="relative px-5 py-4 flex items-center gap-3"
                style={{ borderBottom: `1px solid ${alphaOf('green', 0.10)}`,
                         background: `linear-gradient(135deg, ${alphaOf('green', 0.06)}, transparent 70%)` }}>
                {/* Bandera */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden"
                  style={{ boxShadow: `0 4px 16px ${alpha(hex.neutral.black, 0.4)}, 0 0 20px ${alphaOf('green', 0.15)}` }}>
                  {flagUrl ? (
                    <Image src={flagUrl} alt={teamName} width={48} height={48}
                      className="w-full h-full object-cover" unoptimized />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight truncate"
                    style={{ color: hex.text.primary }}>
                    {teamName}
                  </h2>
                  <p className="text-[10px] font-black tracking-[0.25em] mt-0.5"
                    style={{ color: hex.green.bright }}>
                    {teamShort} · PLANTILLA NACIONAL
                  </p>
                </div>

                {/* Close */}
                <button onClick={onClose}
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: alpha(hex.bg.primary, 0.6), border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}>
                  <FiX size={18} style={{ color: alpha(hex.text.muted, 0.8) }} />
                </button>
              </div>

              {/* Aclaración honesta sobre el origen del dato */}
              <div className="px-5 py-2.5 flex items-start gap-2"
                style={{ background: alpha(hex.bg.primary, 0.4),
                         borderBottom: `1px solid ${alphaOf('green', 0.06)}` }}>
                <FiInfo size={11} style={{ color: alpha(hex.gold.base, 0.7), marginTop: 2, flexShrink: 0 }} />
                <p className="text-[10px] leading-relaxed" style={{ color: alpha(hex.text.muted, 0.75) }}>
                  Plantilla actual del seleccionado. Puede diferir de la lista oficial del Mundial mientras se sincronizan los datos del torneo.
                </p>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3"
                style={{ scrollbarWidth: 'thin', scrollbarColor: `${alphaOf('green', 0.25)} transparent` }}>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <motion.div className="w-9 h-9 rounded-full border-2"
                      style={{ borderColor: alphaOf('green', 0.18), borderTopColor: hex.green.bright }}
                      animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
                    <p className="text-[9px] tracking-[0.3em] uppercase font-bold"
                      style={{ color: alphaOf('green', 0.55) }}>
                      Cargando plantilla
                    </p>
                  </div>
                )}

                {isError && (
                  <div className="text-center py-12">
                    <p className="text-[12px]" style={{ color: alpha(hex.status.danger, 0.85) }}>
                      No se pudo cargar la plantilla. Reintenta más tarde.
                    </p>
                  </div>
                )}

                {!isLoading && !isError && players.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[12px]" style={{ color: alpha(hex.text.muted, 0.7) }}>
                      Sin datos de plantilla disponibles.
                    </p>
                  </div>
                )}

                {!isLoading && players.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {players.map((p, i) => <PlayerCard key={p.playerId} p={p} idx={i} />)}
                  </div>
                )}

                {/* Premium gate al final — solo cuando el backend truncó la lista */}
                {showFreeBadge && hiddenCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="mt-4 p-4 rounded-xl flex items-center gap-3"
                    style={{
                      background: `linear-gradient(135deg, ${alphaOf('gold', 0.10)}, ${alpha(hex.bg.primary, 0.7)})`,
                      border: `1px solid ${alphaOf('gold', 0.25)}`,
                    }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: alphaOf('gold', 0.15), border: borders.brand('gold', 0.35) }}>
                      <FiLock size={16} style={{ color: hex.gold.base }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black" style={{ color: hex.gold.base }}>
                        +{hiddenCount} jugadores ocultos
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: alpha(hex.text.muted, 0.75) }}>
                        Hazte Premium para ver la plantilla nacional completa.
                      </p>
                    </div>
                    <a href={`/${locale}/premium`}
                      className="flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-black tracking-[0.15em]"
                      style={{
                        background: `linear-gradient(135deg, ${hex.gold.base}, ${alpha(hex.gold.muted, 0.85)})`,
                        color: hex.neutral.black,
                        boxShadow: `0 4px 16px ${alphaOf('gold', 0.35)}`,
                      }}>
                      VER PREMIUM
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Footer count */}
              <div className="px-5 py-2.5 flex items-center justify-between"
                style={{ borderTop: `1px solid ${alphaOf('green', 0.08)}`,
                         background: alpha(hex.bg.primary, 0.5) }}>
                <span className="text-[9px] font-black tracking-[0.2em]"
                  style={{ color: alpha(hex.text.muted, 0.55) }}>
                  {totalShown} {totalShown === 1 ? 'JUGADOR' : 'JUGADORES'}{' '}
                  {gotFullList
                    ? <span style={{ color: hex.gold.base }}>· PREMIUM</span>
                    : showFreeBadge ? '· VISTA FREE' : ''}
                </span>
                <span className="text-[8px] font-medium tracking-wider"
                  style={{ color: alpha(hex.text.muted, 0.4) }}>
                  Datos vía API-Football
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
