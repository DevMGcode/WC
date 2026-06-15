'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';
import { apiFetch } from '@/lib/apiFetch';

interface H2HFixture {
  externalId: string; kickoffUtc: string; homeTeamId: number; homeTeamName: string;
  awayTeamId: number; awayTeamName: string; homeScore: number | null;
  awayScore: number | null; status: string; leagueRound?: string; venueName?: string;
}

function TeamLogo({ url, name }: { url: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black shrink-0"
        style={{ background: alpha(hex.neutral.white, 0.08), color: alpha(hex.text.secondary, 0.6) }}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <div className="relative w-6 h-6 shrink-0">
      <Image src={url} alt={name} fill sizes="24px" className="object-contain" onError={() => setErr(true)} />
    </div>
  );
}

function MatchRow({ match, i }: { match: H2HFixture; i: number }) {
  const played = match.homeScore !== null && match.awayScore !== null;
  const homeWon = played && match.homeScore! > match.awayScore!;
  const awayWon = played && match.awayScore! > match.homeScore!;

  const resultColor = !played ? alpha(hex.text.secondary, 0.3)
    : homeWon ? hex.green.bright
    : awayWon ? hex.status.danger
    : hex.gold.base;

  const date = match.kickoffUtc ? new Date(match.kickoffUtc).toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
      style={{ background: alpha(hex.neutral.white, 0.025), border: `1px solid ${alpha(hex.neutral.white, 0.05)}` }}
    >
      {/* Date */}
      <span className="text-[9px] tabular-nums shrink-0 w-16 leading-tight" style={{ color: alpha(hex.text.secondary, 0.4) }}>{date}</span>

      {/* Home team */}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span className="text-[10px] font-bold truncate" style={{ color: alpha(hex.text.primary, 0.85) }}>{match.homeTeamName}</span>
      </div>

      {/* Score */}
      <div className="px-2 py-1 rounded-lg shrink-0 text-center min-w-[52px]"
        style={{ background: alpha(hex.neutral.white, 0.05), border: `1px solid ${alpha(resultColor, 0.3)}` }}>
        {played
          ? <span className="text-[13px] font-black tabular-nums" style={{ color: hex.text.primary }}>
              {match.homeScore} – {match.awayScore}
            </span>
          : <span className="text-[9px] font-black" style={{ color: alpha(hex.text.secondary, 0.3) }}>vs</span>
        }
      </div>

      {/* Away team */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-[10px] font-bold truncate" style={{ color: alpha(hex.text.primary, 0.85) }}>{match.awayTeamName}</span>
      </div>
    </motion.div>
  );
}

export default function HeadToHeadTab({
  homeTeamId, awayTeamId, homeTeamName, awayTeamName,
}: { homeTeamId: number; awayTeamId: number; homeTeamName: string; awayTeamName: string }) {
  const t = useTranslations();
  const [matches, setMatches] = useState<H2HFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty,   setEmpty]   = useState(false);

  useEffect(() => {
    if (!homeTeamId || !awayTeamId) { setEmpty(true); setLoading(false); return; }
    apiFetch(`/api/v1/public/fixtures/headtohead?team1=${homeTeamId}&team2=${awayTeamId}&last=10`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const data: H2HFixture[] = d?.data ?? [];
        setMatches(data);
        setEmpty(data.length === 0);
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [homeTeamId, awayTeamId]);

  if (loading) return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-11 rounded-xl animate-pulse" style={{ background: alpha(hex.neutral.white, 0.04) }} />
      ))}
    </div>
  );

  if (empty || matches.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">🔁</span>
      <p className="text-sm font-bold" style={{ color: alpha(hex.text.secondary, 0.5) }}>{t('fixture.h2hNone')}</p>
      <p className="text-[10px] tracking-widest uppercase" style={{ color: alpha(hex.text.secondary, 0.3) }}>No hay enfrentamientos previos registrados</p>
    </div>
  );

  const played = matches.filter(m => m.homeScore !== null);
  const homeWins = played.filter(m =>
    (m.homeTeamName === homeTeamName && m.homeScore! > m.awayScore!) ||
    (m.awayTeamName === homeTeamName && m.awayScore! > m.homeScore!)
  ).length;
  const awayWins = played.filter(m =>
    (m.homeTeamName === awayTeamName && m.homeScore! > m.awayScore!) ||
    (m.awayTeamName === awayTeamName && m.awayScore! > m.homeScore!)
  ).length;
  const draws = played.filter(m => m.homeScore === m.awayScore).length;

  return (
    <div>
      {/* Summary row */}
      {played.length > 0 && (
        <div className="flex items-center justify-between mb-5 px-2 py-3 rounded-2xl"
          style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
          <div className="text-center flex-1">
            <p className="text-2xl font-black" style={{ color: hex.green.bright }}>{homeWins}</p>
            <p className="text-[8px] font-black tracking-widest uppercase mt-0.5" style={{ color: alpha(hex.text.secondary, 0.4) }}>
              {homeTeamName.split(' ')[0]}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-xl font-black" style={{ color: alpha(hex.text.secondary, 0.5) }}>{draws}</p>
            <p className="text-[8px] font-black tracking-widest uppercase mt-0.5" style={{ color: alpha(hex.text.secondary, 0.3) }}>Empates</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-black" style={{ color: hex.status.danger }}>{awayWins}</p>
            <p className="text-[8px] font-black tracking-widest uppercase mt-0.5" style={{ color: alpha(hex.text.secondary, 0.4) }}>
              {awayTeamName.split(' ')[0]}
            </p>
          </div>
        </div>
      )}

      <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-3" style={{ color: alpha(hex.text.secondary, 0.35) }}>
        Últimos {matches.length} enfrentamientos
      </p>

      <div className="space-y-2">
        {matches.map((m, i) => <MatchRow key={m.externalId} match={m} i={i} />)}
      </div>
    </div>
  );
}
