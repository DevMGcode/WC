'use client';

import { useEffect, useState, useRef } from 'react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom';
}

interface Rect { top: number; left: number; width: number; height: number }

interface Props {
  steps: TourStep[];
  run: boolean;
  locale: { next: string; back: string; skip: string; last: string };
  onFinish: () => void;
}

const PAD  = 12;   // spotlight padding
const TW   = 330;  // tooltip width
const TH   = 260;  // max tooltip height estimate
const GAP  = 14;   // gap between spotlight and tooltip

export function CustomTour({ steps, run, locale, onFinish }: Props) {
  const [index, setIndex]   = useState(0);
  const [rect,  setRect]    = useState<Rect | null>(null);
  const [ready, setReady]   = useState(false);
  const rafRef = useRef<number | null>(null);

  const step = steps[index];

  /* reset when tour stops */
  useEffect(() => {
    if (!run) { setIndex(0); setRect(null); setReady(false); }
  }, [run]);

  /* scroll to target + measure */
  useEffect(() => {
    if (!run || !step) return;
    setReady(false);
    setRect(null);

    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // wait for scroll then measure
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      // small extra delay for paint
      rafRef.current = requestAnimationFrame(() => setReady(true));
    }, 480);

    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [run, index, step]);

  if (!run || !step) return null;

  const isLast = index === steps.length - 1;
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  /* ── tooltip position ──────────────────────────────────── */
  let tipTop = vh / 2 - TH / 2;
  let tipLeft = vw / 2 - TW / 2;
  let arrowDir: 'up' | 'down' | null = null;

  if (rect) {
    const cx     = rect.left + rect.width / 2;
    const prefer = step.placement ?? 'bottom';
    const belowY = rect.top  + rect.height + PAD + GAP;
    const aboveY = rect.top  - PAD - GAP - TH;

    let chosenTop: number;
    if (prefer === 'top' && aboveY >= 8) {
      chosenTop = aboveY; arrowDir = 'down';
    } else if (belowY + TH <= vh - 8) {
      chosenTop = belowY; arrowDir = 'up';
    } else if (aboveY >= 8) {
      chosenTop = aboveY; arrowDir = 'down';
    } else {
      chosenTop = vh / 2 - TH / 2; arrowDir = null;
    }

    tipTop  = Math.max(8, Math.min(vh - TH - 8, chosenTop));
    tipLeft = Math.max(8, Math.min(vw - TW - 8, cx - TW / 2));
  }

  /* ── arrow tip position (points toward target) ─────────── */
  const arrowLeft = rect
    ? Math.max(16, Math.min(TW - 32, (rect.left + rect.width / 2) - tipLeft - 10))
    : TW / 2 - 10;

  return (
    <>
      {/* ── overlay in 4 pieces with spotlight cutout ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 8000, pointerEvents: 'none' }}>
        {rect ? (
          <>
            {/* top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: Math.max(0, rect.top - PAD),
              background: 'rgba(1,5,16,0.80)',
            }} />
            {/* bottom */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: rect.top + rect.height + PAD, bottom: 0,
              background: 'rgba(1,5,16,0.80)',
            }} />
            {/* left */}
            <div style={{
              position: 'absolute',
              top: rect.top - PAD,
              left: 0,
              width: Math.max(0, rect.left - PAD),
              height: rect.height + PAD * 2,
              background: 'rgba(1,5,16,0.80)',
            }} />
            {/* right */}
            <div style={{
              position: 'absolute',
              top: rect.top - PAD,
              left: rect.left + rect.width + PAD,
              right: 0,
              height: rect.height + PAD * 2,
              background: 'rgba(1,5,16,0.80)',
            }} />
            {/* spotlight glow border */}
            <div style={{
              position: 'absolute',
              top:    rect.top  - PAD,
              left:   rect.left - PAD,
              width:  rect.width  + PAD * 2,
              height: rect.height + PAD * 2,
              borderRadius: 16,
              border: '2px solid rgba(34,211,238,0.75)',
              boxShadow: [
                '0 0 0 4px rgba(34,211,238,0.10)',
                '0 0 28px rgba(34,211,238,0.35)',
                'inset 0 0 20px rgba(34,211,238,0.05)',
              ].join(','),
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </>
        ) : (
          /* full dark overlay while measuring */
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,5,16,0.80)' }} />
        )}
      </div>

      {/* ── tooltip ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        zIndex: 8001,
        top: tipTop,
        left: tipLeft,
        width: TW,
        maxWidth: 'calc(100vw - 16px)',
        opacity: ready ? 1 : 0,
        transform: ready ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
        transition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        background: 'linear-gradient(145deg, #081222, #0c1c36)',
        border: '1px solid rgba(34,211,238,0.28)',
        borderRadius: 18,
        boxShadow: [
          '0 32px 80px rgba(0,0,0,0.75)',
          '0 0 0 1px rgba(34,211,238,0.06)',
          '0 0 40px rgba(34,211,238,0.08)',
        ].join(','),
        overflow: 'visible',
      }}>

        {/* arrow pointing toward target */}
        {arrowDir && rect && (
          <div style={{
            position: 'absolute',
            left: arrowLeft,
            ...(arrowDir === 'up'
              ? { top: -9, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '10px solid rgba(34,211,238,0.28)' }
              : { bottom: -9, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid rgba(34,211,238,0.28)' }
            ),
            width: 0, height: 0,
          }} />
        )}
        {arrowDir && rect && (
          <div style={{
            position: 'absolute',
            left: arrowLeft + 1,
            ...(arrowDir === 'up'
              ? { top: -7, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '9px solid #0c1c36' }
              : { bottom: -7, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '9px solid #081222' }
            ),
            width: 0, height: 0,
          }} />
        )}

        {/* header stripe */}
        <div style={{
          padding: '14px 18px 11px',
          background: 'linear-gradient(90deg, rgba(34,211,238,0.09) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(34,211,238,0.10)',
          borderRadius: '18px 18px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '0.01em' }}>
            {step.title}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(34,211,238,0.55)', fontWeight: 700,
            background: 'rgba(34,211,238,0.10)', padding: '2px 7px', borderRadius: 20 }}>
            {index + 1}/{steps.length}
          </span>
        </div>

        {/* body */}
        <div style={{ padding: '13px 18px 0', fontSize: 12.5, color: 'rgba(148,163,184,0.92)', lineHeight: 1.7 }}>
          {step.content}
        </div>

        {/* progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingTop: 12 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === index ? 18 : 5, height: 5,
              borderRadius: 99,
              background: i === index ? '#22d3ee' : 'rgba(34,211,238,0.20)',
              transition: 'all 0.25s ease',
            }} />
          ))}
        </div>

        {/* footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px 14px',
        }}>
          <button onClick={onFinish} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(148,163,184,0.40)', fontSize: 10.5, fontWeight: 600, padding: '4px 0',
          }}>
            {locale.skip}
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {index > 0 && (
              <button onClick={() => setIndex(i => i - 1)} style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.20)',
                borderRadius: 9, cursor: 'pointer',
                color: 'rgba(34,211,238,0.80)', fontSize: 11, fontWeight: 700,
                padding: '6px 13px',
              }}>
                {locale.back}
              </button>
            )}
            <button onClick={() => isLast ? onFinish() : setIndex(i => i + 1)} style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              border: 'none', borderRadius: 9, cursor: 'pointer',
              color: '#fff', fontSize: 11, fontWeight: 800,
              padding: '7px 18px',
              boxShadow: '0 4px 14px rgba(6,182,212,0.35)',
            }}>
              {isLast ? locale.last : locale.next}
            </button>
          </div>
        </div>
      </div>

      {/* click blocker outside spotlight */}
      <div onClick={e => e.stopPropagation()} style={{
        position: 'fixed', inset: 0, zIndex: 7999, cursor: 'default',
      }} />
    </>
  );
}
