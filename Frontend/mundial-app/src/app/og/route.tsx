import { ImageResponse } from 'next/og';

export const runtime = 'edge';

type Locale = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'ru' | 'ar';

const COPY: Record<Locale, {
  tagline: string;
  card1Label: string; card1Value: string;
  card2Label: string; card2Value: string;
  card3Label: string; card3Value: string;
}> = {
  es: { tagline: 'PREDICE · COMPITE · GANA',             card1Label: 'PREDICCIONES', card1Value: 'Tiempo Real',      card2Label: 'COMPETICIÓN', card2Value: 'Ligas Privadas',  card3Label: 'CLASIFICACIÓN', card3Value: 'Ranking Global'      },
  en: { tagline: 'PREDICT · COMPETE · WIN',               card1Label: 'PREDICTIONS',  card1Value: 'Real Time',        card2Label: 'COMPETITION', card2Value: 'Private Leagues', card3Label: 'STANDINGS',     card3Value: 'Global Ranking'      },
  fr: { tagline: 'PRÉDIS · COMPÈTE · GAGNE',              card1Label: 'PRONOSTICS',   card1Value: 'Temps Réel',       card2Label: 'COMPÉTITION', card2Value: 'Ligues Privées',  card3Label: 'CLASSEMENT',    card3Value: 'Ranking Mondial'     },
  de: { tagline: 'TIPPEN · ANTRETEN · GEWINNEN',          card1Label: 'TIPPS',        card1Value: 'Echtzeit',         card2Label: 'WETTBEWERB',  card2Value: 'Private Ligen',   card3Label: 'RANGLISTE',     card3Value: 'Global Ranking'      },
  pt: { tagline: 'PREVEJA · COMPITA · GANHE',             card1Label: 'PREVISÕES',    card1Value: 'Tempo Real',       card2Label: 'COMPETIÇÃO',  card2Value: 'Ligas Privadas',  card3Label: 'CLASSIFICAÇÃO', card3Value: 'Ranking Global'      },
  ru: { tagline: 'ПРЕДСКАЗЫВАЙ · СОРЕВНУЙСЯ · ПОБЕЖДАЙ', card1Label: 'ПРОГНОЗЫ',     card1Value: 'Реальное Время',   card2Label: 'ЛИГИ',        card2Value: 'Частные Лиги',   card3Label: 'РЕЙТИНГ',      card3Value: 'Глобальный Рейтинг' },
  ar: { tagline: 'توقع · نافس · اربح',                    card1Label: 'تنبؤات',        card1Value: 'في الوقت الفعلي', card2Label: 'مسابقة',      card2Value: 'دوريات خاصة',   card3Label: 'تصنيف',         card3Value: 'ترتيب عالمي'         },
};

const MATCH_COPY: Record<Locale, { live: string; final: string; soon: string; cta: string }> = {
  es: { live: 'EN VIVO',        final: 'RESULTADO FINAL', soon: 'PRÓXIMO PARTIDO',  cta: 'Haz tu porra y compite en Orionix Gol' },
  en: { live: 'LIVE',           final: 'FINAL RESULT',    soon: 'UPCOMING MATCH',   cta: 'Make your prediction on Orionix Gol' },
  fr: { live: 'EN DIRECT',      final: 'RÉSULTAT FINAL',  soon: 'PROCHAIN MATCH',   cta: 'Fais ton pronostic sur Orionix Gol' },
  de: { live: 'LIVE',           final: 'ENDSTAND',        soon: 'NÄCHSTES SPIEL',   cta: 'Tippe jetzt auf Orionix Gol' },
  pt: { live: 'AO VIVO',        final: 'RESULTADO FINAL', soon: 'PRÓXIMO JOGO',     cta: 'Faça seu palpite no Orionix Gol' },
  ru: { live: 'В ПРЯМОМ ЭФИРЕ', final: 'ИТОГ',            soon: 'БЛИЖАЙШИЙ МАТЧ',   cta: 'Сделай свой прогноз на Orionix Gol' },
  ar: { live: 'مباشر',          final: 'النتيجة النهائية', soon: 'المباراة القادمة', cta: 'توقّع نتيجتك على Orionix Gol' },
};

const VALID: Locale[] = ['es', 'en', 'fr', 'de', 'pt', 'ru', 'ar'];

// Paleta oficial del sitio
const C = {
  bg0:         '#030B05',
  bg1:         '#050D07',
  bg2:         '#08170D',
  bg3:         '#0E2214',
  bg4:         '#14311C',
  green:       '#4CAF50',
  greenDark:   '#2E7D32',
  greenMuted:  '#7CBF7F',
  greenSoft:   'rgba(76,175,80,0.12)',
  gold:        '#D4AF37',
  goldBright:  '#E2C760',
  goldGlow:    'rgba(212,175,55,0.35)',
  greenGlow:   'rgba(76,175,80,0.35)',
  text:        '#F5F7FA',
  textSec:     '#B8C4BC',
  textMuted:   '#6E7C72',
  red:         '#EF5350',
  redGlow:     'rgba(239,83,80,0.35)',
};

async function loadImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout?.(4000) ?? undefined });
    if (!res.ok) return '';
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    const type = res.headers.get('content-type') || 'image/png';
    return `data:${type};base64,${btoa(bin)}`;
  } catch {
    return '';
  }
}

/** Fondo: gradiente verde oscuro + orbes + grid sutil + líneas doradas */
const Bg = () => (
  <>
    {/* Base: gradiente radial desde centro oscuro */}
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, #0A2010 0%, #050D07 55%, #030B05 100%)`, display: 'flex' }} />
    {/* Orbe verde grande — centro-izquierda */}
    <div style={{ position: 'absolute', top: -60, left: -100, width: 700, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(46,125,50,0.22) 0%, rgba(46,125,50,0.05) 55%, transparent 75%)`, display: 'flex' }} />
    {/* Orbe dorado — inferior derecha */}
    <div style={{ position: 'absolute', bottom: -80, right: -60, width: 520, height: 420, borderRadius: '50%', background: `radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.04) 50%, transparent 72%)`, display: 'flex' }} />
    {/* Orbe verde claro — superior derecha */}
    <div style={{ position: 'absolute', top: 0, right: 0, width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, rgba(76,175,80,0.10) 0%, transparent 65%)`, display: 'flex' }} />
    {/* Grid de puntos muy sutil */}
    <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px', display: 'flex' }} />
    {/* Barra superior dorada */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent 2%, ${C.greenDark} 18%, ${C.green} 38%, ${C.goldBright} 62%, ${C.gold} 80%, transparent 98%)`, display: 'flex' }} />
    {/* Barra inferior verde */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent 2%, ${C.gold} 18%, ${C.goldBright} 40%, ${C.green} 62%, ${C.greenDark} 82%, transparent 98%)`, display: 'flex' }} />
    {/* Línea vertical izquierda */}
    <div style={{ position: 'absolute', top: 3, left: 0, bottom: 3, width: 3, background: `linear-gradient(180deg, ${C.green}, ${C.gold}, ${C.green})`, display: 'flex' }} />
    {/* Línea vertical derecha */}
    <div style={{ position: 'absolute', top: 3, right: 0, bottom: 3, width: 3, background: `linear-gradient(180deg, ${C.gold}, ${C.green}, ${C.gold})`, display: 'flex' }} />
  </>
);

/** Sección de un equipo: bandera grande + código + nombre */
const Team = ({ flag, code, name, align }: { flag: string; code: string; name: string; align: 'left' | 'right' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 340 }}>
    {/* Contenedor de bandera con glow */}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, rgba(76,175,80,0.18) 0%, transparent 68%)`, display: 'flex' }} />
      {flag ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flag} width={148} height={148}
          style={{ borderRadius: 24, objectFit: 'cover', position: 'relative',
            border: `3px solid rgba(76,175,80,0.40)`,
            boxShadow: `0 8px 48px rgba(0,0,0,0.65), 0 0 36px rgba(46,125,50,0.22), inset 0 1px 0 rgba(255,255,255,0.06)` }}
          alt={code} />
      ) : (
        <div style={{ width: 148, height: 148, borderRadius: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${C.bg3}, ${C.bg4})`, border: `3px solid rgba(76,175,80,0.35)`, boxShadow: `0 8px 48px rgba(0,0,0,0.65)` }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: C.green, letterSpacing: '-1px' }}>{code.slice(0, 3)}</span>
        </div>
      )}
    </div>
    {/* Código del país */}
    <span style={{ fontSize: 46, fontWeight: 900, color: C.text, lineHeight: 1, letterSpacing: '-1.5px', textShadow: `0 2px 20px rgba(0,0,0,0.5)` }}>{code}</span>
    {/* Nombre completo */}
    <span style={{ fontSize: 17, fontWeight: 600, color: C.textSec, lineHeight: 1, textAlign: 'center' }}>{name}</span>
  </div>
);

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const raw = searchParams.get('locale') ?? 'es';
  const locale: Locale = VALID.includes(raw as Locale) ? (raw as Locale) : 'es';

  const logoSrc = await loadImage(`${origin}/logotipo_Orionix_Gol_transparente.png`);

  // ══════════════════════════════════════════════════
  // MODO PARTIDO
  // ══════════════════════════════════════════════════
  const home = searchParams.get('home');
  const away = searchParams.get('away');

  if (home && away) {
    const hc = searchParams.get('hc') ?? home;
    const ac = searchParams.get('ac') ?? away;
    const hf = searchParams.get('hf');
    const af = searchParams.get('af');
    const hs = searchParams.get('hs');
    const as_ = searchParams.get('as');
    const st = searchParams.get('st') ?? 'SCHEDULED';
    const m = MATCH_COPY[locale];

    const [homeFlag, awayFlag] = await Promise.all([
      hf ? loadImage(hf) : Promise.resolve(''),
      af ? loadImage(af) : Promise.resolve(''),
    ]);

    const hasScore = hs !== null && as_ !== null && st !== 'SCHEDULED';

    // Colores según estado del partido
    const S = st === 'LIVE'
      ? { c: C.red,        bg: 'rgba(211,47,47,0.13)',   b: C.redGlow,   label: m.live  }
      : st === 'FINISHED'
        ? { c: C.goldBright, bg: 'rgba(212,175,55,0.13)', b: C.goldGlow, label: m.final }
        : { c: C.green,      bg: 'rgba(46,125,50,0.13)',  b: C.greenGlow, label: m.soon };

    return new ImageResponse(
      (
        <div style={{
          width: '1200px', height: '630px',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative', overflow: 'hidden',
          background: C.bg1,
        }}>
          <Bg />

          {/* ── CABECERA: logo centrado ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 52px 0', position: 'relative' }}>
            {/* Chip URL — arriba derecha */}
            <div style={{ position: 'absolute', right: 52, top: 22, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 20, background: 'rgba(46,125,50,0.12)', border: `1px solid rgba(76,175,80,0.25)` }}>
              <div style={{ width: 5, height: 5, borderRadius: 3, background: C.green, boxShadow: `0 0 8px ${C.green}`, display: 'flex' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: C.greenMuted }}>orionixgol.com</span>
            </div>

            {/* Logo solo, centrado y grande */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, rgba(76,175,80,0.22) 0%, transparent 68%)`, top: -50, left: -50, display: 'flex' }} />
              {logoSrc
                ? <img src={logoSrc} width={220} height={220} style={{ objectFit: 'contain', position: 'relative', display: 'flex', filter: 'drop-shadow(0 6px 30px rgba(76,175,80,0.45))' }} alt="logo" />
                : <div style={{ width: 220, height: 220, borderRadius: 36, background: `linear-gradient(135deg, ${C.bg3}, ${C.bg4})`, border: `2px solid rgba(76,175,80,0.40)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
                  </div>
              }
              {/* MUNDIAL 2026 debajo del logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', marginTop: -22 }}>
                <div style={{ height: 1.5, width: 28, background: `linear-gradient(90deg, transparent, ${C.gold})`, display: 'flex', borderRadius: 1 }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: '0.32em' }}>MUNDIAL 2026</span>
                <div style={{ height: 1.5, width: 28, background: `linear-gradient(90deg, ${C.gold}, transparent)`, display: 'flex', borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* ── CUERPO: equipos + marcador ── */}
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0 40px 0' }}>
            {/* Equipo local */}
            <Team flag={homeFlag} code={hc} name={home} align="left" />

            {/* Centro: estado + score/VS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 220, marginTop: -20 }}>
              {/* Badge de estado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 20, background: S.bg, border: `1.5px solid ${S.b}` }}>
                <div style={{ width: 7, height: 7, borderRadius: 4, background: S.c, display: 'flex', boxShadow: `0 0 10px ${S.c}` }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', color: S.c }}>{S.label}</span>
              </div>

              {hasScore ? (
                /* Marcador */
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 96, fontWeight: 900, color: C.text, lineHeight: 1, letterSpacing: '-3px', textShadow: `0 0 40px rgba(76,175,80,0.45)` }}>{hs}</span>
                  <span style={{ fontSize: 56, fontWeight: 900, color: C.goldBright, lineHeight: 1, marginTop: -4 }}>:</span>
                  <span style={{ fontSize: 96, fontWeight: 900, color: C.text, lineHeight: 1, letterSpacing: '-3px', textShadow: `0 0 40px rgba(76,175,80,0.45)` }}>{as_}</span>
                </div>
              ) : (
                /* VS */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <div style={{ width: 2, height: 20, background: `linear-gradient(180deg, transparent, ${C.greenMuted})`, display: 'flex', borderRadius: 1 }} />
                  <span style={{ fontSize: 72, fontWeight: 900, color: C.green, lineHeight: 1, letterSpacing: '-2px', textShadow: `0 0 40px rgba(76,175,80,0.65), 0 0 80px rgba(46,125,50,0.30)` }}>VS</span>
                  <div style={{ width: 2, height: 20, background: `linear-gradient(180deg, ${C.greenMuted}, transparent)`, display: 'flex', borderRadius: 1 }} />
                </div>
              )}
            </div>

            {/* Equipo visitante */}
            <Team flag={awayFlag} code={ac} name={away} align="right" />
          </div>

          {/* ── FOOTER: CTA ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 56px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 32px', borderRadius: 28, background: `linear-gradient(90deg, rgba(212,175,55,0.10), rgba(212,175,55,0.06))`, border: `1px solid rgba(212,175,55,0.30)`, boxShadow: `0 4px 24px rgba(0,0,0,0.35)` }}>
              {/* Diamante decorativo */}
              <div style={{ width: 8, height: 8, background: C.gold, transform: 'rotate(45deg)', display: 'flex', boxShadow: `0 0 12px ${C.gold}` }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: C.goldBright, letterSpacing: '0.02em' }}>{m.cta}</span>
              <div style={{ width: 8, height: 8, background: C.gold, transform: 'rotate(45deg)', display: 'flex', boxShadow: `0 0 12px ${C.gold}` }} />
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ══════════════════════════════════════════════════
  // MODO GENÉRICO (banner de marca)
  // ══════════════════════════════════════════════════
  const c = COPY[locale];

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative', overflow: 'hidden',
        background: C.bg1,
      }}>
        <Bg />

        {/* ── CABECERA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 56px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', right: 56, top: 24, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 20, background: 'rgba(46,125,50,0.12)', border: `1px solid rgba(76,175,80,0.25)` }}>
            <div style={{ width: 5, height: 5, borderRadius: 3, background: C.green, boxShadow: `0 0 8px ${C.green}`, display: 'flex' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: C.greenMuted }}>orionixgol.com</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(76,175,80,0.20) 0%, transparent 68%)`, top: -30, left: -44, display: 'flex' }} />
            {logoSrc
              ? <img src={logoSrc} width={220} height={220} style={{ objectFit: 'contain', position: 'relative', display: 'flex', filter: 'drop-shadow(0 6px 30px rgba(76,175,80,0.45))' }} alt="logo" />
              : <div style={{ width: 220, height: 220, borderRadius: 36, background: `linear-gradient(135deg, ${C.bg3}, ${C.bg4})`, border: `2px solid rgba(76,175,80,0.40)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
                </div>
            }
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <div style={{ height: 1.5, width: 28, background: `linear-gradient(90deg, transparent, ${C.gold})`, display: 'flex', borderRadius: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: '0.32em' }}>MUNDIAL 2026</span>
              <div style={{ height: 1.5, width: 28, background: `linear-gradient(90deg, ${C.gold}, transparent)`, display: 'flex', borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* ── HÉROE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
          <div style={{ width: 60, height: 2, borderRadius: 1, background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`, display: 'flex', marginBottom: 12 }} />
          <span style={{ fontSize: 86, fontWeight: 900, color: C.text, letterSpacing: '-5px', lineHeight: 1 }}>MUNDIAL</span>
          <span style={{ fontSize: 108, fontWeight: 900, letterSpacing: '-7px', lineHeight: 1, color: C.green, textShadow: `0 0 50px rgba(76,175,80,0.90), 0 0 100px rgba(46,125,50,0.50), 0 0 180px rgba(46,125,50,0.22)` }}>2026</span>
          <div style={{ width: 60, height: 2, borderRadius: 1, background: `linear-gradient(90deg, transparent, ${C.goldBright}, transparent)`, display: 'flex', marginTop: 12 }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.35em', color: C.textMuted, marginTop: 16 }}>{c.tagline}</span>
        </div>

        {/* ── BOTTOM: 3 cards ── */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '0 52px 32px' }}>
          {[
            { icon: 'target',   color: C.green,      glow: 'rgba(76,175,80,0.28)',   label: c.card1Label, value: c.card1Value },
            { icon: 'award',    color: C.goldBright,  glow: 'rgba(212,175,55,0.28)',  label: c.card2Label, value: c.card2Value },
            { icon: 'trending', color: C.greenMuted,  glow: 'rgba(124,191,127,0.28)', label: c.card3Label, value: c.card3Value },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 16, flex: 1, background: `linear-gradient(145deg, rgba(14,34,20,0.95), rgba(5,13,7,0.98))`, border: `1px solid rgba(76,175,80,0.18)`, boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(76,175,80,0.08) inset`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${item.color}66, transparent)`, display: 'flex' }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${item.color}18`, border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${item.glow}` }}>
                {item.icon === 'target' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                  </svg>
                )}
                {item.icon === 'award' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                )}
                {item.icon === 'trending' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: `${item.color}99` }}>{item.label}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: item.color, lineHeight: 1, textShadow: `0 0 16px ${item.glow}` }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
