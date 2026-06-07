'use client';

/**
 * Tab "Favoritos" del perfil — conectado al backend.
 *
 * Funcionalidades:
 *   - Lista los equipos favoritos del usuario (cargados desde el backend)
 *   - Muestra el equipo PRINCIPAL con halo dorado y estrella ⭐
 *   - Permite agregar equipos desde el catálogo público (cap 3 si Free)
 *   - Permite quitar y cambiar el principal
 *   - El principal se sincroniza con app_user.favorite_team_id y
 *     determina los 3 partidos que un Free puede predecir gratis
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiPlus, FiStar, FiAlertCircle, FiZap, FiLock } from 'react-icons/fi';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces } from '@/lib/design/effects';
import { SectionLabel } from './ui';
import type { FavoriteTeam, PublicTeam } from '@/services/favoriteTeams';

interface FavoritesTabProps {
  favoriteTeams: FavoriteTeam[];
  allTeams:      PublicTeam[];
  isPremium:     boolean;
  isLoading:     boolean;
  errorMsg:      string | null;
  onAdd:         (teamId: number) => Promise<void>;
  onRemove:      (teamId: number) => Promise<void>;
  onSetPrimary:  (teamId: number) => Promise<void>;
  t: (key: string) => string;
}

const FREE_MAX = 3;

export default function FavoritesTab({
  favoriteTeams,
  allTeams,
  isPremium,
  isLoading,
  errorMsg,
  onAdd,
  onRemove,
  onSetPrimary,
  t,
}: FavoritesTabProps) {

  const [busyTeamId, setBusyTeamId] = useState<number | null>(null);
  const locale = useLocale();

  const handle = async (teamId: number, fn: () => Promise<void>) => {
    setBusyTeamId(teamId);
    try { await fn(); } finally { setBusyTeamId(null); }
  };

  const reachedFreeCap = !isPremium && favoriteTeams.length >= FREE_MAX;
  const sortedFavorites = [...favoriteTeams].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.position - b.position;
  });

  if (isLoading) {
    return (
      <motion.div
        key="favorites-loading"
        className="flex items-center justify-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full border-2"
          style={{
            borderColor: alphaOf('green', 0.20),
            borderTopColor: hex.green.bright,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="favorites"
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      {/* ── Error global ── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{
              background: alpha('#EF4444', 0.10),
              border: `1px solid ${alpha('#EF4444', 0.30)}`,
              color: '#FCA5A5',
            }}
          >
            <FiAlertCircle size={14} />
            <span className="text-[12px] font-semibold">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sección "Mis equipos" ── */}
      {sortedFavorites.length > 0 && (
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: surfaces.card(),
            border: `1px solid ${alpha(hex.accent.pink, 0.18)}`,
            backdropFilter: 'blur(32px)',
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.accent.pink, 0.55)}, transparent)` }} />

          <div className="flex items-center justify-between mb-2">
            <SectionLabel color={hex.accent.pink}>{t('profile.myTeams')}</SectionLabel>

            {/* Badge de plan — distinto Free vs Premium */}
            {isPremium ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.16em] uppercase"
                style={{
                  background: alpha(hex.gold.base, 0.14),
                  border: `1px solid ${alpha(hex.gold.base, 0.45)}`,
                  color: hex.gold.base,
                }}
              >
                <FiZap size={10} /> Pase Mundial · {favoriteTeams.length} sin límite
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.16em] uppercase"
                style={{
                  background: alpha(hex.neutral.white, 0.05),
                  border: `1px solid ${alpha(hex.neutral.white, 0.12)}`,
                  color: hex.text.secondary,
                }}
              >
                Plan gratuito · {favoriteTeams.length} / {FREE_MAX}
              </span>
            )}
          </div>

          <p className="text-[11px] leading-relaxed mb-4" style={{ color: hex.text.muted }}>
            {isPremium ? (
              <>
                Marca tu equipo del corazón con <span style={{ color: hex.gold.base }}>⭐</span>.
                Aparecerá destacado y como tu principal en toda la app.
              </>
            ) : (
              <>
                Marca tu equipo principal con <span style={{ color: hex.gold.base }}>⭐</span>.
                Sus <strong style={{ color: hex.text.primary }}>3 partidos de fase de grupos</strong> son los
                únicos que puedes predecir gratis.{' '}
                <Link href={`/${locale}/premium`} className="underline" style={{ color: hex.gold.base }}>
                  Hazte Premium
                </Link>{' '}
                para predecir todos los partidos del Mundial.
              </>
            )}
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {sortedFavorites.map(team => {
              const isBusy = busyTeamId === team.teamId;
              return (
                <motion.div
                  key={team.teamId}
                  layout
                  whileHover={{ scale: 1.04 }}
                  className="relative group rounded-2xl overflow-hidden"
                  style={{
                    background: team.isPrimary
                      ? `linear-gradient(160deg, ${alpha(hex.gold.base, 0.10)}, ${alpha(hex.gold.muted, 0.05)})`
                      : alpha(hex.neutral.white, 0.03),
                    border: team.isPrimary
                      ? `1px solid ${alpha(hex.gold.base, 0.55)}`
                      : `1px solid ${alpha(hex.neutral.white, 0.07)}`,
                    boxShadow: team.isPrimary
                      ? `0 0 24px ${alpha(hex.gold.base, 0.25)}`
                      : 'none',
                  }}
                >
                  {/* Estrella si es principal */}
                  {team.isPrimary && (
                    <div
                      className="absolute top-1 right-1 z-10 flex items-center justify-center rounded-full"
                      style={{
                        width: 20, height: 20,
                        background: hex.gold.base,
                        boxShadow: `0 2px 8px ${alpha(hex.gold.base, 0.55)}`,
                      }}
                    >
                      <FiStar size={11} style={{ color: hex.neutral.black, fill: hex.neutral.black }} />
                    </div>
                  )}

                  <div className="aspect-square p-2 flex items-center justify-center">
                    {team.flagUrl ? (
                      <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full rounded-lg flex items-center justify-center"
                        style={{ background: alpha(hex.neutral.white, 0.06), color: hex.text.muted }}>
                        <span className="text-xs font-black">{team.shortName || team.fifaCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Overlay con acciones */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
                    style={{ background: alpha(hex.neutral.black, 0.78), backdropFilter: 'blur(4px)' }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    animate={{ opacity: isBusy ? 1 : undefined }}
                    transition={{ duration: 0.18 }}
                  >
                    {isBusy ? (
                      <motion.div
                        className="w-5 h-5 rounded-full border-2"
                        style={{ borderColor: alpha(hex.gold.base, 0.30), borderTopColor: hex.gold.base }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <>
                        {!team.isPrimary && (
                          <button
                            onClick={() => handle(team.teamId, () => onSetPrimary(team.teamId))}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black tracking-wide"
                            style={{
                              background: alpha(hex.gold.base, 0.20),
                              border: `1px solid ${alpha(hex.gold.base, 0.45)}`,
                              color: hex.gold.base,
                            }}
                          >
                            <FiStar size={10} /> Principal
                          </button>
                        )}
                        <button
                          onClick={() => handle(team.teamId, () => onRemove(team.teamId))}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black tracking-wide"
                          style={{
                            background: alpha(hex.accent.redSoft, 0.15),
                            border: `1px solid ${alpha(hex.accent.redSoft, 0.35)}`,
                            color: hex.accent.redSoft,
                          }}
                        >
                          <FiTrash2 size={10} /> {t('common.delete')}
                        </button>
                      </>
                    )}
                  </motion.div>

                  <p className="text-[10px] font-black text-center py-1.5 tracking-wide"
                    style={{ color: team.isPrimary ? hex.gold.base : hex.text.secondary }}>
                    {team.shortName || team.fifaCode || team.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sección "Agregar equipos" ── */}
      {allTeams.filter(team => !favoriteTeams.find(f => f.teamId === team.id)).length > 0 && (
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: surfaces.card(),
            border: `1px solid ${alphaOf('green', 0.14)}`,
            backdropFilter: 'blur(32px)',
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.40)}, transparent)` }} />

          <div className="flex items-center justify-between mb-2">
            <SectionLabel color={hex.green.bright}>{t('profile.addTeams')}</SectionLabel>

            {/* Indicador de cuántos puede agregar más */}
            {!isPremium && !reachedFreeCap && (() => {
              const restantes = FREE_MAX - favoriteTeams.length;
              return (
                <span
                  className="text-[10px] font-black tracking-[0.16em] uppercase"
                  style={{ color: hex.text.muted }}
                >
                  {restantes === 1 ? 'Te queda 1 cupo gratis' : `Te quedan ${restantes} cupos gratis`}
                </span>
              );
            })()}
            {isPremium && (
              <span
                className="text-[10px] font-black tracking-[0.16em] uppercase"
                style={{ color: hex.gold.base }}
              >
                Sin límite con tu Pase
              </span>
            )}
          </div>

          {/* Banner cuando Free llegó al tope */}
          {reachedFreeCap && (
            <div className="mb-3 flex items-start gap-2.5 rounded-xl px-3 py-2.5"
              style={{
                background: alpha(hex.gold.base, 0.08),
                border: `1px solid ${alpha(hex.gold.base, 0.30)}`,
              }}
            >
              <FiLock size={14} style={{ color: hex.gold.base, marginTop: 2 }} />
              <div className="flex-1">
                <p className="text-[11px] font-black tracking-wide mb-0.5" style={{ color: hex.gold.base }}>
                  Alcanzaste el máximo del plan gratuito
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: hex.text.secondary }}>
                  Solo puedes tener <strong>{FREE_MAX} equipos favoritos</strong> con el plan gratuito.{' '}
                  <Link href={`/${locale}/premium`} className="underline" style={{ color: hex.gold.base }}>
                    Hazte Premium
                  </Link>{' '}
                  para favoritos ilimitados.
                </p>
              </div>
            </div>
          )}

          {/* Aviso suave cuando Free está cerca del tope (2/3) */}
          {!isPremium && !reachedFreeCap && favoriteTeams.length === FREE_MAX - 1 && (
            <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: alpha(hex.accent.pink, 0.06),
                border: `1px solid ${alpha(hex.accent.pink, 0.20)}`,
              }}
            >
              <FiAlertCircle size={13} style={{ color: hex.accent.pink }} />
              <p className="text-[11px]" style={{ color: hex.text.secondary }}>
                Te queda <strong style={{ color: hex.text.primary }}>1 cupo gratis</strong>. Elige bien tu próximo equipo.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {allTeams
              .filter(team => !favoriteTeams.find(f => f.teamId === team.id))
              .map(team => {
                const isBusy = busyTeamId === team.id;
                return (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: reachedFreeCap ? 1 : 1.05 }}
                    whileTap={{ scale: reachedFreeCap ? 1 : 0.96 }}
                    onClick={() => {
                      if (!reachedFreeCap && !isBusy) {
                        handle(team.id, () => onAdd(team.id));
                      }
                    }}
                    className="relative group rounded-2xl overflow-hidden"
                    style={{
                      background: alpha(hex.neutral.white, 0.02),
                      border: `1px solid ${alpha(hex.neutral.white, 0.06)}`,
                      cursor: reachedFreeCap ? 'not-allowed' : 'pointer',
                      opacity: reachedFreeCap ? 0.40 : 1,
                    }}
                  >
                    <div className="aspect-square p-2 flex items-center justify-center">
                      {team.flagUrl ? (
                        <img src={team.flagUrl} alt={team.name}
                          className="w-full h-full object-cover rounded-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center"
                          style={{ background: alpha(hex.neutral.white, 0.06), color: hex.text.muted }}>
                          <span className="text-xs font-black">{team.shortName || team.fifaCode}</span>
                        </div>
                      )}
                    </div>

                    {!reachedFreeCap && (
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl"
                        style={{ background: alphaOf('green', 0.18), backdropFilter: 'blur(4px)' }}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        animate={{ opacity: isBusy ? 1 : undefined }}
                        transition={{ duration: 0.18 }}
                      >
                        {isBusy ? (
                          <motion.div
                            className="w-5 h-5 rounded-full border-2"
                            style={{ borderColor: alphaOf('green', 0.30), borderTopColor: hex.green.bright }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          <>
                            <FiPlus size={16} style={{ color: hex.green.bright }} />
                            <span className="text-[9px] font-black tracking-wide" style={{ color: hex.green.bright }}>
                              +
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}

                    <p className="text-[10px] font-black text-center py-1.5 tracking-wide"
                      style={{ color: hex.text.muted }}>
                      {team.shortName || team.fifaCode || team.name}
                    </p>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {favoriteTeams.length === 0 && allTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: hex.text.muted }}>
          <FiHeart size={40} style={{ opacity: 0.3 }} />
          <p className="text-sm font-semibold mt-3">{t('profile.noFavorites')}</p>
        </div>
      )}
    </motion.div>
  );
}
