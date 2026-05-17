'use client';

import { motion } from 'framer-motion';
import { useTour } from '@/contexts/TourContext';
import type { TourStep } from './CustomTour';

interface TourButtonProps {
  steps: TourStep[];
}

export default function TourButton({ steps }: TourButtonProps) {
  const { startTour } = useTour();

  return (
    <motion.button
      onClick={() => startTour(steps)}
      whileHover={{ scale: 1.10 }}
      whileTap={{ scale: 0.93 }}
      title="Ayuda — tour guiado"
      className="fixed bottom-24 right-4 z-40 flex items-center justify-center rounded-full md:bottom-8 md:right-6"
      style={{
        width: 42,
        height: 42,
        background: 'linear-gradient(135deg, rgba(13,148,136,0.90), rgba(6,182,212,0.90))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(34,211,238,0.35)',
        boxShadow: '0 4px 20px rgba(34,211,238,0.30), 0 0 0 1px rgba(34,211,238,0.10)',
        color: '#fff',
        fontSize: 18,
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      ?
    </motion.button>
  );
}
