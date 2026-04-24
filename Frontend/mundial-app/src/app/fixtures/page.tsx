'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { FixtureCard } from '@/components/Cards';
import { Button, Spinner } from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getLiveFixtures } from '@/services/publicTournament';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'FINISHED' | 'LIVE'>('ALL');

  useEffect(() => {
    loadFixtures();
  }, [filter]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const liveFixtures = await getLiveFixtures();

      // Mock data
      const mockFixtures = [
        {
          id: 1,
          homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
          awayTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
          kickoffAt: new Date(Date.now() + 604800000),
          status: 'SCHEDULED',
          hostCity: 'Los Angeles',
          hostCountry: 'USA',
        },
        {
          id: 2,
          homeTeam: { id: 3, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
          awayTeam: { id: 4, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
          homeScore: 2,
          awayScore: 1,
          kickoffAt: new Date(Date.now() - 86400000),
          status: 'FINISHED',
          hostCity: 'Ciudad de Mexico',
          hostCountry: 'MEX',
        },
        {
          id: 3,
          homeTeam: { id: 5, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
          awayTeam: { id: 6, name: 'México', shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' },
          kickoffAt: new Date(Date.now() + 1209600000),
          status: 'SCHEDULED',
          hostCity: 'Guadalajara',
          hostCountry: 'MEX',
        },
        {
          id: 4,
          homeTeam: { id: 7, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
          awayTeam: { id: 8, name: 'Uruguay', shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' },
          homeScore: 1,
          awayScore: 1,
          kickoffAt: new Date(Date.now() - 172800000),
          status: 'FINISHED',
          hostCity: 'Toronto',
          hostCountry: 'CAN',
        },
      ];

      let filtered: any[] = mockFixtures;

      if (filter === 'LIVE' && liveFixtures.length > 0) {
        filtered = liveFixtures;
      } else if (filter === 'ALL' && liveFixtures.length > 0) {
        filtered = [...liveFixtures, ...mockFixtures].slice(0, 12);
      }

      if (filter !== 'ALL') {
        filtered = filtered.filter((f) => f.status === filter);
      }

      setFixtures(filtered);
    } catch (error) {
      console.error('Error loading fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCityTheme = (country?: string) => {
    if (country === 'USA') return 'theme-city-usa';
    if (country === 'MEX') return 'theme-city-mexico';
    if (country === 'CAN') return 'theme-city-canada';
    return 'theme-city-usa';
  };

  return (
    <div className="w-full">
      <Header title="📅 Calendario" subtitle="Todos los partidos de Orionix Gol" />

      <div className="px-4 py-6 max-w-6xl mx-auto w-full">
        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/30">
          {(['ALL', 'SCHEDULED', 'FINISHED', 'LIVE'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="flex-shrink-0"
            >
              {status === 'ALL' && '📋 Todos'}
              {status === 'SCHEDULED' && '🔮 Próximos'}
              {status === 'FINISHED' && '✅ Finalizados'}
              {status === 'LIVE' && '🔴 En Vivo'}
            </Button>
          ))}
        </div>

        {/* Fixtures List */}
        {loading ? (
          <Spinner />
        ) : fixtures.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <AnimatePresence>
              {fixtures.map((fixture, index) => (
                <motion.div
                  key={fixture.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <span className={`city-chip absolute top-3 left-3 z-20 ${getCityTheme(fixture.hostCountry)}`}>
                    {fixture.hostCountry} • {fixture.hostCity}
                  </span>
                  <Link href={`/fixtures/${fixture.id}`}>
                    <FixtureCard
                      homeTeam={fixture.homeTeam}
                      awayTeam={fixture.awayTeam}
                      homeScore={fixture.homeScore}
                      awayScore={fixture.awayScore}
                      kickoffAt={fixture.kickoffAt}
                      status={fixture.status}
                    />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl mb-4">😴</p>
            <p className="text-football-dark font-semibold">No hay partidos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
}
