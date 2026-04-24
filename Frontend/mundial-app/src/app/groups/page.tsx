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
    <div className="w-full">
      <Header title="⚙️ Grupos & Eliminatorias" subtitle="Tabla de posiciones y ruta al campeonato" />

      <div className="relative z-10 px-4 py-6 max-w-7xl mx-auto w-full pb-32">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-semibold">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* SECCIÓN 1: GRUPOS DE FASE CLASIFICATORIA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">📊 Fase de Grupos</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-transparent rounded-full"></div>
              </div>

              <div className="space-y-8">
                {groups.map((group, gIdx) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: gIdx * 0.06 }}
                  >
                    <Card className="overflow-hidden glass-premium hover-lift-premium border border-cyan-200/35">
                      <h3 className="text-xl font-black text-slate-800 mb-4 px-4 pt-4">{group.name}</h3>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 text-cyan-100">
                              <th className="px-4 py-2 text-left text-sm font-bold">Pos.</th>
                              <th className="px-4 py-2 text-left text-sm font-bold">Equipo</th>
                              <th className="px-4 py-2 text-center text-sm font-bold">PJ</th>
                              <th className="px-4 py-2 text-center text-sm font-bold">G</th>
                              <th className="px-4 py-2 text-center text-sm font-bold">E</th>
                              <th className="px-4 py-2 text-center text-sm font-bold">P</th>
                              <th className="px-4 py-2 text-center text-sm font-bold">DG</th>
                              <th className="px-4 py-2 text-center text-sm font-bold">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.standings.map((standing: any, idx: number) => (
                              <tr
                                key={standing.team.id}
                                className={`border-b border-slate-200/60 ${idx === 0 || idx === 1 ? 'bg-cyan-50/60' : 'bg-white/80 hover:bg-slate-50/80'}`}
                              >
                                <td className="px-4 py-3 font-bold text-slate-800">{standing.position}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-4 rounded overflow-hidden flex-shrink-0">
                                      <Image
                                        src={standing.team.flagUrl}
                                        alt={standing.team.name}
                                        width={24}
                                        height={16}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                      />
                                    </div>
                                    <span className="font-semibold text-slate-800">{standing.team.shortName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-sm">{standing.played}</td>
                                <td className="px-4 py-3 text-center text-sm text-emerald-600 font-bold">{standing.won}</td>
                                <td className="px-4 py-3 text-center text-sm text-amber-600 font-bold">{standing.drawn}</td>
                                <td className="px-4 py-3 text-center text-sm text-rose-600 font-bold">{standing.lost}</td>
                                <td className="px-4 py-3 text-center text-sm font-semibold">
                                  {standing.goalDiff > 0 ? '+' : ''}{standing.goalDiff}
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-black text-slate-800">
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

            {/* SECCIÓN 2: BRACKET DE ELIMINATORIAS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-16"
            >
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">🏆 Fase de Eliminatorias</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-transparent rounded-full"></div>
              </div>

              {bracketsData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Bracket data={bracketsData} />
                </motion.div>
              )}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3 mt-8"
            >
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
                >
                  ← Volver
                </Button>
              </Link>
              <Link href="/predictions" className="flex-1">
                <Button className="w-full">
                  🎯 Haz Predicciones
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
