'use client';

/**
 * TeamsTab — grid de los 48 equipos del Mundial 2026.
 *
 * UX: cada card muestra bandera grande + nombre + grupo. Click abre el
 * modal de plantilla nacional. Optimizado para descubrir la feature
 * (cursor pointer, hover glow, animación de entrada en cascada).
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiUsers, FiSearch } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, borders } from '@/lib/design/effects';
import { localizeTeamName } from '@/lib/i18n/teamNames';
import type { Group, Team } from './types';
import TeamSquadModal from './TeamSquadModal';

interface Props {
  groups:    Group[];
  isPremium: boolean;
  locale:    string;
}

/** Aplana los standings de todos los grupos a una lista única de equipos con su grupo.
 *  Dedup por id (el backend ocasionalmente repite un equipo si está en varios grupos
 *  por error de sync — preferimos la primera aparición). */
function flattenTeams(groups: Group[]): Array<Team & { groupName: string }> {
  const seen = new Set<number>();
  const out: Array<Team & { groupName: string }> = [];
  groups.forEach(g => {
    g.standings?.forEach(s => {
      if (s.team && !seen.has(s.team.id)) {
        seen.add(s.team.id);
        out.push({ ...s.team, groupName: g.name });
      }
    });
  });
  return out;
}

export default function TeamsTab({ groups, isPremium, locale }: Props) {
  const allTeams = useMemo(() => flattenTeams(groups), [groups]);
  const [search,    setSearch]    = useState('');
  const [openTeam,  setOpenTeam]  = useState<(Team & { groupName: string }) | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTeams;
    return allTeams.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.shortName?.toLowerCase().includes(q) ||
      t.groupName.toLowerCase().includes(q)
    );
  }, [allTeams, search]);

  return (
    <div>
      {/* Section header */}
      <motion.div className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-5 rounded-full"
            style={{ background: `linear-gradient(180deg, ${hex.green.bright}, ${hex.green.muted})` }} />
          <h2 className="text-xl font-black text-white tracking-wide">Equipos del Mundial</h2>
        </div>
        <div className="flex-1 h-px"
          style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.25)}, transparent)` }} />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: alphaOf('green', 0.07), border: borders.brand('green', 0.18) }}>
          <FiUsers size={10} style={{ color: hex.green.bright }} />
          <span className="text-[8px] font-black text-green-400 tracking-[0.2em]">
            {allTeams.length} SELECCIONES
          </span>
        </div>
      </motion.div>

      {/* Tooltip explicativo */}
      <motion.p className="text-[11px] mb-4 px-3 py-2 rounded-lg leading-relaxed"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{
          color: alpha(hex.text.muted, 0.75),
          background: alpha(hex.bg.primary, 0.4),
          border: `1px solid ${alphaOf('green', 0.08)}`,
        }}>
        Click en cualquier equipo para ver su plantilla nacional.
        {!isPremium && <span style={{ color: hex.gold.base, marginLeft: 6, fontWeight: 700 }}>
          Free: 11 jugadores. Premium: completa.
        </span>}
      </motion.p>

      {/* Buscador */}
      <motion.div className="relative mb-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <FiSearch size={14}
          style={{ color: alpha(hex.text.muted, 0.5), position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar equipo o grupo…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[12px] outline-none"
          style={{
            background: alpha(hex.bg.primary, 0.55),
            border: `1px solid ${alphaOf('green', 0.12)}`,
            color: hex.text.primary,
          }} />
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[12px]" style={{ color: alpha(hex.text.muted, 0.6) }}>
            Sin equipos que coincidan con &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((t, i) => (
            <motion.button
              key={t.id}
              onClick={() => setOpenTeam(t)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.018, 0.6), duration: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group relative flex flex-col items-center gap-2 p-3 rounded-xl overflow-hidden text-left cursor-pointer"
              style={{
                background: `linear-gradient(180deg, ${alpha(hex.bg.primary, 0.7)}, ${alpha(hex.neutral.black, 0.85)})`,
                border: `1px solid ${alphaOf('green', 0.10)}`,
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}>
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at center, ${alphaOf('green', 0.10)}, transparent 70%)` }} />

              {/* Bandera */}
              <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden"
                style={{
                  boxShadow: `0 4px 14px ${alpha(hex.neutral.black, 0.5)}`,
                  border: `2px solid ${alpha(hex.neutral.white, 0.08)}`,
                }}>
                {t.flagUrl ? (
                  <Image src={t.flagUrl} alt={t.name} width={48} height={48}
                    className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px]"
                    style={{ background: alpha(hex.bg.primary, 0.8), color: alpha(hex.text.muted, 0.4) }}>
                    ?
                  </div>
                )}
              </div>

              {/* Nombre */}
              <div className="relative w-full text-center">
                <p className="text-[10px] font-black tracking-[0.18em] truncate"
                  style={{ color: hex.text.primary }}>
                  {t.shortName || t.name.slice(0, 3).toUpperCase()}
                </p>
                <p className="text-[10px] truncate mt-0.5"
                  style={{ color: alpha(hex.text.muted, 0.7) }}>
                  {localizeTeamName(t.name, locale) ?? t.name}
                </p>
                <p className="text-[8px] font-black tracking-[0.2em] mt-1"
                  style={{ color: alphaOf('green', 0.6) }}>
                  {t.groupName.toUpperCase()}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Modal */}
      <TeamSquadModal
        open={openTeam !== null}
        onClose={() => setOpenTeam(null)}
        teamId={openTeam?.id ?? null}
        teamName={openTeam ? (localizeTeamName(openTeam.name, locale) ?? openTeam.name) : ''}
        teamShort={openTeam?.shortName ?? ''}
        flagUrl={openTeam?.flagUrl ?? ''}
        isPremium={isPremium}
        locale={locale} />
    </div>
  );
}
