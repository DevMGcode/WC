'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Navigation';
import { Button, Card, Badge } from '@/components/Button';
import { FixtureCard } from '@/components/Cards';
import { motion, AnimatePresence } from 'framer-motion';

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<'MY_PREDICTIONS' | 'RANKING' | 'LEAGUES'>('MY_PREDICTIONS');
  const [myPredictions, setMyPredictions] = useState<any[]>([]);
  const [globalRanking, setGlobalRanking] = useState<any[]>([]);
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Mock data
      const predictions = [
        {
          id: 1,
          fixture: {
            id: 1,
            homeTeam: { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
            awayTeam: { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
            homeScore: 2,
            awayScore: 1,
            kickoffAt: new Date(Date.now() - 86400000),
            status: 'FINISHED',
          },
          predictedHomeScore: 2,
          predictedAwayScore: 1,
          pointsAwarded: 50,
          resultStatus: 'CORRECT',
        },
      ];

      const ranking = [
        { rank: 1, user: 'Carlos M.', points: 2850, predictions: 48 },
        { rank: 2, user: 'Juan P.', points: 2640, predictions: 48 },
        { rank: 3, user: 'Pedro L.', points: 2490, predictions: 47 },
        { rank: 4, user: 'Marco F.', points: 2380, predictions: 48 },
        { rank: 5, user: 'Luis S.', points: 2210, predictions: 46 },
      ];

      const leagues = [
        {
          id: 1,
          name: 'Mi Oficina',
          memberCount: 12,
          myRank: 3,
          myPoints: 1850,
          leader: { name: 'Francisco', points: 2100 },
        },
        {
          id: 2,
          name: 'Grupo de Amigos',
          memberCount: 6,
          myRank: 1,
          myPoints: 2050,
          leader: { name: 'Yo', points: 2050 },
        },
      ];

      setMyPredictions(predictions);
      setGlobalRanking(ranking);
      setMyLeagues(leagues);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Header title="🎯 Porras" subtitle="Predicciones y rankings" centered />

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto w-full pb-32">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass-premium rounded-xl p-1.5 shadow-xl border border-cyan-200/35">
          {(
            ['MY_PREDICTIONS', 'RANKING', 'LEAGUES'] as const
          ).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.97 }}
              className={`relative flex-1 py-2.5 px-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                activeTab === tab
                  ? 'text-white'
                  : 'bg-transparent text-slate-700 hover:bg-slate-200/65'
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="predictions-tab-pill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 shadow-lg shadow-cyan-500/25"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative z-10">
              {tab === 'MY_PREDICTIONS' && '📋 Mis Porras'}
              {tab === 'RANKING' && '🏆 Ranking'}
              {tab === 'LEAGUES' && '👥 Ligas'}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {/* My Predictions Tab */}
        {activeTab === 'MY_PREDICTIONS' && (
          <motion.div
            key="my-predictions"
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="glass-premium border border-cyan-200/35 hover-lift-premium">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-black text-slate-800">Mis Estadísticas</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-premium-dark rounded-lg p-3 text-center border border-cyan-300/30">
                  <p className="text-2xl font-black text-cyan-100">1,250</p>
                  <p className="text-xs text-cyan-300 font-semibold">Puntos Totales</p>
                </div>
                <div className="glass-premium-dark rounded-lg p-3 text-center border border-amber-300/30">
                  <p className="text-2xl font-black text-amber-200">32</p>
                  <p className="text-xs text-amber-300 font-semibold">Predicciones</p>
                </div>
                <div className="glass-premium-dark rounded-lg p-3 text-center border border-emerald-300/30">
                  <p className="text-2xl font-black text-emerald-200">18</p>
                  <p className="text-xs text-emerald-300 font-semibold">Acertadas</p>
                </div>
                <div className="glass-premium-dark rounded-lg p-3 text-center border border-cyan-300/30">
                  <p className="text-2xl font-black text-cyan-200">#42</p>
                  <p className="text-xs text-cyan-300 font-semibold">Posición Global</p>
                </div>
              </div>
            </Card>

            <Card className="glass-premium border border-cyan-200/35 hover-lift-premium">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="text-xl font-black text-slate-800">Mis Predicciones</h3>
              </div>

              <div className="space-y-4">
                {myPredictions.map((pred, idx) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: idx * 0.06 }}
                    className="border-2 border-cyan-200/40 rounded-lg overflow-hidden hover:border-cyan-400 transition-all bg-white/70"
                  >
                    <FixtureCard
                      homeTeam={pred.fixture.homeTeam}
                      awayTeam={pred.fixture.awayTeam}
                      homeScore={pred.fixture.homeScore}
                      awayScore={pred.fixture.awayScore}
                      kickoffAt={pred.fixture.kickoffAt}
                      status={pred.fixture.status}
                      showPrediction={true}
                      predictions={{
                        home: pred.predictedHomeScore,
                        away: pred.predictedAwayScore,
                      }}
                    />
                    <div className="p-3 bg-white/80 border-t-2 border-cyan-200/40 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600">Tu predicción</p>
                        <p className="font-black text-lg text-slate-800">
                          {pred.predictedHomeScore} - {pred.predictedAwayScore}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={pred.resultStatus === 'CORRECT' ? 'success' : 'warning'}
                        >
                          {pred.pointsAwarded} pts
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Ranking Tab */}
        {activeTab === 'RANKING' && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
          <Card className="glass-premium border border-cyan-200/35 hover-lift-premium">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏆</span>
              <h3 className="text-xl font-black text-slate-800">Ranking Global</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 text-cyan-100">
                    <th className="px-4 py-2 text-left text-sm font-bold">Pos.</th>
                    <th className="px-4 py-2 text-left text-sm font-bold">Usuario</th>
                    <th className="px-4 py-2 text-center text-sm font-bold">Predicciones</th>
                    <th className="px-4 py-2 text-right text-sm font-bold">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {globalRanking.map((player, idx) => (
                    <tr
                      key={player.rank}
                      className={`border-b border-slate-200/60 ${idx < 3 ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-2xl">
                          {player.rank === 1 && '🥇'}
                          {player.rank === 2 && '🥈'}
                          {player.rank === 3 && '🥉'}
                          {player.rank > 3 && player.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{player.user}</td>
                      <td className="px-4 py-3 text-center text-sm">{player.predictions}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          </motion.div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'LEAGUES' && (
          <motion.div
            key="leagues"
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {myLeagues.map((league, idx) => (
              <motion.div
                key={league.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.06 }}
              >
              <Card className="glass-premium border border-cyan-200/35 hover-lift-premium transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-800">{league.name}</h4>
                    <p className="text-sm text-slate-600">{league.memberCount} miembros</p>
                  </div>
                  <Badge variant="info">#{league.myRank}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="glass-premium-dark rounded-lg p-3 text-center border border-cyan-300/30">
                    <p className="text-2xl font-black text-cyan-100">{league.myPoints}</p>
                    <p className="text-xs text-cyan-300 font-semibold">Tus Puntos</p>
                  </div>
                  <div className="glass-premium-dark rounded-lg p-3 text-center border border-amber-300/30">
                    <p className="text-sm font-bold text-amber-200">{league.leader.name}</p>
                    <p className="text-lg font-black text-amber-100">{league.leader.points}</p>
                    <p className="text-xs text-amber-300">Líder</p>
                  </div>
                  <div className="glass-premium-dark rounded-lg p-3 text-center border border-cyan-300/30">
                    <p className="text-sm font-bold text-cyan-200">Diferencia</p>
                    <p className="text-lg font-black text-cyan-100">-{league.leader.points - league.myPoints}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
                >
                  Ver Liga →
                </Button>
              </Card>
              </motion.div>
            ))}

            <Card className="glass-premium border-2 border-cyan-300/40 hover-lift-premium">
              <div className="text-center">
                <p className="text-2xl mb-2">➕</p>
                <h4 className="font-black text-slate-800 mb-2">Crear o Unirse a una Liga</h4>
                <p className="text-sm text-slate-600 mb-4">Compite con tus amigos y compañeros</p>
                <Button className="w-full">
                  Nueva Liga
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
