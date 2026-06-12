'use client';

/**
 * Groups page — migrated to the design-token system.
 *
 * 🛡️ PROTECTED: <Bracket /> from BracketChampions.tsx — do NOT refactor.
 *
 * Sub-componentes extraídos a ./_components/:
 *   - GroupCard      → tarjeta de tabla de posiciones por grupo
 *   - KnockoutCard   → tarjeta de partido eliminatorio
 *   - ChampionBanner → banner del campeón (final ganada)
 *   - BracketBg      → fondo decorativo del bracket en desktop
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { FiAward, FiBarChart2, FiShield, FiUsers } from 'react-icons/fi';
import Image from 'next/image';
import { Header } from '@/components/Navigation';
import { Bracket } from '@/components/BracketChampions';  // 🛡️ PROTECTED
import { useCurrentTournament, useTournamentGroups, useTournamentFixtures } from '@/hooks/useTournamentData';
import { useTranslations, useLocale } from 'next-intl';
import TourButton from '@/components/Tour/TourButton';
import { getTourSteps } from '@/components/Tour/tourSteps';

import { hex, type BrandColor } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import { apiFetch } from '@/lib/apiFetch';

import { AdsterraBanner } from '@/components/ads';
import GroupCard, { EQBars } from './_components/GroupCard';
import { localizeTeamName } from '@/lib/i18n/teamNames';
import KnockoutCard, { ChampionBanner, ROUND_META, ROUND_I18N, ROUND_GRID } from './_components/KnockoutCard';
import BracketBg from './_components/BracketBg';
import TeamsTab from './_components/TeamsTab';
import { usePremium } from '@/hooks/usePremium';
import type { Group, Match, BracketData, KnockoutRound, Team } from './_components/types';

/* ══════════════════════════════════════════
   MOCK DATA — fallback si backend retorna vacío
══════════════════════════════════════════ */
const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Grupo A', standings: [
    { position: 1, team: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 6 },
    { position: 2, team: { id: 2, name: 'Uruguay',   shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 2 },
    { position: 3, team: { id: 3, name: 'Paraguay',  shortName: 'PAR', flagUrl: 'https://flagcdn.com/py.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -4 },
    { position: 4, team: { id: 4, name: 'Canadá',    shortName: 'CAN', flagUrl: 'https://flagcdn.com/ca.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -4 },
  ]},
  { id: 2, name: 'Grupo B', standings: [
    { position: 1, team: { id: 5, name: 'Brasil',  shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 8 },
    { position: 2, team: { id: 6, name: 'España',  shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 3 },
    { position: 3, team: { id: 7, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -2 },
    { position: 4, team: { id: 8, name: 'Jamaica', shortName: 'JAM', flagUrl: 'https://flagcdn.com/jm.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -9 },
  ]},
  { id: 3, name: 'Grupo C', standings: [
    { position: 1, team: { id: 9,  name: 'México',   shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' }, points: 7, played: 3, won: 2, drawn: 1, lost: 0, goalDiff: 4 },
    { position: 2, team: { id: 10, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' }, points: 5, played: 3, won: 1, drawn: 2, lost: 0, goalDiff: 1 },
    { position: 3, team: { id: 11, name: 'Ecuador',  shortName: 'ECU', flagUrl: 'https://flagcdn.com/ec.svg' }, points: 2, played: 3, won: 0, drawn: 2, lost: 1, goalDiff: -2 },
    { position: 4, team: { id: 12, name: 'Bolivia',  shortName: 'BOL', flagUrl: 'https://flagcdn.com/bo.svg' }, points: 1, played: 3, won: 0, drawn: 1, lost: 2, goalDiff: -3 },
  ]},
  { id: 4, name: 'Grupo D', standings: [
    { position: 1, team: { id: 13, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 7 },
    { position: 2, team: { id: 14, name: 'Alemania', shortName: 'GER', flagUrl: 'https://flagcdn.com/de.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 3 },
    { position: 3, team: { id: 15, name: 'Ghana',    shortName: 'GHA', flagUrl: 'https://flagcdn.com/gh.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -4 },
    { position: 4, team: { id: 16, name: 'Japón',    shortName: 'JPN', flagUrl: 'https://flagcdn.com/jp.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -6 },
  ]},
];

const _tbd: Team = { id: 0, name: 'Por definir', shortName: 'TBD', flagUrl: '' };

const EMPTY_BRACKET: BracketData = {
  octavos:     Array.from({ length: 8 }, (_, i) => ({ id: -(i + 1), homeTeam: _tbd, awayTeam: _tbd, isPlayed: false })),
  cuartos:     Array.from({ length: 4 }, (_, i) => ({ id: -(i + 9), homeTeam: _tbd, awayTeam: _tbd, isPlayed: false })),
  semifinales: Array.from({ length: 2 }, (_, i) => ({ id: -(i + 13), homeTeam: _tbd, awayTeam: _tbd, isPlayed: false })),
  final:       [{ id: -15, homeTeam: _tbd, awayTeam: _tbd, isPlayed: false }],
};

/* ══════════════════════════════════════════
   BRACKET BUILDER
══════════════════════════════════════════ */
function buildBracketFromFixtures(fixtures: any[]): BracketData {
  const toMatch = (f: any): Match => {
    const winner = typeof f.homeScore === 'number' && typeof f.awayScore === 'number'
      ? f.homeScore > f.awayScore ? f.homeTeam : f.awayScore > f.homeScore ? f.awayTeam : null : null;
    return { id: f.id, homeTeam: f.homeTeam, awayTeam: f.awayTeam, homeScore: f.homeScore, awayScore: f.awayScore, winner, isPlayed: f.status === 'FINISHED' };
  };
  const b: BracketData = { octavos: [], cuartos: [], semifinales: [], final: [] };
  fixtures.forEach(f => {
    const s = (f.stageName || '').toLowerCase();
    if (s.includes('octavos')) b.octavos.push(toMatch(f));
    else if (s.includes('cuartos')) b.cuartos.push(toMatch(f));
    else if (s.includes('semi')) b.semifinales.push(toMatch(f));
    else if (s.includes('final')) b.final.push(toMatch(f));
  });
  return b;
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function GroupsClient({ initialTournament, initialGroups, initialFixtures }: {
  initialTournament?: any;
  initialGroups?: any[];
  initialFixtures?: any[];
}) {
  const t      = useTranslations();
  const locale = useLocale();
  const [activeTab,    setActiveTab]    = useState<'grupos' | 'eliminatorias' | 'equipos'>('grupos');
  const { isPremium } = usePremium();
  const [activeRound,  setActiveRound]  = useState<KnockoutRound>('octavos');
  const [bestDefense,  setBestDefense]  = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    apiFetch('/api/v1/public/standings/best-defense')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (active && d?.data) setBestDefense(d.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const { data: tournament }                                       = useCurrentTournament(initialTournament);
  const { data: rawGroups   = [], isLoading: loadingGroups }       = useTournamentGroups(tournament?.id ?? null, initialGroups);
  const { data: fixtures    = [], isLoading: loadingFixtures }     = useTournamentFixtures(tournament?.id ?? null, initialFixtures);

  const loading = loadingGroups || loadingFixtures;

  const groups: Group[] = useMemo(() =>
    rawGroups.length > 0
      ? rawGroups.map((g: any) => ({
          id: g.id, name: `${t('groups.groupLabel')} ${g.code ?? g.name?.replace(/^grupo\s+/i, '') ?? ''}`.trim(),
          standings: (g.standings ?? []).map((s: any) => ({
            position: s.position,
            team: { id: s.teamId, name: localizeTeamName(s.teamName, locale), shortName: s.teamShortName ?? s.teamFifaCode ?? s.teamName,
              flagUrl: s.teamFlagUrl ?? `https://flagcdn.com/${(s.teamFifaCode ?? 'un').toLowerCase()}.svg` },
            points: s.points, played: s.played, won: s.won, drawn: s.drawn, lost: s.lost,
            goalDiff: s.goalDifference ?? (s.goalsFor - s.goalsAgainst),
          })),
        }))
      : MOCK_GROUPS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawGroups]
  );

  const bracketsData: BracketData = useMemo(() => {
    if (!fixtures.length) return EMPTY_BRACKET;
    const bk = buildBracketFromFixtures(fixtures);
    const hasKnockout = bk.octavos.length > 0 || bk.cuartos.length > 0 || bk.semifinales.length > 0 || bk.final.length > 0;
    return hasKnockout ? bk : EMPTY_BRACKET;
  }, [fixtures]);

  const champion = bracketsData?.final[0]?.winner ?? null;
  const pageBg   = `radial-gradient(ellipse at 22% 30%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 50%, ${hex.bg.primary} 100%)`;

  return (
    <div className="w-full relative">

      {/* Ambient orbs — CSS puro (sin JS Framer Motion loop) */}
      <div className="animate-orb fixed rounded-full pointer-events-none"
        style={{ width: 650, height: 650, top: -200, left: -130,
          background: gradients.cornerGlow('success', 0.07).replace('circle,', 'circle at center,'),
          filter: 'blur(75px)', zIndex: 0 }} />
      <div className="animate-orb-slow fixed rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -80, right: -80,
          background: gradients.cornerGlow('green', 0.06).replace('circle,', 'circle at center,'),
          filter: 'blur(65px)', zIndex: 0 }} />

      {/* Tech grid */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.022]" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="g-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={hex.green.bright} strokeWidth="0.4" />
          </pattern>
          <radialGradient id="g-fade" cx="40%" cy="30%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="g-mask"><rect width="100%" height="100%" fill="url(#g-fade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#g-grid)" mask="url(#g-mask)" />
      </svg>

      <div className="relative z-10">
        <Header title="⚽ Orionix Gol" subtitle={t('groups.subtitle')} centered />
      </div>

      {/* ── STICKY TAB BAR ── */}
      <div data-tour="groups-tabs" className="sticky top-0 z-40"
        style={{ background: alpha(hex.bg.primary, 0.92),
                 borderBottom: `1px solid ${alphaOf('green', 0.10)}`,
                 backdropFilter: 'blur(20px)',
                 boxShadow: `0 4px 32px ${alpha(hex.neutral.black, 0.55)}` }}>
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.25)}, ${alphaOf('gold', 0.15)}, transparent)` }} />
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {([
            { key: 'grupos'        as const, label: t('groups.title'),    icon: <FiBarChart2 size={13} />, brand: 'green' as BrandColor, colorHex: hex.green.bright },
            { key: 'eliminatorias' as const, label: t('groups.knockout'), icon: <FiAward size={13} />,    brand: 'gold'  as BrandColor, colorHex: hex.gold.muted   },
            { key: 'equipos'       as const, label: 'Equipos',            icon: <FiUsers size={13} />,    brand: 'green' as BrandColor, colorHex: hex.green.muted  },
          ]).map(({ key, label, icon, brand, colorHex }) => {
            const isActive = activeTab === key;
            const glow = alphaOf(brand, 0.55);
            return (
              <motion.button key={key} onClick={() => setActiveTab(key)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: isActive ? `linear-gradient(135deg, ${alphaOf(brand, 0.085)}, ${alpha(hex.bg.primary, 0.85)})` : 'transparent',
                  border: `1px solid ${isActive ? alphaOf(brand, 0.19) : 'transparent'}`,
                  outline: 'none', cursor: 'pointer' }}
                whileTap={{ scale: 0.96 }}>
                {isActive && (
                  <motion.div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: gradients.divider(brand, 0.65) }} />
                )}
                <span style={{ color: isActive ? colorHex : alpha(hex.text.muted, 0.60), filter: isActive ? `drop-shadow(0 0 5px ${glow})` : 'none', display: 'flex' }}>{icon}</span>
                <span className="text-[11px] font-black tracking-[0.10em] whitespace-nowrap"
                  style={{ color: isActive ? colorHex : alpha(hex.text.muted, 0.60), textShadow: isActive ? `0 0 10px ${glow}` : 'none' }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
          <div className="flex-1 min-w-2" />
          <div className="flex items-center shrink-0">
            <EQBars color={alphaOf('green', 0.30)} count={7} maxH={14} />
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 py-5 pb-32">

        {loading ? (
          <div className="flex items-center justify-center min-h-80">
            <div className="flex flex-col items-center gap-4">
              <motion.div className="w-12 h-12 rounded-full border-2"
                style={{ borderColor: alphaOf('green', 0.20), borderTopColor: hex.green.bright }}
                animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
              <p className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ color: alphaOf('green', 0.6) }}>{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ═══════ GRUPOS ═══════ */}
            {activeTab === 'grupos' && (
              <motion.div key="grupos"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}>
                <motion.div className="flex items-center gap-3 mb-5"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.muted})` }} />
                    <h2 className="text-xl font-black text-white tracking-wide">{t('groups.standings')}</h2>
                  </div>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.25)}, transparent)` }} />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: alphaOf('green', 0.07), border: borders.brand('green', 0.18) }}>
                    <FiBarChart2 size={10} style={{ color: hex.green.bright }} />
                    <span className="text-[8px] font-black text-green-400 tracking-[0.2em]">{groups.length} {t('groups.title').toUpperCase()}</span>
                  </div>
                </motion.div>
                <div data-tour="groups-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((g, i) => <GroupCard key={g.id} group={g} index={i} t={t} />)}
                </div>
                <motion.div className="mt-5 flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-sm"
                      style={{ background: alphaOf('green', 0.20), border: borders.brand('green', 0.35) }} />
                    <span className="text-[9px] font-medium text-orionix-text-muted">{t('groups.qualifyShort')}</span>
                  </div>
                  {[
                    { c: hex.green.hover,   abbr: t('groups.won'),   label: t('groups.legendWon')   },
                    { c: hex.gold.muted,    abbr: t('groups.drawn'), label: t('groups.legendDrawn') },
                    { c: hex.status.danger, abbr: t('groups.lost'),  label: t('groups.legendLost')  },
                    { c: hex.text.muted,    abbr: t('groups.goals'), label: t('groups.legendGoals') },
                  ].map(({ c, abbr, label }) => (
                    <div key={abbr} className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black" style={{ color: c }}>{abbr}</span>
                      <span className="text-[9px] text-orionix-text-muted">— {label}</span>
                    </div>
                  ))}
                </motion.div>

                {/* ── MEJOR DEFENSA ── */}
                {bestDefense.length > 0 && (
                  <motion.div className="mt-6 relative overflow-hidden rounded-2xl"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.96)})`,
                      border: `1px solid ${alpha(hex.status.info, 0.12)}`,
                      boxShadow: `0 12px 40px ${alpha(hex.neutral.black, 0.45)}` }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.status.info, 0.55)}, transparent)` }} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-[3px] h-5 rounded-full"
                          style={{ background: `linear-gradient(180deg, ${hex.status.info}, ${alpha(hex.status.info, 0.4)})` }} />
                        <FiShield size={12} style={{ color: hex.status.info }} />
                        <span className="text-[10px] font-black tracking-[0.24em] uppercase" style={{ color: alpha(hex.text.secondary, 0.6) }}>
                          {t('groups.bestDefense')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {bestDefense.slice(0, 8).map((row: any, i: number) => (
                          <motion.div key={row.teamId ?? i}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 + i * 0.04 }}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl"
                            style={{ background: i === 0
                              ? `linear-gradient(90deg, ${alpha(hex.status.info, 0.08)}, transparent)`
                              : alpha(hex.neutral.white, 0.02),
                              border: `1px solid ${i === 0 ? alpha(hex.status.info, 0.18) : alpha(hex.neutral.white, 0.04)}` }}>
                            <span className="text-[10px] font-black tabular-nums w-4 text-center shrink-0"
                              style={{ color: i === 0 ? hex.status.info : alpha(hex.text.secondary, 0.4) }}>
                              {i + 1}
                            </span>
                            {(row.teamFlagUrl || row.flagUrl) && (
                              <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                <Image src={row.teamFlagUrl ?? row.flagUrl} alt={row.teamName ?? ''} fill className="object-cover" />
                              </div>
                            )}
                            <span className="flex-1 text-[11px] font-bold truncate" style={{ color: hex.text.primary }}>
                              {localizeTeamName(row.teamName ?? row.name, locale)}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-black tabular-nums" style={{ color: hex.status.info }}>
                                {row.goalsAgainst ?? row.goalsConceeded ?? 0}
                              </span>
                              <span className="text-[8px]" style={{ color: alpha(hex.text.secondary, 0.35) }}>{t('groups.goalsConceded')}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ═══════ ELIMINATORIAS ═══════ */}
            {activeTab === 'eliminatorias' && bracketsData && (
              <motion.div key="eliminatorias" data-tour="groups-knockout"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}>

                <motion.div className="flex items-center gap-3 mb-5"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-2">
                    <motion.div className="w-[3px] h-5 rounded-full"
                      style={{ background: `linear-gradient(180deg, ${hex.gold.muted}, ${hex.gold.dark})` }}
                      animate={{ boxShadow: [`0 0 6px ${alphaOf('gold', 0.4)}`, `0 0 18px ${alphaOf('gold', 0.9)}`, `0 0 6px ${alphaOf('gold', 0.4)}`] }}
                      transition={{ duration: 2.2, repeat: Infinity }} />
                    <h2 className="text-xl font-black text-white tracking-wide">{t('groups.knockoutPhase')}</h2>
                  </div>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alphaOf('gold', 0.30)}, transparent)` }} />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: alphaOf('gold', 0.07), border: borders.brand('gold', 0.20) }}>
                    <FiAward size={10} className="text-orionix-gold" />
                    <span className="text-[8px] font-black text-amber-400 tracking-[0.2em]">BRACKET</span>
                  </div>
                </motion.div>

                {/* MOBILE/TABLET: round tabs + cards */}
                <div className="xl:hidden">
                  <div className="relative overflow-hidden rounded-2xl mb-5 p-1.5"
                    style={{ background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.96)})`,
                      border: `1px solid ${alpha(hex.neutral.white, 0.06)}`, backdropFilter: 'blur(24px)',
                      boxShadow: `0 8px 32px ${alpha(hex.neutral.black, 0.45)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}` }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('gold', 0.25)}, transparent)` }} />
                    <div className="flex gap-1.5 overflow-x-auto">
                      {(Object.keys(ROUND_META) as KnockoutRound[]).map((round) => {
                        const meta    = { ...ROUND_META[round], shortLabel: t(ROUND_I18N[round].shortLabelKey) };
                        const isActive = activeRound === round;
                        const count   = bracketsData[round].length;
                        return (
                          <motion.button key={round} onClick={() => setActiveRound(round)}
                            className="relative flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 overflow-hidden"
                            style={{ background: isActive ? `linear-gradient(135deg, ${meta.color}18, ${alpha(hex.bg.primary, 0.90)})` : 'transparent',
                              border: `1px solid ${isActive ? meta.color + '35' : 'transparent'}`, outline: 'none', cursor: 'pointer' }}
                            whileTap={{ scale: 0.96 }}>
                            {isActive && (
                              <div className="absolute inset-x-0 top-0 h-px"
                                style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }} />
                            )}
                            <span style={{ color: isActive ? meta.color : alpha(hex.text.muted, 0.60),
                              filter: isActive ? `drop-shadow(0 0 5px ${meta.glow})` : 'none', display: 'flex' }}>
                              {meta.icon}
                            </span>
                            <span className="text-[10px] font-black tracking-[0.10em] whitespace-nowrap"
                              style={{ color: isActive ? meta.color : alpha(hex.text.muted, 0.60),
                                textShadow: isActive ? `0 0 10px ${meta.glow}` : 'none' }}>
                              {meta.shortLabel}
                            </span>
                            {count > 0 && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                                style={{ background: isActive ? `${meta.color}22` : alpha(hex.neutral.white, 0.04),
                                  color: isActive ? meta.color : alpha(hex.text.muted, 0.45),
                                  border: `1px solid ${isActive ? meta.color + '28' : 'transparent'}` }}>
                                {count}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={activeRound}
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className={`grid gap-3 ${ROUND_GRID[activeRound]}`}>
                      {bracketsData[activeRound].map((match, i) => (
                        <KnockoutCard key={match.id} match={match} round={activeRound} index={i} t={t} />
                      ))}
                      {bracketsData[activeRound].length === 0 && (
                        <div className="col-span-2 flex flex-col items-center gap-3 py-16">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: alphaOf('gold', 0.07), border: borders.brand('gold', 0.18) }}>
                            <FiAward size={22} style={{ color: alphaOf('gold', 0.40) }} />
                          </div>
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orionix-text-muted">{t('groups.roundUndefined')}</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* DESKTOP xl+: Bracket (🛡️ PROTECTED) */}
                <div className="hidden xl:block relative overflow-hidden rounded-2xl"
                  style={{
                    border: `1px solid ${alphaOf('green', 0.10)}`,
                    boxShadow: `0 28px 90px ${alpha(hex.neutral.black, 0.75)}, 0 0 0 1px ${alphaOf('gold', 0.04)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
                  }}>
                  <BracketBg />
                  <div className="absolute inset-x-0 top-0 h-px z-10"
                    style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.55)}, ${alphaOf('gold', 0.35)}, ${alphaOf('green', 0.55)}, transparent)` }} />
                  <div className="relative z-10 overflow-x-auto p-4">
                    <div className="min-w-max">
                      <Bracket key="bracket-desktop" data={bracketsData} showBg={false} />
                    </div>
                  </div>
                </div>

                {champion && <ChampionBanner winner={champion} t={t} />}
              </motion.div>
            )}

            {/* ═══════ EQUIPOS ═══════ */}
            {activeTab === 'equipos' && (
              <motion.div key="equipos"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}>
                <TeamsTab
                  groups={groups}
                  isPremium={isPremium}
                  locale={locale} />
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* ── PUBLICIDAD (solo Free) — responsive ── */}
        <div className="sm:hidden mt-8"><AdsterraBanner slot="mobile320x50" /></div>
        <div className="hidden sm:block mt-8"><AdsterraBanner slot="rect300x250" /></div>
      </div>
      <TourButton steps={getTourSteps(locale, 'groups')} />
    </div>
  );
}
