'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from '@/components/Navigation';
import { FixtureCard } from '@/components/Cards';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import ShareButton from '@/components/ShareButton';
import { getFixtureById } from '@/services/publicTournament';
import { apiFetch } from '@/lib/apiFetch';
import { predictionService } from '@/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { favoriteTeamsService, type FavoriteTeam } from '@/services/favoriteTeams';
import type { MatchEventScorer, MatchEvent, MatchEventType } from '@/types';
import {
  FiTarget, FiZap, FiCheck, FiX, FiEdit2, FiArrowLeft,
  FiMapPin, FiAlertCircle, FiList, FiBarChart2, FiUsers, FiRepeat, FiRadio,
} from 'react-icons/fi';

import { hex, type BrandColor, resolveBrandHex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders, gradients } from '@/lib/design/effects';
import { buildMatchSummary } from './_components/matchSummary';

import dynamic from 'next/dynamic';
import { TabSkeleton } from '@/components/PageSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AdSlot } from '@/components/ads';

const LineupsTab    = dynamic(() => import('./_components/LineupsTab'),    { loading: () => <TabSkeleton /> });
const StatisticsTab = dynamic(() => import('./_components/StatisticsTab'), { loading: () => <TabSkeleton /> });
const PlayersTab    = dynamic(() => import('./_components/PlayersTab'),    { loading: () => <TabSkeleton /> });
const HeadToHeadTab = dynamic(() => import('./_components/HeadToHeadTab'), { loading: () => <TabSkeleton /> });
const LiveEventFeed = dynamic(() => import('./_components/LiveEventFeed'), { ssr: false });

import { useMatchLive }   from '@/hooks/useMatchLive';
import { useMatchEvents } from '@/hooks/useMatchEvents';

type DetailTab = 'live' | 'lineups' | 'stats' | 'players' | 'h2h';

/**
 * Local thin wrapper around the card pattern used on this page. We don't use
 * the generic `<Surface>` primitive here because the accent gradient on top
 * depends on a per-card BrandColor — exposing that via Surface would muddy
 * its API. This keeps the concern co-located with the page that needs it.
 */
const DarkCard = ({
  children, accent = 'green', className = '', delay = 0,
}: {
  children: React.ReactNode;
  accent?: BrandColor;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`relative overflow-hidden rounded-2xl ${className}`}
    style={{
      background:  `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.97)})`,
      border:      `1px solid ${alphaOf(accent, 0.095)}`,
      boxShadow:   `0 20px 60px ${alpha(hex.neutral.black, 0.50)}`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: gradients.divider(accent, 0.65) }} />
    {children}
  </motion.div>
);

export default function FixtureDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t      = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();
  const locale = useLocale();
  const fixtureId = parseInt(params.id, 10);

  /* Tabs y reglas de puntuación dependen de t() ⇒ se construyen dentro del
   * componente para reaccionar al cambio de locale. */
  const DETAIL_TABS: { key: DetailTab; label: string; icon: React.ReactNode; liveOnly?: boolean }[] = [
    { key: 'live',    label: t('fixture.tabs.live'),                                       icon: <FiRadio     size={12} />, liveOnly: true },
    { key: 'lineups',  label: t('fixture.tabs.lineups')   ?? 'Alineaciones', icon: <FiList      size={12} /> },
    { key: 'stats',    label: t('fixture.tabs.stats')     ?? 'Estadísticas', icon: <FiBarChart2 size={12} /> },
    { key: 'players',  label: t('fixture.tabs.players')   ?? 'Jugadores',    icon: <FiUsers     size={12} /> },
    { key: 'h2h',      label: t('fixture.tabs.h2h')       ?? 'H2H',          icon: <FiRepeat    size={12} /> },
  ];

  const SCORE_RULES: { pts: number; label: string; sublabel: string; color: BrandColor; icon: React.ReactNode }[] = [
    { pts: 3, label: t('fixture.rules.exactLabel'),   sublabel: t('fixture.rules.exactSub'),   color: 'green',   icon: <FiZap   size={14} /> },
    { pts: 1, label: t('fixture.rules.correctLabel'), sublabel: t('fixture.rules.correctSub'), color: 'success', icon: <FiCheck size={14} /> },
    { pts: 0, label: t('fixture.rules.wrongLabel'),   sublabel: t('fixture.rules.wrongSub'),   color: 'neutral', icon: <FiX     size={14} /> },
  ];

  const [fixture,     setFixture]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [prediction,  setPrediction]  = useState<any>(null);
  const [predHome,    setPredHome]    = useState(0);
  const [predAway,    setPredAway]    = useState(0);
  const [editing,     setEditing]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [predError,   setPredError]   = useState('');
  const [predSuccess, setPredSuccess] = useState(false);
  const [detailTab,   setDetailTab]   = useState<DetailTab>('lineups');
  const autoSwitchedToLive = useRef(false);
  const [favTeams,    setFavTeams]    = useState<FavoriteTeam[]>([]);
  const [favsLoaded,  setFavsLoaded]  = useState(false);
  const [dbEvents,    setDbEvents]    = useState<MatchEvent[]>([]);

  // WebSocket — tiempo real (solo activo cuando el partido está LIVE)
  const liveDelta  = useMatchLive(fixture?.status === 'LIVE' ? fixtureId : null);
  const liveEvents = useMatchEvents(fixture?.status === 'LIVE' ? fixtureId : null);

  // Eventos históricos (BD) — carga inicial + refresco cada 30s mientras está LIVE
  const fetchDbEvents = React.useCallback(() => {
    if (!fixture) return;
    const status = fixture.status;
    if (status !== 'LIVE' && status !== 'FINISHED') return;
    apiFetch(`/api/v1/public/fixtures/${fixtureId}/events`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        const rows: any[] = json?.data ?? [];
        const mapped: MatchEvent[] = rows.map(e => ({
          matchId:      fixtureId,
          type:         e.eventType as MatchEventType,
          teamId:       e.teamId ?? null,
          playerId:     null,
          playerName:   e.playerName ?? null,
          playerOut:    e.playerOut ?? null,
          teamFifaCode: e.teamFifaCode ?? null,
          minute:       e.minute ?? 0,
          extraMinute:        e.extraMinute ?? undefined,
          detail:             e.detail ?? undefined,
          occurredAt:         new Date(0).toISOString(),
          homeScoreAtEvent:   e.homeScoreAtEvent ?? undefined,
          awayScoreAtEvent:   e.awayScoreAtEvent ?? undefined,
        }));
        setDbEvents(mapped);
      })
      .catch(() => {});
  }, [fixture?.status, fixtureId]);

  useEffect(() => {
    fetchDbEvents();
  }, [fetchDbEvents]);

  useEffect(() => {
    if (fixture?.status !== 'LIVE') return;
    const interval = setInterval(fetchDbEvents, 30_000);
    return () => clearInterval(interval);
  }, [fixture?.status, fetchDbEvents]);

  // Merge: eventos del WebSocket + eventos de BD, sin duplicados.
  // Dedup global por type|minute|teamId|playerName para cubrir duplicados dentro de cada fuente.
  const allLiveEvents = useMemo(() => {
    // Los STATUS_CHANGE no tienen equipo ni jugador, y varios caen en el mismo minuto
    // (p.ej. al min 120: "end extra time", "penalties", "match finished"). Si se dedupea
    // solo por type|minute|team|player, los tres colapsan en uno y se pierden divisores.
    // Para ese tipo discriminamos por detail + extraMinute; el resto queda igual.
    const evKey = (e: { type?: string; minute?: number; extraMinute?: number; teamId?: number | null; playerName?: string | null; detail?: string | null }) =>
      e.type === 'STATUS_CHANGE'
        ? `STATUS_CHANGE|${e.minute}|${e.extraMinute ?? 'x'}|${e.detail ?? ''}`
        : `${e.type}|${e.minute}|${e.teamId ?? 'x'}|${e.playerName ?? ''}`;
    const seen = new Set<string>();
    const result: MatchEvent[] = [];
    for (const e of [...liveEvents, ...dbEvents]) {
      const k = evKey(e);
      if (!seen.has(k)) { seen.add(k); result.push(e); }
    }
    return result;
  }, [liveEvents, dbEvents]);

  // Cuando llegan eventos (WS o BD) → cambiar automáticamente al tab de eventos
  useEffect(() => {
    if (allLiveEvents.length > 0 && !autoSwitchedToLive.current) {
      autoSwitchedToLive.current = true;
      setDetailTab('live');
    }
  }, [allLiveEvents.length]);

  // Cuando llega un gol manual (guardado en BD) → refetch para obtener el MatchEventScorer completo
  const prevGoalCountRef = useRef(0);
  useEffect(() => {
    const manualGoals = liveEvents.filter(
      e => (e.type === 'GOAL' || e.type === 'OWN_GOAL' || e.type === 'PENALTY_GOAL') && e.playerName
    );
    if (manualGoals.length > prevGoalCountRef.current) {
      prevGoalCountRef.current = manualGoals.length;
      getFixtureById(fixtureId).then(data => { if (data) setFixture(data); }).catch(() => {});
    }
  }, [liveEvents, fixtureId]);

  // Scores y status en vivo (WebSocket tiene prioridad sobre el snapshot HTTP)
  const liveHomeScore    = liveDelta?.homeScore    ?? fixture?.homeScore;
  const liveAwayScore    = liveDelta?.awayScore    ?? fixture?.awayScore;
  const liveStatus       = liveDelta?.status       ?? fixture?.status;
  const elapsedMinutes   = liveDelta?.elapsedMinutes ?? fixture?.elapsedMinutes ?? null;

  // Detecta si el partido está en descanso: hay un STATUS_CHANGE halftime
  // pero todavía no hay uno de second half → estamos entre ambos tiempos.
  const isHalftime = useMemo(() => {
    const sc = allLiveEvents.filter(e => e.type === 'STATUS_CHANGE');
    const hasHT  = sc.some(e => e.detail === 'halftime' || e.detail === 'half time');
    const has2T  = sc.some(e => e.detail === 'second half');
    return hasHT && !has2T;
  }, [allLiveEvents]);

  // Minuto calculado localmente para que el contador avance sin depender del WebSocket.
  // Base: último elapsedMinutes del WS + offset desde cuándo llegó. Si no hay WS aún,
  // calcula desde kickoffAt (cubre el primer semestre con tope en 45').
  const [displayMinute, setDisplayMinute] = useState<number | null>(null);
  const minuteBaseRef = useRef<{ minute: number; recordedAt: number } | null>(null);

  useEffect(() => {
    if (elapsedMinutes != null) {
      minuteBaseRef.current = { minute: elapsedMinutes, recordedAt: Date.now() };
      setDisplayMinute(elapsedMinutes);
    }
  }, [elapsedMinutes]);

  useEffect(() => {
    if (liveStatus !== 'LIVE') { setDisplayMinute(null); return; }

    const tick = () => {
      if (minuteBaseRef.current) {
        const delta = Math.floor((Date.now() - minuteBaseRef.current.recordedAt) / 60000);
        setDisplayMinute(minuteBaseRef.current.minute + delta);
      } else if (fixture?.kickoffAt) {
        const sinceKickoff = Math.floor((Date.now() - new Date(fixture.kickoffAt).getTime()) / 60000);
        setDisplayMinute(Math.min(45, sinceKickoff));
      }
    };

    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [liveStatus, fixture?.kickoffAt]);

  // Goleadores: fuente principal = BD (fixture.scorers, refrescada cada 30s).
  // El WebSocket solo aporta un gol nuevo si la BD todavía no lo registró
  // (ventana de hasta 30s antes del próximo refetch). El marcador real
  // (homeScore/awayScore) actúa como tope: nunca se muestran más goles
  // por equipo de los que indica el score.
  const allScorers = useMemo(() => {
    const dbScorers = fixture?.scorers ?? [];
    const homeId    = fixture?.homeTeam?.id;
    const awayId    = fixture?.awayTeam?.id;
    const homeScore = fixture?.homeScore ?? 0;
    const awayScore = fixture?.awayScore ?? 0;

    // Siempre recortar la BD al marcador oficial. Evita que goles erróneos
    // persistidos durante el live (y luego corregidos por la API) sigan visibles
    // incluso cuando el partido terminó y el WS ya no envía eventos.
    const cappedDbScorers = [
      ...dbScorers
        .filter((s: MatchEventScorer) => s.teamId === homeId)
        .sort((a: MatchEventScorer, b: MatchEventScorer) => (a.minute ?? 0) - (b.minute ?? 0))
        .slice(0, homeScore),
      ...dbScorers
        .filter((s: MatchEventScorer) => s.teamId === awayId)
        .sort((a: MatchEventScorer, b: MatchEventScorer) => (a.minute ?? 0) - (b.minute ?? 0))
        .slice(0, awayScore),
      // Goles sin teamId identificado: se mantienen tal cual
      ...dbScorers.filter((s: MatchEventScorer) => s.teamId !== homeId && s.teamId !== awayId),
    ];

    const wsGoals = liveEvents.filter(
      e => (e.type === 'GOAL' || e.type === 'OWN_GOAL' || e.type === 'PENALTY_GOAL') && e.playerName
    );
    if (wsGoals.length === 0) return cappedDbScorers;

    const dbHomeCount = cappedDbScorers.filter((s: MatchEventScorer) => s.teamId === homeId).length;
    const dbAwayCount = cappedDbScorers.filter((s: MatchEventScorer) => s.teamId === awayId).length;

    // Solo agregar eventos WS si la BD aún no alcanzó el total de goles del equipo.
    // Se lleva un contador por equipo para no superar el cap aunque haya varios WS simultáneos.
    const wsAdded = { home: 0, away: 0 };
    const wsOnlyGoals = wsGoals
      .filter(e => {
        const isHome   = e.teamId === homeId;
        const dbCount  = isHome ? dbHomeCount : dbAwayCount;
        const added    = isHome ? wsAdded.home : wsAdded.away;
        const maxGoals = isHome ? homeScore    : awayScore;
        if (dbCount + added < maxGoals) {
          if (isHome) wsAdded.home++; else wsAdded.away++;
          return true;
        }
        return false;
      })
      .map((e, i) => ({
        id: -(i + 1),
        fixtureId,
        playerName: e.playerName!,
        teamId: e.teamId ?? null,
        teamName: null,
        teamFifaCode: e.teamFifaCode ?? null,
        minute: e.minute ?? null,
        extraMinute: e.extraMinute ?? null,
        eventType: e.type,
        source: 'API' as const,
        verified: false,
        apiPlayerName: null,
        mismatch: false,
      }));

    return [...cappedDbScorers, ...wsOnlyGoals].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
  }, [fixture?.scorers, fixture?.homeTeam?.id, fixture?.awayTeam?.id, fixture?.homeScore, fixture?.awayScore, liveEvents, fixtureId]);

  // Tanda de penales: agrupa los SHOOTOUT_* por equipo (en orden de ejecución).
  const shootout = useMemo(() => {
    const homeId = fixture?.homeTeam?.id;
    const awayId = fixture?.awayTeam?.id;
    const pens = allLiveEvents
      .filter(e => e.type === 'SHOOTOUT_GOAL' || e.type === 'SHOOTOUT_MISSED')
      .sort((a, b) => ((a.minute ?? 0) + (a.extraMinute ?? 0)) - ((b.minute ?? 0) + (b.extraMinute ?? 0)));
    const pick = (id?: number) => pens
      .filter(e => e.teamId === id)
      .map(e => ({ name: e.playerName ?? '?', made: e.type === 'SHOOTOUT_GOAL', minute: e.minute, extraMinute: e.extraMinute }));
    return { home: pick(homeId), away: pick(awayId), has: pens.length > 0 };
  }, [allLiveEvents, fixture?.homeTeam?.id, fixture?.awayTeam?.id]);

  useEffect(() => {
    const loadFixture = async () => {
      try {
        const data = await getFixtureById(fixtureId);
        setFixture(data ?? null);
      } finally { setLoading(false); }
    };
    loadFixture();
  }, [fixtureId]);

  // Mientras el partido está LIVE: re-fetch cada 30 s para mostrar goleadores
  // que el backend fue persistiendo desde API-Football sin necesitar WebSocket.
  useEffect(() => {
    if (fixture?.status !== 'LIVE') return;
    const interval = setInterval(() => {
      getFixtureById(fixtureId)
        .then(data => { if (data) setFixture(data); })
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [fixture?.status, fixtureId]);

  useEffect(() => {
    if (!isAuthenticated || !user || !fixture) return;
    const userId = Number(user.id);
    predictionService.getUserPredictionForFixture(fixture.id)
      .then((pred) => {
        if (pred) { setPrediction(pred); setPredHome(pred.predictedHomeScore); setPredAway(pred.predictedAwayScore); return; }
        // Fallback: busca entre todas las predicciones del usuario
        if (!userId) return;
        return predictionService.getUserPredictions(userId).then((preds) => {
          const existing = preds.find((p: any) => Number(p.fixtureId) === fixture.id);
          if (existing) { setPrediction(existing); setPredHome(existing.predictedHomeScore); setPredAway(existing.predictedAwayScore); }
        });
      })
      .catch(() => {});
  }, [isAuthenticated, user, fixture]);

  // Carga equipos favoritos para usuarios Free — determina si pueden predecir este partido
  useEffect(() => {
    if (!isAuthenticated || !user) { setFavsLoaded(true); return; }
    if (isPremium) { setFavsLoaded(true); return; }
    favoriteTeamsService.list(user.id)
      .then(teams => setFavTeams(teams))
      .catch(() => {})
      .finally(() => setFavsLoaded(true));
  }, [isAuthenticated, user, isPremium]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true); setPredError(''); setPredSuccess(false);
    try {
      const userId = Number(user.id);
      if (prediction && !editing) return;
      if (prediction) {
        const updated = await predictionService.updatePrediction(prediction.id, { predictedHomeScore: predHome, predictedAwayScore: predAway });
        setPrediction(updated);
      } else {
        try {
          const created = await predictionService.createPrediction({ userId, fixtureId: fixture.id, predictedHomeScore: predHome, predictedAwayScore: predAway });
          setPrediction(created);
        } catch (createErr: any) {
          const status = createErr?.response?.status;
          // 422 / 409 = ya existe una predicción que el GET inicial no detectó
          if (status === 422 || status === 409) {
            const existing = await predictionService.getUserPredictionForFixture(fixture.id);
            if (existing) {
              const updated = await predictionService.updatePrediction(existing.id, { predictedHomeScore: predHome, predictedAwayScore: predAway });
              setPrediction(updated);
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      }
      setPredSuccess(true); setEditing(false);
    } catch (err: any) {
      const d = err?.response?.data;
      setPredError(d?.message || d?.error || d?.detail || err?.message || t('fixture.saveError'));
    } finally { setSubmitting(false); }
  };

  // Shared page background (radial gradient using tokens)
  const pageBg = `radial-gradient(ellipse at 22% 35%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 48%, ${hex.bg.primary} 100%)`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: pageBg }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="w-12 h-12 rounded-full border-2"
            style={{ borderColor: alphaOf('green', 0.20), borderTopColor: hex.green.base }}
            animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold"
            style={{ color: alphaOf('green', 0.6) }}>{t('fixture.loading')}</p>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: pageBg }}>
        <p className="text-orionix-text-muted font-semibold">{t('fixture.notFound')}</p>
      </div>
    );
  }

  const isScheduled = liveStatus === 'SCHEDULED';
  const isLive      = liveStatus === 'LIVE';
  const isFinished  = liveStatus === 'FINISHED';

  // Lógica de negocio — quién puede hacer porras
  // Free:    puede predecir partidos donde CUALQUIER equipo favorito (del onboarding) participe.
  // Premium: puede predecir CUALQUIER partido (ilimitado, sin importar favoritos).
  //
  // La comparación usa primero ID y luego fifaCode como fallback por si los IDs
  // difieren entre el endpoint de favoritos y el de fixtures.
  const isFavInMatch = !isPremium && favTeams.some(f =>
    f.teamId === fixture?.homeTeamId ||
    f.teamId === fixture?.awayTeamId ||
    !!(f.fifaCode && (
      f.fifaCode === fixture?.homeTeam?.fifaCode ||
      f.fifaCode === fixture?.awayTeam?.fifaCode
    ))
  );
  const hasFavs = favTeams.length > 0;
  // Mientras favTeams carga (!favsLoaded) mostramos el formulario optimistamente
  const canPredict = isPremium || !favsLoaded || !!prediction || isFavInMatch;

  const predCorrect = isFinished && prediction &&
    prediction.predictedHomeScore === fixture.homeScore &&
    prediction.predictedAwayScore === fixture.awayScore;

  const predResultCorrect = isFinished && prediction && !predCorrect &&
    fixture.homeScore !== null && fixture.awayScore !== null &&
    Math.sign(prediction.predictedHomeScore - prediction.predictedAwayScore) ===
    Math.sign(fixture.homeScore - fixture.awayScore);

  // Result config — uses BrandColor instead of hex literals
  const resultCfg: { color: BrandColor; label: string; icon: string; pts: string } =
    predCorrect      ? { color: 'green',   label: t('fixture.exactScore'),  icon: '🎯', pts: '+3 pts' }
    : predResultCorrect ? { color: 'success', label: t('fixture.correctScore'),  icon: '✅', pts: '+1 pt'  }
    :                     { color: 'danger',  label: t('fixture.wrongScore'), icon: '❌', pts: '0 pts'  };

  return (
    <div className="w-full relative">

      {/* Ambient blobs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -150, left: -120,
          background: `radial-gradient(circle, ${alphaOf('green', 0.07)} 0%, transparent 65%)`,
          filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 450, height: 450, bottom: -80, right: -80,
          background: `radial-gradient(circle, ${alphaOf('green', 0.06)} 0%, transparent 65%)`,
          filter: 'blur(60px)', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 5 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={t('fixture.headerTitle')} subtitle={fixture.stageName ?? ''} />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto w-full pb-32">

        {/* ── FIXTURE CARD ── */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          <FixtureCard
            homeTeam={fixture.homeTeam}
            awayTeam={fixture.awayTeam}
            homeScore={liveHomeScore}
            awayScore={liveAwayScore}
            homePenalty={fixture.homePenalty}
            awayPenalty={fixture.awayPenalty}
            kickoffAt={fixture.kickoffAt}
            status={liveStatus}
            elapsedMinutes={isLive ? (displayMinute ?? elapsedMinutes) : undefined}
            isHalftime={isHalftime}
          />
        </motion.div>

        {/* ── RESUMEN TEXTUAL DEL PARTIDO (indexable SEO/AdSense) — generado de los datos ── */}
        {(() => {
          const summary = buildMatchSummary({
            status: liveStatus,
            homeTeam: fixture.homeTeam,
            awayTeam: fixture.awayTeam,
            homeScore: liveHomeScore,
            awayScore: liveAwayScore,
            stadiumName: fixture.stadiumName,
            hostCity: fixture.hostCity,
            scorers: fixture.scorers,
          }, locale);
          return summary ? (
            <motion.div className="mb-4 rounded-2xl px-4 py-3.5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
              style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}>
              <p className="text-[12px] sm:text-[13px] leading-relaxed" style={{ color: alpha(hex.text.secondary, 0.72) }}>
                {summary}
              </p>
            </motion.div>
          ) : null;
        })()}

        {/* ── PORRA SECTION ── */}
        <div className="mb-4">

          {/* Not logged in */}
          {!isAuthenticated && (
            <DarkCard accent="green" delay={0.08}>
              <div className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: alphaOf('green', 0.35), filter: 'blur(14px)', opacity: 0.25, transform: 'scale(1.15)' }} />
                  <motion.div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: `linear-gradient(145deg, ${alphaOf('green', 0.10)}, ${alpha(hex.bg.primary, 0.85)})`,
                             border: borders.brand('green', 0.22) }}
                    animate={{ boxShadow: [`0 0 12px ${alphaOf('green', 0.10)}`, `0 0 28px ${alphaOf('green', 0.30)}`, `0 0 12px ${alphaOf('green', 0.10)}`] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <FiTarget size={28} style={{ color: hex.green.bright, filter: `drop-shadow(0 0 6px ${alphaOf('green', 0.7)})` }} />
                  </motion.div>
                </div>
                <p className="text-white font-black text-lg mb-1">{t('fixture.whatScore')}</p>
                <p className="text-orionix-text-muted text-sm mb-5">{t('fixture.loginToPredict')}</p>
                <motion.button
                  onClick={() => router.push('/onboarding')}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-xl text-sm font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`,
                           boxShadow: `0 6px 24px ${alphaOf('green', 0.30)}` }}
                >
                  Iniciar sesión
                </motion.button>
              </div>
            </DarkCard>
          )}

          {/* Logged in — LIVE match: porras cerradas */}
          {isAuthenticated && isLive && (
            <DarkCard accent="danger" delay={0.08}>
              <div className="p-6 text-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(145deg, ${alphaOf('danger', 0.12)}, ${alpha(hex.bg.primary, 0.85)})`,
                           border: borders.brand('danger', 0.25) }}
                  animate={{ boxShadow: [`0 0 12px ${alphaOf('danger', 0.10)}`, `0 0 28px ${alphaOf('danger', 0.35)}`, `0 0 12px ${alphaOf('danger', 0.10)}`] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <span style={{ fontSize: 28 }}>🔒</span>
                </motion.div>
                <p className="text-white font-black text-base mb-1">{t('fixture.closed')}</p>
                <p className="text-orionix-text-muted text-sm">{t('fixture.alreadyStarted')}</p>
                {prediction && (
                  <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-xl"
                    style={{ background: alphaOf('danger', 0.06), border: borders.brand('danger', 0.15) }}>
                    <span className="text-orionix-text-muted text-sm font-bold">{t('fixture.yourPredictionLabel')}</span>
                    <span className="text-white font-black text-lg tabular-nums">
                      {prediction.predictedHomeScore} – {prediction.predictedAwayScore}
                    </span>
                  </div>
                )}
              </div>
            </DarkCard>
          )}

          {/* Logged in — scheduled match (solo si puede predecir o ya tiene porra) */}
          {isAuthenticated && isScheduled && canPredict && (
            <DarkCard accent="green" delay={0.08}>
              <div className="p-5">

                {/* Scoring rules */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {SCORE_RULES.map(({ pts, label, sublabel, color, icon }) => {
                    const c = resolveBrandHex(color);
                    return (
                      <div key={pts} className="relative overflow-hidden rounded-xl p-3 text-center"
                        style={{ background: alpha(hex.bg.primary, 0.80), border: `1px solid ${alphaOf(color, 0.09)}` }}>
                        <div className="absolute inset-x-0 top-0 h-px"
                          style={{ background: gradients.divider(color, 0.5) }} />
                        <div className="flex justify-center mb-1.5"
                          style={{ color: c, filter: `drop-shadow(0 0 4px ${c})` }}>
                          {icon}
                        </div>
                        <p className="text-lg font-black" style={{ color: c, textShadow: `0 0 12px ${alphaOf(color, 0.5)}` }}>
                          {pts}<span className="text-xs font-bold ml-0.5">pts</span>
                        </p>
                        <p className="text-[8px] font-black tracking-wide mt-0.5 leading-tight"
                          style={{ color: alphaOf(color, 0.5) }}>{label}</p>
                        <p className="text-[7px] text-orionix-text-muted mt-0.5 leading-tight hidden sm:block">{sublabel}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Porra header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-5 rounded-full"
                      style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.hover})` }} />
                    <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('fixture.yourPrediction')}</span>
                  </div>
                  {prediction && !editing && (
                    <motion.button
                      onClick={() => setEditing(true)}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 text-[10px] font-black text-green-400/70 hover:text-green-300 transition-colors"
                    >
                      <FiEdit2 size={11} /> Editar
                    </motion.button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {/* Saved prediction display */}
                  {prediction && !editing ? (
                    <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="relative flex items-center justify-center gap-8 py-2">
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-2">
                          {fixture.homeTeam?.flagUrl && (
                            <div className="relative w-7 h-5 rounded overflow-hidden">
                              <Image src={fixture.homeTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-orionix-text-muted text-xs font-bold">{fixture.homeTeam?.shortName}</span>
                        </div>
                        <p className="text-white font-black text-4xl" style={{ textShadow: `0 0 20px ${alphaOf('green', 0.30)}` }}>
                          {prediction.predictedHomeScore}
                        </p>
                      </div>
                      <span className="text-orionix-text-muted font-black text-2xl">–</span>
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-2">
                          {fixture.awayTeam?.flagUrl && (
                            <div className="relative w-7 h-5 rounded overflow-hidden">
                              <Image src={fixture.awayTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-orionix-text-muted text-xs font-bold">{fixture.awayTeam?.shortName}</span>
                        </div>
                        <p className="text-white font-black text-4xl" style={{ textShadow: `0 0 20px ${alphaOf('green', 0.30)}` }}>
                          {prediction.predictedAwayScore}
                        </p>
                      </div>

                      <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <ShareButton
                          variant="icon"
                          size="sm"
                          title="⚽ Orionix Gol — Mundial 2026"
                          text={`⚽ Predije ${prediction.predictedHomeScore}-${prediction.predictedAwayScore} en ${fixture.homeTeam?.name ?? '?'} vs ${fixture.awayTeam?.name ?? '?'}\n🔮 ¿Acertaré? Juega conmigo en Orionix Gol 👇`}
                          url={`/${locale}/fixtures/${fixture.id}`}
                          label="Compartir porra"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    /* Score input form */
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="relative flex items-center justify-center gap-6 mb-5">
                        {/* Home score */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center mb-2">
                            {fixture.homeTeam?.flagUrl && (
                              <div className="relative w-7 h-5 rounded overflow-hidden">
                                <Image src={fixture.homeTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-orionix-text-muted text-xs font-bold">{fixture.homeTeam?.shortName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={() => setPredHome(Math.max(0, predHome - 1))} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}>−</motion.button>
                            <span className="text-white font-black text-4xl w-12 text-center tabular-nums"
                              style={{ textShadow: `0 0 18px ${alphaOf('green', 0.50)}` }}>{predHome}</span>
                            <motion.button onClick={() => setPredHome(predHome + 1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alphaOf('green', 0.15), border: borders.brand('green', 0.30) }}>+</motion.button>
                          </div>
                        </div>

                        <span className="text-orionix-text-muted font-black text-2xl">–</span>

                        {/* Away score */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center mb-2">
                            {fixture.awayTeam?.flagUrl && (
                              <div className="relative w-7 h-5 rounded overflow-hidden">
                                <Image src={fixture.awayTeam.flagUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-orionix-text-muted text-xs font-bold">{fixture.awayTeam?.shortName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={() => setPredAway(Math.max(0, predAway - 1))} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alpha(hex.neutral.white, 0.06), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}>−</motion.button>
                            <span className="text-white font-black text-4xl w-12 text-center tabular-nums"
                              style={{ textShadow: `0 0 18px ${alphaOf('green', 0.50)}` }}>{predAway}</span>
                            <motion.button onClick={() => setPredAway(predAway + 1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              className="w-9 h-9 rounded-xl font-black text-lg text-white"
                              style={{ background: alphaOf('green', 0.15), border: borders.brand('green', 0.30) }}>+</motion.button>
                          </div>
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                          <ShareButton
                            variant="icon"
                            size="sm"
                            title="⚽ Orionix Gol — Mundial 2026"
                            text={`⚽ Mi porra: ${predHome}-${predAway} en ${fixture.homeTeam?.name ?? '?'} vs ${fixture.awayTeam?.name ?? '?'}\n🔮 ¿Acertaré? Juega conmigo en Orionix Gol 👇`}
                            url={`/${locale}/fixtures/${fixture.id}`}
                            label="Compartir porra"
                          />
                        </div>
                      </div>

                      {predError && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs text-red-300"
                          style={{ background: alphaOf('danger', 0.08), border: borders.brand('danger', 0.18) }}>
                          <FiAlertCircle size={12} /> {predError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        {editing && (
                          <motion.button
                            onClick={() => { setEditing(false); setPredError(''); }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="flex-1 py-3 rounded-xl text-sm font-black text-orionix-text-muted"
                            style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
                          >Cancelar</motion.button>
                        )}
                        <motion.button
                          onClick={handleSubmit}
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex-1 py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`,
                                   boxShadow: `0 6px 24px ${alphaOf('green', 0.30)}` }}
                        >
                          <motion.div className="absolute inset-0 pointer-events-none"
                            style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
                            animate={{ x: ['-120%', '120%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
                          <span className="relative">
                            {submitting ? t('fixture.saving') : prediction ? t('fixture.updatePrediction') : t('fixture.confirmPrediction')}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {predSuccess && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-xs text-center mt-3 font-black tracking-wide">
                    {t('fixture.savedOk')}
                  </motion.p>
                )}
              </div>
            </DarkCard>
          )}

          {/* Free gate — partido no elegible para predicción */}
          {isAuthenticated && isScheduled && favsLoaded && !canPredict && (
            <DarkCard accent="gold" delay={0.08}>
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: alpha(hex.bg.primary, 0.85), border: `1px solid ${alphaOf('gold', 0.22)}` }}>
                  <span style={{ fontSize: 26 }}>🔒</span>
                </div>
                <p className="text-white font-black text-base mb-2">
                  {!hasFavs
                    ? 'Elige tus equipos favoritos'
                    : 'Ninguno de tus favoritos juega este partido'}
                </p>
                <p className="text-[12px] leading-relaxed mb-5"
                  style={{ color: alpha(hex.text.muted, 0.80) }}>
                  {!hasFavs
                    ? 'Ve a tu perfil y agrega equipos favoritos. Con el plan Free puedes predecir todos sus partidos del Mundial.'
                    : 'Con el plan Free puedes predecir los partidos de tus equipos favoritos. Hazte Premium para predecir todos los partidos del Mundial.'}
                </p>
                <div className="flex flex-col gap-2">
                  {!hasFavs && (
                    <Link href={`/${locale}/profile`}
                      onClick={() => { try { sessionStorage.setItem('profile-tab', 'FAVORITES'); } catch {} }}
                      className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-[12px] font-black"
                      style={{ background: alphaOf('gold', 0.12), border: `1px solid ${alphaOf('gold', 0.28)}`, color: hex.gold.base }}>
                      Ir a mi perfil ⭐
                    </Link>
                  )}
                  <Link href={`/${locale}/premium`}
                    className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-[12px] font-black text-black"
                    style={{ background: `linear-gradient(135deg, ${hex.gold.base}, ${hex.gold.muted})` }}>
                    Hazte Premium
                  </Link>
                </div>
              </div>
            </DarkCard>
          )}

          {/* Logged in — finished match result comparison */}
          {isAuthenticated && isFinished && prediction && (
            <DarkCard accent={resultCfg.color} delay={0.08}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-[3px] h-5 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${alphaOf(resultCfg.color, 1)}, ${alphaOf(resultCfg.color, 0.5)})` }} />
                  <span className="text-sm font-black" style={{ color: alphaOf(resultCfg.color, 1) }}>
                    {resultCfg.icon} {resultCfg.label}
                  </span>
                </div>
                <div className="flex items-stretch gap-4">
                  <div className="flex-1 text-center rounded-xl p-4"
                    style={{ background: alpha(hex.bg.primary, 0.60), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                    <p className="text-[8px] font-black text-orionix-text-muted tracking-[0.25em] uppercase mb-2">{t('fixture.yourPrediction')}</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {prediction.predictedHomeScore}
                      <span className="text-orionix-text-muted mx-1 text-xl">–</span>
                      {prediction.predictedAwayScore}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-orionix-text-muted font-black text-sm">vs</span>
                  </div>
                  <div className="flex-1 text-center rounded-xl p-4"
                    style={{ background: alpha(hex.bg.primary, 0.60), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                    <p className="text-[8px] font-black text-orionix-text-muted tracking-[0.25em] uppercase mb-2">{t('fixture.result')}</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {fixture.homeScore}
                      <span className="text-orionix-text-muted mx-1 text-xl">–</span>
                      {fixture.awayScore}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs font-black"
                    style={{ color: alphaOf(resultCfg.color, 1), textShadow: `0 0 12px ${alphaOf(resultCfg.color, 0.5)}` }}>
                    {resultCfg.pts}
                  </span>
                </div>
              </div>
            </DarkCard>
          )}

          {/* Logged in — no prediction for finished */}
          {isAuthenticated && isFinished && !prediction && (
            <DarkCard accent="neutral" delay={0.08}>
              <p className="text-orionix-text-muted text-sm text-center py-5">{t('fixture.noPrediction')}</p>
            </DarkCard>
          )}
        </div>

        {/* ── STADIUM INFO ── */}
        {(fixture.stadiumName || fixture.hostCity) && (
          <DarkCard accent="success" delay={0.16} className="mb-4">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[3px] h-5 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.muted})` }} />
                <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('fixture.matchInfo')}</span>
                <FiMapPin size={12} style={{ color: hex.green.bright, marginLeft: 2 }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {fixture.stadiumName && (
                  <div>
                    <p className="text-[9px] font-black text-orionix-text-muted tracking-[0.22em] uppercase mb-1">{t('fixture.stadium')}</p>
                    <p className="text-sm font-bold text-orionix-text-secondary">{fixture.stadiumName}</p>
                  </div>
                )}
                {fixture.hostCity && (
                  <div>
                    <p className="text-[9px] font-black text-orionix-text-muted tracking-[0.22em] uppercase mb-1">{t('fixture.city')}</p>
                    <p className="text-sm font-bold text-orionix-text-secondary">{fixture.hostCity}{fixture.hostCountry ? `, ${fixture.hostCountry}` : ''}</p>
                  </div>
                )}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── GOLEADORES ── */}
        {(isFinished || isLive) && allScorers.length > 0 && (
          <DarkCard accent="gold" delay={0.22} className="mb-4">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-[3px] h-5 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${hex.gold.bright}, ${hex.gold.muted})` }} />
                  <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('fixture.scorers')}</span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: alphaOf('gold', 0.10), color: hex.gold.bright, border: borders.brand('gold', 0.20) }}>
                    {allScorers.length}
                  </span>
                </div>
                {allScorers.some((s: any) => s.mismatch) && (
                  <span className="text-[8px] font-bold text-amber-400/60 flex items-center gap-1">
                    ⚠ Corregido por API
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {allScorers.map((scorer: any) => {
                  const isHome = scorer.teamId === fixture.homeTeam.id;
                  const accentColor: BrandColor = isHome ? 'green' : 'danger';
                  const accentHex = isHome ? hex.green.bright : hex.status.danger;
                  return (
                    <motion.div
                      key={scorer.id}
                      initial={{ opacity: 0, x: isHome ? -8 : 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{
                        background: alpha(hex.bg.primary, 0.60),
                        border: `1px solid ${alpha(hex.neutral.white, 0.04)}`,
                        borderLeft: `3px solid ${accentHex}`,
                      }}
                    >
                      <span className="text-lg">⚽</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-orionix-text-secondary text-sm truncate">{scorer.playerName}</p>
                        {scorer.teamName && (
                          <p className="text-[10px] text-orionix-text-muted">{scorer.teamFifaCode ?? scorer.teamName}</p>
                        )}
                        {scorer.mismatch && scorer.apiPlayerName && (
                          <p className="text-[9px] text-amber-500/70 mt-0.5">
                            ✎ Corregido: era «{scorer.apiPlayerName}» según API
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {scorer.minute && (
                          <span className="text-[10px] font-black text-orionix-text-muted px-2 py-1 rounded-lg"
                            style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                            {scorer.minute}{scorer.extraMinute ? `+${scorer.extraMinute}` : ''}&apos;
                          </span>
                        )}
                        {scorer.verified && (
                          <span className="text-[8px] font-black text-emerald-500/70">✓</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── PENALES (tanda) ── */}
        {(isFinished || isLive) && shootout.has && (
          <DarkCard accent="gold" delay={0.24} className="mb-4">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[3px] h-5 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${hex.gold.bright}, ${hex.gold.muted})` }} />
                <span className="text-[10px] font-black text-orionix-text-muted tracking-[0.24em] uppercase">{t('common.penalties')}</span>
                {fixture.homePenalty != null && fixture.awayPenalty != null && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: alphaOf('gold', 0.10), color: hex.gold.bright, border: borders.brand('gold', 0.20) }}>
                    {fixture.homePenalty}-{fixture.awayPenalty}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ team: fixture.homeTeam, list: shootout.home }, { team: fixture.awayTeam, list: shootout.away }].map((col, ci) => (
                  <div key={ci} className="space-y-1.5">
                    <p className="text-[11px] font-black tracking-wide text-center mb-2"
                      style={{ color: hex.gold.bright }}>
                      {col.team?.shortName ?? col.team?.name}
                    </p>
                    {col.list.map((p: { name: string; made: boolean; minute?: number | null; extraMinute?: number | null }, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                        style={{
                          background: alpha(hex.bg.primary, 0.60),
                          border: `1px solid ${alpha(hex.neutral.white, 0.04)}`,
                          borderLeft: `3px solid ${p.made ? hex.green.bright : hex.status.danger}`,
                        }}>
                        <span className="text-sm shrink-0">{p.made ? '✅' : '❌'}</span>
                        <span className="flex-1 min-w-0 text-xs font-bold text-orionix-text-secondary truncate">{p.name}</span>
                        {p.minute != null && (
                          <span className="text-[9px] font-black text-orionix-text-muted px-1.5 py-0.5 rounded-md shrink-0"
                            style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
                            {p.minute}{p.extraMinute ? `+${p.extraMinute}` : ''}&apos;
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </DarkCard>
        )}

        {/* ── DETAIL TABS (Lineups / Stats / Players / H2H) ── */}
        <DarkCard accent="green" delay={0.28} className="mb-4">
          <div className="p-4">
            {/* Tab bar */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}>
              {DETAIL_TABS.filter(tab => !tab.liveOnly || isLive || (isFinished && allLiveEvents.length > 0)).map(tab => {
                const active = detailTab === tab.key;
                const isLiveTab = tab.key === 'live';
                return (
                  <motion.button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-black tracking-wide uppercase transition-all"
                    style={{
                      background: active
                        ? isLiveTab ? 'rgba(239,68,68,0.15)' : `${hex.green.bright}15`
                        : 'transparent',
                      border: `1px solid ${active
                        ? isLiveTab ? 'rgba(239,68,68,0.40)' : `${hex.green.bright}30`
                        : 'transparent'}`,
                      color: active
                        ? isLiveTab ? '#ef4444' : hex.green.bright
                        : alpha(hex.text.secondary, 0.4),
                    }}
                  >
                    {isLiveTab && isLive ? (
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.0, repeat: Infinity }}
                      >
                        {tab.icon}
                      </motion.span>
                    ) : tab.icon}
                    <span className="hidden sm:inline">
                      {tab.key === 'live' ? (isLive ? 'En Vivo' : 'Eventos') : tab.label}
                    </span>
                    {isLiveTab && allLiveEvents.length > 0 && (
                      <span className="ml-0.5 text-[7px] font-black px-1 py-0.5 rounded-full"
                        style={{ background: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
                        {allLiveEvents.length}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={detailTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <ErrorBoundary fallbackMessage={t('fixture.sectionDataError')}>
                  {detailTab === 'live' && (
                    <LiveEventFeed
                      events={allLiveEvents}
                      isLive={isLive}
                      homeTeamId={fixture.homeTeam?.id ?? null}
                      homeCode={fixture.homeTeam?.fifaCode ?? fixture.homeTeam?.shortName}
                      awayCode={fixture.awayTeam?.fifaCode ?? fixture.awayTeam?.shortName}
                    />
                  )}
                  {detailTab === 'lineups'  && <LineupsTab    fixtureId={fixture.id} liveEvents={liveEvents} />}
                  {detailTab === 'stats'    && <StatisticsTab fixtureId={fixture.id} />}
                  {detailTab === 'players'  && (
                    <PlayersTab
                      fixtureId={fixture.id}
                      homeTeamId={fixture.homeTeam?.id ?? 0}
                      awayTeamId={fixture.awayTeam?.id ?? 0}
                    />
                  )}
                  {detailTab === 'h2h'      && (
                    <HeadToHeadTab
                      homeTeamId={fixture.homeTeam?.id ?? 0}
                      awayTeamId={fixture.awayTeam?.id ?? 0}
                      homeTeamName={fixture.homeTeam?.name ?? ''}
                      awayTeamName={fixture.awayTeam?.name ?? ''}
                    />
                  )}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </div>
        </DarkCard>

        {/* ── PUBLICIDAD (solo Free) — antes de los botones de navegación ── */}
        <AdSlot />

        {/* ── BOTTOM BUTTONS ── */}
        <div className="flex gap-3">
          <Link href="/fixtures" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-black text-orionix-text-muted flex items-center justify-center gap-2 cursor-pointer"
              style={{ border: `1px solid ${alpha(hex.neutral.white, 0.07)}`, background: alpha(hex.neutral.white, 0.02) }}
            >
              <FiArrowLeft size={14} /> {t('fixture.back')}
            </motion.div>
          </Link>
          <Link href="/predictions" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: `0 12px 36px ${alphaOf('green', 0.40)}` }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`,
                       boxShadow: `0 6px 24px ${alphaOf('green', 0.28)}` }}
            >
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 72%)` }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
              <span className="relative flex items-center gap-2"><FiTarget size={13} /> {t('fixture.myPredictions')}</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
