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

// Textos del "modo partido" (cuando se comparte una porra de un partido concreto)
const MATCH_COPY: Record<Locale, { live: string; final: string; soon: string; cta: string }> = {
  es: { live: 'EN VIVO',            final: 'RESULTADO FINAL', soon: 'PRÓXIMO PARTIDO',  cta: 'Haz tu porra y compite en Orionix Gol' },
  en: { live: 'LIVE',               final: 'FINAL RESULT',    soon: 'UPCOMING MATCH',   cta: 'Make your prediction on Orionix Gol' },
  fr: { live: 'EN DIRECT',          final: 'RÉSULTAT FINAL',  soon: 'PROCHAIN MATCH',   cta: 'Fais ton pronostic sur Orionix Gol' },
  de: { live: 'LIVE',               final: 'ENDSTAND',        soon: 'NÄCHSTES SPIEL',   cta: 'Tippe jetzt auf Orionix Gol' },
  pt: { live: 'AO VIVO',            final: 'RESULTADO FINAL', soon: 'PRÓXIMO JOGO',     cta: 'Faça seu palpite no Orionix Gol' },
  ru: { live: 'В ПРЯМОМ ЭФИРЕ',     final: 'ИТОГ',            soon: 'БЛИЖАЙШИЙ МАТЧ',   cta: 'Сделай свой прогноз на Orionix Gol' },
  ar: { live: 'مباشر',              final: 'النتيجة النهائية', soon: 'المباراة القادمة', cta: 'توقّع نتيجتك على Orionix Gol' },
};

const VALID: Locale[] = ['es', 'en', 'fr', 'de', 'pt', 'ru', 'ar'];

const IconTarget = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconAward = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);
const IconTrending = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

/** Descarga una imagen y la devuelve como data-URL base64 (Satori no carga URLs remotas SVG ni con CORS). */
async function loadImage(url: string): Promise<string> {
  try {
    const res = await fetch(url);
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

/** Fondo común (orbes, líneas neón, grid de puntos). */
const Background = () => (
  <>
    <div style={{ position: 'absolute', top: -200, left: -140, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.20) 0%, rgba(34,211,238,0.06) 40%, transparent 70%)', display: 'flex' }} />
    <div style={{ position: 'absolute', bottom: -160, right: -90, width: 540, height: 540, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.16) 0%, rgba(251,191,36,0.04) 45%, transparent 70%)', display: 'flex' }} />
    <div style={{ position: 'absolute', top: 60, right: 80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 68%)', display: 'flex' }} />
    <div style={{ position: 'absolute', top: 120, left: 250, width: 700, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)', display: 'flex' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 3%, #22d3ee 30%, #38bdf8 50%, #fbbf24 70%, transparent 97%)', display: 'flex' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 3%, #fbbf24 30%, #22d3ee 60%, transparent 97%)', display: 'flex' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.025, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.85) 1px, transparent 1px)', backgroundSize: '36px 36px', display: 'flex' }} />
  </>
);

/** Cabecera común (logo + nombre + chip de URL). */
const Header = ({ logoSrc }: { logoSrc: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '34px 60px 0', position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', display: 'flex' }}>
        <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: 44, background: 'radial-gradient(circle, rgba(34,211,238,0.26) 0%, transparent 70%)', top: -12, left: -12, display: 'flex' }} />
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} width={62} height={62} style={{ objectFit: 'contain', position: 'relative', display: 'flex' }} alt="logo" />
        ) : (
          <div style={{ width: 62, height: 62, borderRadius: 15, position: 'relative', background: 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(2,8,20,0.85))', border: '1.5px solid rgba(34,211,238,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
            </svg>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 23, fontWeight: 900, color: 'white', letterSpacing: '-0.3px', lineHeight: 1 }}>ORIONIX GOL</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 1, background: 'rgba(34,211,238,0.55)', display: 'flex' }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.28em' }}>FOOTBALL TECH EXPERIENCE</span>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 20, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
      <div style={{ width: 5, height: 5, borderRadius: 3, background: '#22d3ee', boxShadow: '0 0 8px rgba(34,211,238,0.90)', display: 'flex' }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(34,211,238,0.55)' }}>orionixgol.com</span>
    </div>
  </div>
);

/** Bloque de un equipo (bandera + código + nombre). */
const TeamBlock = ({ flag, code, name }: { flag: string; code: string; name: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 320 }}>
    {flag ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={flag} width={150} height={150} style={{ borderRadius: 24, objectFit: 'cover', border: '3px solid rgba(34,211,238,0.30)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} alt={code} />
    ) : (
      <div style={{ width: 150, height: 150, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,211,238,0.10)', border: '3px solid rgba(34,211,238,0.30)' }}>
        <span style={{ fontSize: 46, fontWeight: 900, color: '#22d3ee' }}>{code.slice(0, 3)}</span>
      </div>
    )}
    <span style={{ fontSize: 44, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>{code}</span>
    <span style={{ fontSize: 19, fontWeight: 700, color: 'rgba(148,163,184,0.85)', lineHeight: 1 }}>{name}</span>
  </div>
);

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const raw = searchParams.get('locale') ?? 'es';
  const locale: Locale = VALID.includes(raw as Locale) ? (raw as Locale) : 'es';

  const logoSrc = await loadImage(`${origin}/logotipo_Orionix_Gol_transparente.png`);

  // ════════════════════════════════════════════════════════════════════════
  // MODO PARTIDO: si llegan home & away, dibujamos la tarjeta del partido.
  // ════════════════════════════════════════════════════════════════════════
  const home = searchParams.get('home');
  const away = searchParams.get('away');

  if (home && away) {
    const hc = searchParams.get('hc') ?? home;
    const ac = searchParams.get('ac') ?? away;
    const hf = searchParams.get('hf');
    const af = searchParams.get('af');
    const hs = searchParams.get('hs');
    const as = searchParams.get('as');
    const st = searchParams.get('st') ?? 'SCHEDULED';
    const m = MATCH_COPY[locale];

    const [homeFlag, awayFlag] = await Promise.all([
      hf ? loadImage(hf) : Promise.resolve(''),
      af ? loadImage(af) : Promise.resolve(''),
    ]);

    const hasScore = hs !== null && as !== null && st !== 'SCHEDULED';
    const S = st === 'LIVE'
      ? { c: '#f87171', bg: 'rgba(248,113,113,0.12)', b: 'rgba(248,113,113,0.30)', label: m.live }
      : st === 'FINISHED'
        ? { c: '#fbbf24', bg: 'rgba(251,191,36,0.12)', b: 'rgba(251,191,36,0.30)', label: m.final }
        : { c: '#22d3ee', bg: 'rgba(34,211,238,0.12)', b: 'rgba(34,211,238,0.30)', label: m.soon };

    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #020810 0%, #010610 40%, #02091a 70%, #010508 100%)', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>
          <Background />
          <Header logoSrc={logoSrc} />

          {/* ════ Partido ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 6 }}>
            {/* Badge de estado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 20px', borderRadius: 20, background: S.bg, border: `1px solid ${S.b}`, marginBottom: 18 }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: S.c, display: 'flex', boxShadow: `0 0 10px ${S.c}` }} />
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.22em', color: S.c }}>{S.label}</span>
            </div>

            {/* Equipos + marcador */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <TeamBlock flag={homeFlag} code={hc} name={home} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, marginTop: -36 }}>
                {hasScore ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 104, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-4px', textShadow: '0 0 45px rgba(34,211,238,0.45)' }}>{hs}</span>
                    <span style={{ fontSize: 64, fontWeight: 900, color: '#22d3ee', lineHeight: 1 }}>-</span>
                    <span style={{ fontSize: 104, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-4px', textShadow: '0 0 45px rgba(34,211,238,0.45)' }}>{as}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 90, fontWeight: 900, color: '#22d3ee', lineHeight: 1, letterSpacing: '-2px', textShadow: '0 0 45px rgba(34,211,238,0.65), 0 0 90px rgba(34,211,238,0.30)' }}>VS</span>
                )}
              </div>

              <TeamBlock flag={awayFlag} code={ac} name={away} />
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 30, padding: '11px 26px', borderRadius: 24, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>{m.cta}</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MODO GENÉRICO (marca): banner del torneo. Es el que ya existía.
  // ════════════════════════════════════════════════════════════════════════
  const c = COPY[locale];

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #020810 0%, #010610 40%, #02091a 70%, #010508 100%)', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>
        <Background />
        <Header logoSrc={logoSrc} />

        {/* ════ HÉROE: MUNDIAL 2026 + tagline ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ width: 52, height: 3, borderRadius: 2, marginBottom: 14, background: 'linear-gradient(90deg, #22d3ee, rgba(34,211,238,0.20))', display: 'flex' }} />
          <span style={{ fontSize: 90, fontWeight: 900, color: 'white', letterSpacing: '-5px', lineHeight: 1, textShadow: '0 4px 50px rgba(255,255,255,0.08)' }}>MUNDIAL</span>
          <span style={{ fontSize: 112, fontWeight: 900, letterSpacing: '-7px', lineHeight: 1, color: '#22d3ee', textShadow: '0 0 45px rgba(34,211,238,0.85), 0 0 90px rgba(34,211,238,0.45), 0 0 160px rgba(34,211,238,0.18)' }}>2026</span>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.32em', color: 'rgba(148,163,184,0.55)', marginTop: 20 }}>{c.tagline}</span>
        </div>

        {/* ════ BOTTOM: 3 cards en fila ════ */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', padding: '0 56px 38px' }}>
          {/* Card 1 — cyan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 16, flex: 1, background: 'linear-gradient(145deg, rgba(34,211,238,0.09), rgba(1,4,14,0.90))', border: '1px solid rgba(34,211,238,0.22)', boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,211,238,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.55), transparent)', display: 'flex' }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(34,211,238,0.10)', border: '1px solid rgba(34,211,238,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,211,238,0.28)' }}>
              <IconTarget color="#22d3ee" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'rgba(34,211,238,0.60)' }}>{c.card1Label}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#22d3ee', lineHeight: 1, textShadow: '0 0 16px rgba(34,211,238,0.50)' }}>{c.card1Value}</span>
            </div>
          </div>
          {/* Card 2 — gold */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 16, flex: 1, background: 'linear-gradient(145deg, rgba(251,191,36,0.09), rgba(1,4,14,0.90))', border: '1px solid rgba(251,191,36,0.22)', boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(251,191,36,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.55), transparent)', display: 'flex' }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(251,191,36,0.28)' }}>
              <IconAward color="#fbbf24" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'rgba(251,191,36,0.60)' }}>{c.card2Label}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24', lineHeight: 1, textShadow: '0 0 16px rgba(251,191,36,0.50)' }}>{c.card2Value}</span>
            </div>
          </div>
          {/* Card 3 — emerald */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 16, flex: 1, background: 'linear-gradient(145deg, rgba(52,211,153,0.09), rgba(1,4,14,0.90))', border: '1px solid rgba(52,211,153,0.22)', boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(52,211,153,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.55), transparent)', display: 'flex' }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(52,211,153,0.28)' }}>
              <IconTrending color="#34d399" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', color: 'rgba(52,211,153,0.60)' }}>{c.card3Label}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#34d399', lineHeight: 1, textShadow: '0 0 16px rgba(52,211,153,0.50)' }}>{c.card3Value}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
