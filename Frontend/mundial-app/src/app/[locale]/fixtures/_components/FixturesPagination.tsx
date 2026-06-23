'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { hex, resolveBrandHex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

/* ══════════════════════════════════════════
   PAGINACIÓN DEL CALENDARIO
   Numerada, paginando por días completos. El padre
   decide cuándo mostrarla (solo si hay > 1 página).
══════════════════════════════════════════ */
interface FixturesPaginationProps {
  page: number;                       // página actual (1-based)
  totalPages: number;
  onPageChange: (page: number) => void;
}

const GREEN = 'green' as const;

/* Secuencia de páginas con elipsis cuando hay muchas:
   1 … 4 5 [6] 7 8 … 12  (máx. ~7 elementos, cabe en móvil). */
function buildPageList(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('gap');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('gap');
  pages.push(total);
  return pages;
}

const ArrowBtn = ({
  dir, disabled, onClick,
}: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) => {
  const text = resolveBrandHex(GREEN);
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-label={dir === 'prev' ? 'Página anterior' : 'Página siguiente'}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
      style={{
        background: alpha(hex.neutral.white, disabled ? 0.02 : 0.04),
        border: `1px solid ${alpha(hex.neutral.white, disabled ? 0.05 : 0.10)}`,
        color: disabled ? alpha(hex.text.secondary, 0.30) : text,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      {dir === 'prev' ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
    </motion.button>
  );
};

export default function FixturesPagination({ page, totalPages, onPageChange }: FixturesPaginationProps) {
  const text = resolveBrandHex(GREEN);
  const pages = buildPageList(page, totalPages);

  return (
    <motion.nav
      aria-label="Paginación del calendario"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-1.5 mt-10"
    >
      <ArrowBtn dir="prev" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />

      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="w-6 text-center text-sm font-black select-none"
            style={{ color: alpha(hex.text.secondary, 0.4) }}>…</span>
        ) : (
          <motion.button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            whileHover={{ scale: p === page ? 1 : 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0 overflow-hidden"
            style={{ cursor: 'pointer' }}
          >
            {p === page && (
              <motion.span layoutId="fixture-page-pill" className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${alphaOf(GREEN, 0.24)}, ${alphaOf(GREEN, 0.10)})`,
                  border: `1px solid ${alphaOf(GREEN, 0.44)}`,
                  boxShadow: `0 0 20px ${alphaOf(GREEN, 0.28)}, inset 0 1px 0 ${alphaOf(GREEN, 0.14)}`,
                }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }} />
            )}
            <span className="relative z-10 text-sm font-black tabular-nums"
              style={{
                color: p === page ? text : alpha(hex.text.secondary, 0.65),
                textShadow: p === page ? `0 0 12px ${alphaOf(GREEN, 0.55)}` : 'none',
              }}>
              {p}
            </span>
          </motion.button>
        )
      )}

      <ArrowBtn dir="next" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
    </motion.nav>
  );
}
