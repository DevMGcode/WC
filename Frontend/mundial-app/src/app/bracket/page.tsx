'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { Bracket } from '@/components/Bracket';
import { motion } from 'framer-motion';

interface BracketData {
  octavos: any[];
  cuartos: any[];
  semifinales: any[];
  final: any[];
}

export default function BracketPage() {
  const [bracketsData, setBracketsData] = useState<BracketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrackets();
  }, []);

  const loadBrackets = async () => {
    try {
      setLoading(true);

      // Mock data del bracket
      const mockBrackets = {
        roundOf16: [
          {
            name: 'OCTAVOS',
            matches: [
              {
                id: 1,
                homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
                awayTeam: { id: 9, name: 'Holanda', shortName: 'HOL', flagUrl: 'https://flagcdn.com/nl.svg' },
                homeScore: 2,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 2,
                homeTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
                awayTeam: { id: 10, name: 'Corea del Sur', shortName: 'KOR', flagUrl: 'https://flagcdn.com/kr.svg' },
                homeScore: 4,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 3,
                homeTeam: { id: 3, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
                awayTeam: { id: 11, name: 'Polonia', shortName: 'POL', flagUrl: 'https://flagcdn.com/pl.svg' },
                homeScore: 3,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 4,
                homeTeam: { id: 4, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
                awayTeam: { id: 12, name: 'Marruecos', shortName: 'MAR', flagUrl: 'https://flagcdn.com/ma.svg' },
                homeScore: 3,
                awayScore: 0,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 5,
                homeTeam: { id: 5, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
                awayTeam: { id: 13, name: 'Japón', shortName: 'JAP', flagUrl: 'https://flagcdn.com/jp.svg' },
                homeScore: 4,
                awayScore: 2,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 6,
                homeTeam: { id: 6, name: 'Italia', shortName: 'ITA', flagUrl: 'https://flagcdn.com/it.svg' },
                awayTeam: { id: 14, name: 'Suiza', shortName: 'SUI', flagUrl: 'https://flagcdn.com/ch.svg' },
                homeScore: 2,
                awayScore: 0,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 7,
                homeTeam: { id: 7, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' },
                awayTeam: { id: 15, name: 'Dinamarca', shortName: 'DIN', flagUrl: 'https://flagcdn.com/dk.svg' },
                homeScore: 3,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 8,
                homeTeam: { id: 8, name: 'Bélgica', shortName: 'BEL', flagUrl: 'https://flagcdn.com/be.svg' },
                awayTeam: { id: 16, name: 'Uruguay', shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' },
                homeScore: 2,
                awayScore: 0,
                status: 'FINISHED',
                winner: 'home',
              },
            ],
          },
          {
            name: 'CUARTOS',
            matches: [
              {
                id: 9,
                homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
                awayTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
                homeScore: 1,
                awayScore: 0,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 10,
                homeTeam: { id: 3, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
                awayTeam: { id: 4, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
                homeScore: 2,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 11,
                homeTeam: { id: 5, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
                awayTeam: { id: 6, name: 'Italia', shortName: 'ITA', flagUrl: 'https://flagcdn.com/it.svg' },
                homeScore: 2,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 12,
                homeTeam: { id: 7, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' },
                awayTeam: { id: 8, name: 'Bélgica', shortName: 'BEL', flagUrl: 'https://flagcdn.com/be.svg' },
                homeScore: 3,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
            ],
          },
          {
            name: 'SEMIFINALES',
            matches: [
              {
                id: 13,
                homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
                awayTeam: { id: 3, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
                homeScore: 2,
                awayScore: 0,
                status: 'FINISHED',
                winner: 'home',
              },
              {
                id: 14,
                homeTeam: { id: 5, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
                awayTeam: { id: 7, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' },
                homeScore: 2,
                awayScore: 1,
                status: 'FINISHED',
                winner: 'home',
              },
            ],
          },
          {
            name: 'FINAL',
            matches: [
              {
                id: 15,
                homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
                awayTeam: { id: 5, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
                homeScore: 3,
                awayScore: 2,
                status: 'FINISHED',
                winner: 'home',
              },
            ],
          },
        ],
      };

      const bracketsFormatted = {
        octavos: mockBrackets.roundOf16[0]?.matches || [],
        cuartos: mockBrackets.roundOf16[1]?.matches || [],
        semifinales: mockBrackets.roundOf16[2]?.matches || [],
        final: mockBrackets.roundOf16[3]?.matches || [],
      };
      setBracketsData(bracketsFormatted);
    } catch (error) {
      console.error('Error loading brackets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header
        title="🏆 Eliminatorias"
        subtitle="Ruta hacia el campeonato - Octavos, Cuartos, Semifinales y Final"
      />

      <div className="relative px-4 py-8 max-w-7xl mx-auto w-full pb-32">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-96"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-semibold">Cargando bracket...</p>
            </div>
          </motion.div>
        ) : bracketsData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Trophy icon en el center (solo en desktop) */}
            <div className="hidden lg:flex justify-center mb-12">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl"
              >
                🏆
              </motion.div>
            </div>

            {/* Bracket */}
            <Bracket data={bracketsData} />

            {/* Info Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 pt-8 border-t border-slate-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-cyan-200/30 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-bold text-slate-800 mb-2">Sistema Actual</h4>
                  <p className="text-sm text-slate-600">
                    Campeonato Mundial 2026 - Sistema de eliminación directa
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-cyan-200/30 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-bold text-slate-800 mb-2">Fases</h4>
                  <p className="text-sm text-slate-600">
                    Octavos → Cuartos → Semifinales → Final
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-cyan-200/30 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-bold text-slate-800 mb-2">En Vivo</h4>
                  <p className="text-sm text-slate-600">
                    Resultados actualizados en tiempo real
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 font-semibold">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
