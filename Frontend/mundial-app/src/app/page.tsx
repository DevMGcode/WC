'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { FixtureCard } from '@/components/Cards';
import { Button, Spinner } from '@/components/Button';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentTournament, getLiveFixtures } from '@/services/publicTournament';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [upcomingFixtures, setUpcomingFixtures] = useState<any[]>([]);
  const [finishedFixtures, setFinishedFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const [currentTournament, liveFixtures] = await Promise.all([
        getCurrentTournament(),
        getLiveFixtures(),
      ]);

      if (currentTournament) {
        console.log('Torneo actual:', currentTournament.name);
      }

      const mockUpcoming = [
        {
          id: 1,
          homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
          awayTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
          kickoffAt: new Date(Date.now() + 604800000), // 7 días
          status: 'SCHEDULED',
        },
        {
          id: 2,
          homeTeam: { id: 3, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
          awayTeam: { id: 4, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
          kickoffAt: new Date(Date.now() + 1209600000), // 14 días
          status: 'SCHEDULED',
        },
        {
          id: 3,
          homeTeam: { id: 5, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
          awayTeam: { id: 6, name: 'México', shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' },
          kickoffAt: new Date(Date.now() + 1814400000), // 21 días
          status: 'SCHEDULED',
        },
      ];

      const mockFinished = [
        {
          id: 101,
          homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
          awayTeam: { id: 7, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
          homeScore: 3,
          awayScore: 1,
          kickoffAt: new Date(Date.now() - 86400000), // Ayer
          status: 'FINISHED',
        },
        {
          id: 102,
          homeTeam: { id: 8, name: 'Portugal', shortName: 'POR', flagUrl: 'https://flagcdn.com/pt.svg' },
          awayTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
          homeScore: 2,
          awayScore: 2,
          kickoffAt: new Date(Date.now() - 172800000), // Hace 2 días
          status: 'FINISHED',
        },
      ];

      const backendUpcoming = liveFixtures.filter((fixture) => fixture.status !== 'FINISHED');
      const backendFinished = liveFixtures.filter((fixture) => fixture.status === 'FINISHED');

      setUpcomingFixtures(backendUpcoming.length > 0 ? backendUpcoming : mockUpcoming);
      setFinishedFixtures(backendFinished.length > 0 ? backendFinished : mockFinished);
    } catch (error) {
      console.error('Error loading fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <Header
        title="⚽ Orionix Gol"
        subtitle="Tu app de predicciones y seguimiento"
        centerContent={
          user ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center md:text-left"
            >
              <p className="text-sm md:text-base text-cyan-100/95 font-semibold">
                ¡Bienvenido,{' '}
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-emerald-200">
                  {user.displayName}
                </span>
                !
              </p>
              <p className="text-xs md:text-sm text-cyan-100/70 mt-1">
                📧 {user.email} • Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </p>
            </motion.div>
          ) : null
        }
      />

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6 max-w-6xl mx-auto w-full">
                {/* Hero Section */}
                <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#060b16] via-[#0b1424] to-[#101a2f] p-8 md:p-12 shadow-2xl shadow-cyan-500/20 border border-cyan-400/25">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.2),transparent_35%)]" />
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
                  
                  <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
                    <div className="flex justify-center lg:justify-start">
                      <div className="w-full max-w-[420px] rounded-[2rem] border border-cyan-300/20 bg-white/5 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                        <Image
                          src="/logotipo.jpeg"
                          alt="Logotipo de Orionix Gol"
                          width={840}
                          height={840}
                          priority={false}
                          className="h-auto w-full rounded-[1.5rem] object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-4 inline-block">
                        <span className="text-5xl md:text-6xl font-black text-white tracking-wide drop-shadow-[0_0_18px_rgba(34,211,238,0.28)]">ORIONIX GOL</span>
                        <div className="mt-2 flex justify-end">
                          <span className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold tracking-wider text-cyan-100">
                            FOOTBALL TECH EXPERIENCE
                          </span>
                        </div>
                      </div>
                      <p className="text-xl md:text-2xl text-slate-100 font-semibold mb-6 max-w-2xl">Sigue el torneo con una experiencia premium: calendario, resultados, grupos y predicciones en una interfaz rápida, clara y diseñada para vivir el Mundial partido a partido.</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="city-chip border-cyan-300/35 bg-cyan-400/10 text-cyan-100">USA • innovación</span>
                      <span className="city-chip border-emerald-300/35 bg-emerald-400/10 text-emerald-100">MEX • energía</span>
                      <span className="city-chip border-rose-300/35 bg-rose-400/10 text-rose-100">CAN • precisión</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/predictions">
                        <Button variant="neon" size="lg">Comenzar Ahora</Button>
                      </Link>
                      <Link href="/groups">
                        <Button variant="outline" size="lg" className="border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/10">Ver Grupos</Button>
                      </Link>
                    </div>
                    </div>
                  </div>
                </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in">
          <div className="tech-panel rounded-xl p-5 text-center border border-cyan-300/25 hover:border-cyan-300/45 transition-all duration-300 transform hover:scale-105">
            <p className="text-sm text-slate-300 font-bold">Proximos</p>
            <p className="text-3xl font-black text-slate-100 tech-text-glow">{upcomingFixtures.length}</p>
          </div>
          <div className="tech-panel rounded-xl p-5 text-center border border-emerald-300/25 hover:border-emerald-300/45 transition-all duration-300 transform hover:scale-105">
            <p className="text-sm text-slate-300 font-bold">Jugados</p>
            <p className="text-3xl font-black text-slate-100">{finishedFixtures.length}</p>
          </div>
          <div className="tech-panel rounded-xl p-5 text-center border border-cyan-300/25 hover:border-cyan-300/45 transition-all duration-300 transform hover:scale-105">
            <p className="text-sm text-slate-300 font-bold">Tu Puntaje</p>
            <p className="text-3xl font-black text-cyan-200">1,250</p>
          </div>
        </div>

        {/* Próximos Partidos */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
              📅 Próximos Partidos
            </h2>
            <Link href="/fixtures">
              <Button
                variant="outline"
                size="sm"
                className="text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
              >
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingFixtures.map((fixture) => (
              <Link key={fixture.id} href={`/fixtures/${fixture.id}`}>
                <FixtureCard
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  kickoffAt={fixture.kickoffAt}
                  status={fixture.status}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Últimos Resultados */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
              🏆 Últimos Resultados
            </h2>
            <Link href="/fixtures?status=FINISHED">
              <Button
                variant="outline"
                size="sm"
                className="text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
              >
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finishedFixtures.map((fixture) => (
              <Link key={fixture.id} href={`/fixtures/${fixture.id}`}>
                <FixtureCard
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  homeScore={fixture.homeScore}
                  awayScore={fixture.awayScore}
                  kickoffAt={fixture.kickoffAt}
                  status={fixture.status}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Link href="/groups">
            <div className="tech-panel rounded-xl p-6 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/20 transition-all transform hover:scale-105 border border-cyan-300/25">
              <h3 className="text-2xl font-black mb-2">⚙️ Grupos</h3>
              <p className="text-sm text-slate-300 mb-4">Consulta la tabla de posiciones y avance de las fases</p>
              <span className="inline-block text-lg">→</span>
            </div>
          </Link>

          <Link href="/predictions">
            <div className="tech-panel rounded-xl p-6 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/20 transition-all transform hover:scale-105 border border-cyan-300/25">
              <h3 className="text-2xl font-black mb-2">🎯 Mis Porras</h3>
              <p className="text-sm text-slate-300 mb-4">Haz predicciones y compite en rankings</p>
              <span className="inline-block text-lg">→</span>
            </div>
          </Link>
        </div>

        {/* News Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2 mb-4">
            📰 Noticias
          </h2>
          <div className="tech-panel rounded-xl p-6 border border-cyan-300/25">
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 bg-slate-700/80 rounded-lg flex-shrink-0 border border-cyan-300/25"></div>
              <div>
                <h3 className="font-bold text-slate-100 mb-1">Confirmado: 12 ciudades serán sedes</h3>
                <p className="text-sm text-slate-300">La app Orionix Gol centraliza noticias, partidos y predicciones en una sola experiencia...</p>
                <p className="text-xs text-cyan-300 font-semibold mt-2">Hace 2 horas</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
