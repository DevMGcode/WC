'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { FixtureCard } from '@/components/Cards';
import { Button, Card, Badge } from '@/components/Button';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getFixtureById } from '@/services/publicTournament';

export default function FixtureDetailPage({ params }: { params: { id: string } }) {
  const [fixture, setFixture] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFixture = async () => {
      try {
        const backendFixture = await getFixtureById(parseInt(params.id, 10));

        if (backendFixture) {
          setFixture(backendFixture);
          return;
        }

        setFixture({
          id: parseInt(params.id, 10),
          homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
          awayTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
          homeScore: 3,
          awayScore: 1,
          kickoffAt: new Date(Date.now() - 86400000),
          status: 'FINISHED',
          events: [
            { id: 1, minute: 15, type: 'GOAL', teamId: 1, playerName: 'Messi', description: 'GOL' },
            { id: 2, minute: 32, type: 'CARD', teamId: 2, playerName: 'Neymar', description: 'Tarjeta Amarilla' },
            { id: 3, minute: 67, type: 'GOAL', teamId: 1, playerName: 'Agüero', description: 'GOL' },
            { id: 4, minute: 78, type: 'GOAL', teamId: 1, playerName: 'Di Maria', description: 'GOL' },
          ],
          stadiumName: 'MetLife Stadium',
          attendance: 82000,
          matchDay: 'Semifinal - Fase de grupos',
        });
      } finally {
        setLoading(false);
      }
    };

    loadFixture();
  }, [params.id]);

  if (loading) {
    return <div className="relative z-10 p-8 text-center text-slate-700 font-semibold">Cargando...</div>;
  }

  if (!fixture) {
    return <div className="relative z-10 p-8 text-center text-slate-700 font-semibold">Partido no encontrado</div>;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <Header title="⚽ Detalle del Partido" subtitle={fixture.matchDay} />

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto w-full pb-32">
        {/* Main Fixture Card */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          <FixtureCard
            homeTeam={fixture.homeTeam}
            awayTeam={fixture.awayTeam}
            homeScore={fixture.homeScore}
            awayScore={fixture.awayScore}
            kickoffAt={fixture.kickoffAt}
            status={fixture.status}
          />
        </motion.div>

        {/* Información del Estadio */}
        <Card className="mb-8 glass-premium border border-cyan-200/35 hover-lift-premium">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏟️</span>
            <h3 className="text-xl font-black text-slate-800">Información del Partido</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Estadio</p>
              <p className="font-bold text-slate-800">{fixture.stadiumName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Asistencia</p>
              <p className="font-bold text-slate-800">{fixture.attendance.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Eventos del Partido */}
        {fixture.events && fixture.events.length > 0 && (
          <Card className="mb-8 glass-premium border border-cyan-200/35 hover-lift-premium">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-xl font-black text-slate-800">Eventos del Partido</h3>
            </div>

            <div className="space-y-3">
              {fixture.events.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border-l-4 border border-cyan-200/35"
                  style={{
                    borderColor:
                      event.teamId === fixture.homeTeam.id
                        ? '#06b6d4'
                        : '#f43f5e',
                  }}
                >
                  <div className="text-2xl text-center w-10">
                    {event.type === 'GOAL' && '⚽'}
                    {event.type === 'CARD' && '🟨'}
                    {event.type === 'SUBSTITUTION' && '🔄'}
                    {event.type === 'INJURY' && '🚑'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{event.playerName}</p>
                    <p className="text-sm text-slate-600">{event.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="info">{event.minute}'</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Alineaciones */}
        <Card className="mb-8 glass-premium border border-cyan-200/35 hover-lift-premium">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👥</span>
            <h3 className="text-xl font-black text-slate-800">Alineaciones</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home lineup */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-8 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <Image
                    src={fixture.homeTeam.flagUrl}
                    alt={fixture.homeTeam.name}
                    width={32}
                    height={24}
                    unoptimized
                  />
                </div>
                {fixture.homeTeam.name}
              </h4>
              <div className="space-y-1 text-sm text-slate-700">
                <p>1. Dibu Martínez (POR)</p>
                <p>4. O. Romero (DEF)</p>
                <p>3. Otamendi (DEF)</p>
                <p>5. Acuña (DEF)</p>
                <p>10. Messi (MED)</p>
                <p>7. Di María (DEL)</p>
              </div>
            </div>

            {/* Away lineup */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-8 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <Image
                    src={fixture.awayTeam.flagUrl}
                    alt={fixture.awayTeam.name}
                    width={32}
                    height={24}
                    unoptimized
                  />
                </div>
                {fixture.awayTeam.name}
              </h4>
              <div className="space-y-1 text-sm text-slate-700">
                <p>1. Alisson (POR)</p>
                <p>4. Dias (DEF)</p>
                <p>3. Silva (DEF)</p>
                <p>6. Casemiro (MED)</p>
                <p>10. Neymar (MED)</p>
                <p>7. Vinicius (DEL)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Estadísticas */}
        <Card className="mb-8 glass-premium border border-cyan-200/35 hover-lift-premium">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <h3 className="text-xl font-black text-slate-800">Estadísticas</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Posesión', home: 65, away: 35 },
              { label: 'Tiros', home: 18, away: 12 },
              { label: 'Tiros al arco', home: 8, away: 4 },
              { label: 'Córners', home: 6, away: 4 },
              { label: 'Faltas', home: 14, away: 18 },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-sm font-semibold text-slate-600 mb-2">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${stat.home}%` }}
                      />
                    </div>
                  </div>
                  <p className="w-12 text-center font-bold text-sm text-slate-800">
                    {stat.home}% - {stat.away}%
                  </p>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 ml-auto"
                        style={{ width: `${stat.away}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Botones */}
        <div className="flex gap-3">
          <Link href="/fixtures" className="flex-1">
            <Button variant="outline" className="w-full">
              ← Volver
            </Button>
          </Link>
          <Link href="/predictions" className="flex-1">
            <Button className="w-full">
              🎯 Ver Predicciones
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
