import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#010508',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* ── Fondo gradiente radial izquierda (cyan) ── */}
        <div style={{
          position: 'absolute', top: -120, left: -120,
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* ── Fondo gradiente radial derecha (gold) ── */}
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.13) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* ── Fondo gradiente radial centro ── */}
        <div style={{
          position: 'absolute', top: '20%', left: '38%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 65%)',
          display: 'flex',
        }} />

        {/* ── Línea superior ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #22d3ee 30%, #fbbf24 70%, transparent)',
          display: 'flex',
        }} />

        {/* ── Grid de puntos decorativo ── */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          display: 'flex',
        }} />

        {/* ── Banda vertical izquierda ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: 'linear-gradient(180deg, transparent, #22d3ee, transparent)',
          display: 'flex',
        }} />

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: '0 80px',
          position: 'relative',
          zIndex: 10,
        }}>

          {/* Balón + nombre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 4 }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(2,8,20,0.90))',
              border: '2px solid rgba(34,211,238,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 42,
              boxShadow: '0 0 32px rgba(34,211,238,0.30)',
            }}>
              ⚽
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontSize: 46, fontWeight: 900, color: 'white',
                letterSpacing: '-0.5px', lineHeight: 1,
              }}>
                ORIONIX GOL
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: '#22d3ee',
                letterSpacing: '0.32em',
                textTransform: 'uppercase' as const,
              }}>
                FOOTBALL TECH EXPERIENCE
              </span>
            </div>
          </div>

          {/* Divisor */}
          <div style={{
            width: 520, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.30), rgba(251,191,36,0.20), transparent)',
            display: 'flex',
          }} />

          {/* MUNDIAL 2026 — texto principal */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{
              fontSize: 108, fontWeight: 900, color: 'white',
              lineHeight: 1, letterSpacing: '-3px',
            }}>
              MUNDIAL
            </span>
            <span style={{
              fontSize: 108, fontWeight: 900,
              color: '#22d3ee',
              lineHeight: 1, letterSpacing: '-2px',
              textShadow: '0 0 40px rgba(34,211,238,0.55), 0 0 80px rgba(34,211,238,0.25)',
            }}>
              2026
            </span>
          </div>

          {/* Divisor */}
          <div style={{
            width: 700, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), rgba(251,191,36,0.15), transparent)',
            display: 'flex',
          }} />

          {/* Tagline */}
          <span style={{
            fontSize: 26, fontWeight: 700,
            color: 'rgba(148,163,184,0.75)',
            letterSpacing: '0.20em',
            textTransform: 'uppercase' as const,
          }}>
            Predice · Compite · Gana
          </span>

          {/* Pills de features */}
          <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
            <div style={{
              display: 'flex', padding: '10px 24px', borderRadius: 999,
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.28)',
              color: '#22d3ee', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
            }}>
              🏆 Ligas Privadas
            </div>
            <div style={{
              display: 'flex', padding: '10px 24px', borderRadius: 999,
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.28)',
              color: '#fbbf24', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
            }}>
              📊 Ranking Global
            </div>
            <div style={{
              display: 'flex', padding: '10px 24px', borderRadius: 999,
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.28)',
              color: '#34d399', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
            }}>
              ⚡ Tiempo Real
            </div>
          </div>
        </div>

        {/* ── URL / dominio en la esquina ── */}
        <div style={{
          position: 'absolute', bottom: 28, right: 40,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#22d3ee',
            boxShadow: '0 0 8px rgba(34,211,238,0.80)',
          }} />
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: 'rgba(34,211,238,0.55)',
            letterSpacing: '0.12em',
          }}>
            orionixgol.com
          </span>
        </div>

        {/* ── Línea inferior ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #fbbf24 30%, #22d3ee 70%, transparent)',
          display: 'flex',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
