'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiPlus } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf, surfaces } from '@/lib/design/effects';
import { SectionLabel } from './ui';

interface Team { id: number; name: string; shortName: string; flagUrl: string; }

interface FavoritesTabProps {
  favoriteTeams: Team[];
  setFavoriteTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  allTeams: Team[];
  t: (key: string) => string;
}

export default function FavoritesTab({ favoriteTeams, setFavoriteTeams, allTeams, t }: FavoritesTabProps) {
  return (
    <motion.div
      key="favorites"
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      {favoriteTeams.length > 0 && (
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: surfaces.card(),
            border: `1px solid ${alpha(hex.accent.pink, 0.18)}`,
            backdropFilter: 'blur(32px)',
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.accent.pink, 0.55)}, transparent)` }} />
          <SectionLabel color={hex.accent.pink}>{t('profile.myTeams')}</SectionLabel>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {favoriteTeams.map(team => (
              <motion.div
                key={team.id}
                whileHover={{ scale: 1.04 }}
                className="relative group cursor-pointer rounded-2xl overflow-hidden"
                style={{ background: alpha(hex.neutral.white, 0.03), border: `1px solid ${alpha(hex.neutral.white, 0.07)}` }}
              >
                <div className="aspect-square p-2 flex items-center justify-center">
                  <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl"
                  style={{ background: alpha(hex.neutral.black, 0.72), backdropFilter: 'blur(4px)' }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setFavoriteTeams(p => p.filter(f => f.id !== team.id))}
                >
                  <FiTrash2 size={16} style={{ color: hex.accent.redSoft }} />
                  <span className="text-[9px] font-black text-red-300 tracking-wide">{t('common.delete')}</span>
                </motion.div>
                <p className="text-[10px] font-black text-center py-1.5 tracking-wide" style={{ color: hex.text.secondary }}>{team.shortName}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {allTeams.filter(t => !favoriteTeams.find(f => f.id === t.id)).length > 0 && (
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: surfaces.card(),
            border: `1px solid ${alphaOf('green', 0.14)}`,
            backdropFilter: 'blur(32px)',
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.50)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.02)}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.40)}, transparent)` }} />
          <SectionLabel color={hex.green.bright}>{t('profile.addTeams')}</SectionLabel>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {allTeams
              .filter(tm => !favoriteTeams.find(f => f.id === tm.id))
              .map(team => (
                <motion.div
                  key={team.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (!favoriteTeams.find(f => f.id === team.id))
                      setFavoriteTeams(p => [...p, team]);
                  }}
                  className="relative group cursor-pointer rounded-2xl overflow-hidden"
                  style={{ background: alpha(hex.neutral.white, 0.02), border: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}
                >
                  <div className="aspect-square p-2 flex items-center justify-center">
                    <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover rounded-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl"
                    style={{ background: alphaOf('green', 0.12), backdropFilter: 'blur(4px)' }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    <FiPlus size={16} className="text-orionix-green-bright" />
                    <span className="text-[9px] font-black text-green-300 tracking-wide">+</span>
                  </motion.div>
                  <p className="text-[10px] font-black text-center py-1.5 tracking-wide text-orionix-text-muted">{team.shortName}</p>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {favoriteTeams.length === 0 && allTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-orionix-text-muted">
          <FiHeart size={40} style={{ opacity: 0.3 }} />
          <p className="text-sm font-semibold mt-3">{t('profile.noFavorites')}</p>
        </div>
      )}
    </motion.div>
  );
}
