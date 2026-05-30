'use client';

/**
 * PageSkeleton — pantalla de carga instantánea usada en loading.tsx de cada ruta.
 * Next.js App Router la muestra en el mismo frame del clic, antes de descargar
 * el JS de la página destino. Esto elimina el "freeze" de navegación.
 */

import React from 'react';

/* ── Pulse block genérico ── */
const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/[0.04] ${className}`} />
);

/* ── Skeleton de una tarjeta de partido ── */
export const MatchCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col items-center gap-2 flex-1">
        <Pulse className="w-12 h-12 rounded-full" />
        <Pulse className="w-16 h-3" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Pulse className="w-20 h-8" />
        <Pulse className="w-12 h-3" />
      </div>
      <div className="flex flex-col items-center gap-2 flex-1">
        <Pulse className="w-12 h-12 rounded-full" />
        <Pulse className="w-16 h-3" />
      </div>
    </div>
  </div>
);

/* ── Skeleton de la página de Calendario ── */
export const FixturesPageSkeleton = () => (
  <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 30%, #040A06 0%, #06110A 50%, #040A06 100%)' }}>
    {/* Header */}
    <div className="h-16 border-b border-white/[0.04] flex items-center px-6 gap-4">
      <Pulse className="w-8 h-8 rounded-full" />
      <Pulse className="w-28 h-5" />
    </div>
    <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
      {/* Filter bar */}
      <div className="flex gap-2">
        {[80, 60, 80, 80].map((w, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-white/[0.04] h-10" style={{ width: w }} />
        ))}
      </div>
      {/* Cards */}
      {Array.from({ length: 5 }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/* ── Skeleton de detalle de partido ── */
export const FixtureDetailSkeleton = () => (
  <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 20%, #040A06 0%, #06110A 60%, #040A06 100%)' }}>
    <div className="h-16 border-b border-white/[0.04] flex items-center px-6 gap-4">
      <Pulse className="w-8 h-8 rounded-full" />
      <Pulse className="w-32 h-5" />
    </div>
    <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
      {/* Marcador */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-3 flex-1">
            <Pulse className="w-16 h-16 rounded-full" />
            <Pulse className="w-20 h-4" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Pulse className="w-28 h-12" />
            <Pulse className="w-16 h-3" />
          </div>
          <div className="flex flex-col items-center gap-3 flex-1">
            <Pulse className="w-16 h-16 rounded-full" />
            <Pulse className="w-20 h-4" />
          </div>
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex gap-2">
        {[90, 90, 80, 60].map((w, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-white/[0.04] h-10" style={{ width: w }} />
        ))}
      </div>
      {/* Tab content */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <Pulse key={i} className={`h-12 w-full`} />)}
      </div>
    </div>
  </div>
);

/* ── Skeleton genérico para grupos, scorers, etc. ── */
export const GenericPageSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 30%, #040A06 0%, #06110A 50%, #040A06 100%)' }}>
    <div className="h-16 border-b border-white/[0.04] flex items-center px-6 gap-4">
      <Pulse className="w-8 h-8 rounded-full" />
      <Pulse className="w-36 h-5" />
    </div>
    <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
      <div className="flex gap-3 mb-2">
        <Pulse className="w-24 h-4" />
        <Pulse className="w-16 h-4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Pulse key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

/* ── Skeleton de tab content (para dynamic() fallback) ── */
export const TabSkeleton = () => (
  <div className="space-y-3 py-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04]">
        <Pulse className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-3 w-3/4" />
          <Pulse className="h-2.5 w-1/2" />
        </div>
        <Pulse className="w-8 h-5 shrink-0" />
      </div>
    ))}
  </div>
);
