'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePremium } from '@/hooks/usePremium';
import { alpha } from '@/lib/design/effects';
import { hex } from '@/lib/design/tokens';

const DEFAULT_IMAGES = [
  '/Propa/P1.png',
  '/Propa/P2.png',
  '/Propa/P3.png',
  '/Propa/P4.png',
];

const INTERVAL_MS = 5000;

function PromoCarouselInner({ images }: { images: string[] }) {
  const router = useRouter();
  const locale = useLocale();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none w-full"
      style={{
        border:    `1px solid ${alpha(hex.gold.base, 0.22)}`,
        boxShadow: `0 4px 28px rgba(0,0,0,0.35)`,
      }}
      onClick={() => router.push(`/${locale}/premium`)}
    >
      {/* Stack de imágenes — padding-bottom crea la altura responsiva */}
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt="Orionix Gol Premium"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0 }}
            loading="eager"
          />
        ))}
      </div>

      {/* Barra de progreso dorada */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(0,0,0,0.25)' }}>
        <motion.div
          key={current}
          className="h-full"
          style={{ background: hex.gold.bright }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
        />
      </div>

      {/* Puntos indicadores */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setCurrent(i); }}
            className="rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width:      i === current ? 18 : 6,
              height:     6,
              background: i === current ? hex.gold.bright : alpha(hex.neutral.white, 0.30),
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function PromoCarousel({ images = DEFAULT_IMAGES, className = 'my-5' }: { images?: string[]; className?: string }) {
  const { isPremium, isLoading } = usePremium();

  if (isLoading || isPremium) return null;

  return (
    <div className={`flex justify-center px-1 ${className}`}>
      <div className="w-full" style={{ maxWidth: 320 }}>
        <PromoCarouselInner images={images} />
      </div>
    </div>
  );
}
