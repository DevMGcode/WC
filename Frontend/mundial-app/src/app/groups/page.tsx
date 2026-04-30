'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { Button, Card } from '@/components/Button';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bracket } from '@/components/BracketChampions';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [bracketsData, setBracketsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grupos' | 'eliminatorias' | 'campeon'>('grupos');

  useEffect(() => {
    // Mock data
    const mockGroups = [
      {
        id: 1,
        name: 'Grupo A',
        standings: [
          { position: 1, team: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 6 },
          { position: 2, team: { id: 2, name: 'Uruguay', shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 2 },
          { position: 3, team: { id: 3, name: 'Paraguay', shortName: 'PAR', flagUrl: 'https://flagcdn.com/py.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -4 },
          { position: 4, team: { id: 4, name: 'Canadá', shortName: 'CAN', flagUrl: 'https://flagcdn.com/ca.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -4 },
        ],
      },
      {
        id: 2,
        name: 'Grupo B',
        standings: [
          { position: 1, team: { id: 5, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' }, points: 9, played: 3, won: 3, drawn: 0, lost: 0, goalDiff: 8 },
          { position: 2, team: { id: 6, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' }, points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 3 },
          { position: 3, team: { id: 7, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' }, points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -2 },
          { position: 4, team: { id: 8, name: 'Jamaica', shortName: 'JAM', flagUrl: 'https://flagcdn.com/jm.svg' }, points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -9 },
        ],
      },
    ];

    // Mock data del bracket - ESTRUCTURA JERÁRQUICA
    // Los ganadores de octavos avanzan automáticamente a cuartos
    const argentina = { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' };
    const brasil = { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' };
    const francia = { id: 3, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' };
    const alemania = { id: 5, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' };
    const espana = { id: 4, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' };
    const portugal = { id: 7, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' };
    const italia = { id: 6, name: 'Italia', shortName: 'ITA', flagUrl: 'https://flagcdn.com/it.svg' };
    const belgica = { id: 8, name: 'Bélgica', shortName: 'BEL', flagUrl: 'https://flagcdn.com/be.svg' };

    const mockBrackets = {
      octavos: [
        {
          id: 1,
          homeTeam: argentina,
          awayTeam: { id: 9, name: 'Holanda', shortName: 'HOL', flagUrl: 'https://flagcdn.com/nl.svg' },
          homeScore: 2,
          awayScore: 1,
          winner: argentina,
          isPlayed: true,
        },
        {
          id: 2,
          homeTeam: brasil,
          awayTeam: { id: 10, name: 'Corea del Sur', shortName: 'KOR', flagUrl: 'https://flagcdn.com/kr.svg' },
          homeScore: 4,
          awayScore: 1,
          winner: brasil,
          isPlayed: true,
        },
        {
          id: 3,
          homeTeam: francia,
          awayTeam: { id: 11, name: 'Polonia', shortName: 'POL', flagUrl: 'https://flagcdn.com/pl.svg' },
          homeScore: 3,
          awayScore: 1,
          winner: francia,
          isPlayed: true,
        },
        {
          id: 4,
          homeTeam: espana,
          awayTeam: { id: 12, name: 'Marruecos', shortName: 'MAR', flagUrl: 'https://flagcdn.com/ma.svg' },
          homeScore: 3,
          awayScore: 0,
          winner: espana,
          isPlayed: true,
        },
        {
          id: 5,
          homeTeam: alemania,
          awayTeam: { id: 13, name: 'Japón', shortName: 'JAP', flagUrl: 'https://flagcdn.com/jp.svg' },
          homeScore: 4,
          awayScore: 2,
          winner: alemania,
          isPlayed: true,
        },
        {
          id: 6,
          homeTeam: italia,
          awayTeam: { id: 14, name: 'Suiza', shortName: 'SUI', flagUrl: 'https://flagcdn.com/ch.svg' },
          homeScore: 2,
          awayScore: 0,
          winner: italia,
          isPlayed: true,
        },
        {
          id: 7,
          homeTeam: portugal,
          awayTeam: { id: 15, name: 'Dinamarca', shortName: 'DIN', flagUrl: 'https://flagcdn.com/dk.svg' },
          homeScore: 3,
          awayScore: 1,
          winner: portugal,
          isPlayed: true,
        },
        {
          id: 8,
          homeTeam: belgica,
          awayTeam: { id: 16, name: 'Uruguay', shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' },
          homeScore: 2,
          awayScore: 0,
          winner: belgica,
          isPlayed: true,
        },
      ],
      cuartos: [
        {
          id: 9,
          homeTeam: argentina,
          awayTeam: brasil,
          homeScore: 1,
          awayScore: 0,
          winner: argentina,
          isPlayed: true,
        },
        {
          id: 10,
          homeTeam: francia,
          awayTeam: espana,
          homeScore: 2,
          awayScore: 1,
          winner: francia,
          isPlayed: true,
        },
        {
          id: 11,
          homeTeam: alemania,
          awayTeam: italia,
          homeScore: 2,
          awayScore: 1,
          winner: alemania,
          isPlayed: true,
        },
        {
          id: 12,
          homeTeam: portugal,
          awayTeam: belgica,
          homeScore: 3,
          awayScore: 1,
          winner: portugal,
          isPlayed: true,
        },
      ],
      semifinales: [
        {
          id: 13,
          homeTeam: argentina,
          awayTeam: francia,
          homeScore: 2,
          awayScore: 0,
          winner: argentina,
          isPlayed: true,
        },
        {
          id: 14,
          homeTeam: alemania,
          awayTeam: portugal,
          homeScore: 2,
          awayScore: 1,
          winner: alemania,
          isPlayed: true,
        },
      ],
      final: [
        {
          id: 15,
          homeTeam: argentina,
          awayTeam: alemania,
          homeScore: 3,
          awayScore: 2,
          winner: argentina,
          isPlayed: true,
        },
      ],
    };

    setGroups(mockGroups);
    setBracketsData(mockBrackets);
    setLoading(false);
  }, []);

  return (
    <div className="w-full relative min-h-screen bg-gradient-to-b from-[#040912] via-[#0a1828] to-[#051015]">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.2),transparent_35%)]" />
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
      
      <div className="relative z-10">
        <Header title="⚙️ Grupos & Eliminatorias" subtitle="Tabla de posiciones y ruta al campeonato" centered />

      {/* Navigation Bar - Always Visible */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#07192f] via-[#0a2740] to-[#081525] border-b border-cyan-300/20 shadow-lg">
        <div className="px-2 md:px-4 py-3 max-w-7xl mx-auto w-full flex items-center gap-2 md:gap-4 overflow-x-auto">
          <motion.button
            onClick={() => setActiveTab('grupos')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
              activeTab === 'grupos'
                ? 'border-2 border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                : 'border-2 border-slate-500/40 text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-400/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📊 Fase de Grupos
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('eliminatorias')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
              activeTab === 'eliminatorias'
                ? 'border-2 border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                : 'border-2 border-slate-500/40 text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-400/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏆 Eliminatorias
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('campeon')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
              activeTab === 'campeon'
                ? 'border-2 border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                : 'border-2 border-slate-500/40 text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-400/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            👑 Campeón
          </motion.button>
        </div>
      </div>

      <div className="relative px-4 md:px-6 py-4 md:py-6 max-w-7xl mx-auto w-full pb-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-semibold">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* SECCIÓN 1: GRUPOS DE FASE CLASIFICATORIA */}
            {activeTab === 'grupos' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2">📊 Fase de Grupos</h2>
                <div className="h-1.5 w-20 md:w-24 bg-gradient-to-r from-cyan-400 to-transparent rounded-full"></div>
              </div>

              <div className="space-y-6">
                {groups.map((group, gIdx) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: gIdx * 0.06 }}
                  >
                    <Card className="overflow-hidden glass-premium hover-lift-premium border border-cyan-200/35">
                      <h3 className="text-lg md:text-xl font-black text-slate-800 mb-3 px-3 md:px-4 pt-3">{group.name}</h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 text-cyan-100">
                              <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold">Pos.</th>
                              <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold">Equipo</th>
                              <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-bold">PJ</th>
                              <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-bold">G</th>
                              <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-bold">E</th>
                              <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-bold">P</th>
                              <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-bold">DG</th>
                              <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-bold">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.standings.map((standing: any, idx: number) => (
                              <tr
                                key={standing.team.id}
                                className={`border-b border-slate-200/20 ${idx === 0 || idx === 1 ? 'bg-cyan-300/10' : 'bg-white/15 hover:bg-slate-100/20'}`}
                              >
                                <td className="px-2 md:px-4 py-2 font-bold text-slate-800 text-xs md:text-sm">{standing.position}</td>
                                <td className="px-2 md:px-4 py-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-3 md:w-6 md:h-4 rounded overflow-hidden flex-shrink-0">
                                      <Image
                                        src={standing.team.flagUrl}
                                        alt={standing.team.name}
                                        width={24}
                                        height={16}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                      />
                                    </div>
                                    <span className="font-semibold text-slate-800 text-xs md:text-sm">{standing.team.shortName}</span>
                                  </div>
                                </td>
                                <td className="px-2 md:px-4 py-2 text-center text-xs">{standing.played}</td>
                                <td className="px-2 md:px-4 py-2 text-center text-xs text-emerald-600 font-bold">{standing.won}</td>
                                <td className="px-2 md:px-4 py-2 text-center text-xs text-amber-600 font-bold">{standing.drawn}</td>
                                <td className="px-2 md:px-4 py-2 text-center text-xs text-rose-600 font-bold">{standing.lost}</td>
                                <td className="px-2 md:px-4 py-2 text-center text-xs font-semibold">
                                  {standing.goalDiff > 0 ? '+' : ''}{standing.goalDiff}
                                </td>
                                <td className="px-2 md:px-4 py-2 text-center text-xs font-black text-slate-800">
                                  {standing.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            )}

            {/* SECCIÓN 2: BRACKET DE ELIMINATORIAS */}
            {activeTab === 'eliminatorias' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-2 md:mt-4"
            >
              <div className="mb-3">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-1">🏆 Fase de Eliminatorias</h2>
                <div className="h-1.5 w-20 md:w-24 bg-gradient-to-r from-cyan-400 to-transparent rounded-full"></div>
              </div>

              {bracketsData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-full overflow-x-auto"
                >
                  <div className="min-w-full scale-90 lg:scale-100 origin-top-left transform">
                    <Bracket data={bracketsData} />
                  </div>
                </motion.div>
              )}
            </motion.div>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2 md:gap-3 -mt-24 md:-mt-32"
            >
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
                >
                  <span className="hidden md:inline">← Volver</span>
                  <span className="md:hidden">←</span>
                </Button>
              </Link>
              <Link href="/predictions" className="flex-1">
                <Button className="w-full">
                  <span className="hidden md:inline">🎯 Haz Predicciones</span>
                  <span className="md:hidden">🎯</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
