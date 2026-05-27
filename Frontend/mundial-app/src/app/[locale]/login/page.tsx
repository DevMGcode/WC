'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { FiTarget, FiAward, FiBarChart2, FiGlobe } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

const Trophy3D = dynamic(() => import('@/components/Trophy3D'), { ssr: false });

/* ─── Fire ember particle ─── */
const Ember = ({ index }: { index: number }) => {
  const xBase   = ((index * 29) % 90) - 45;
  const size    = 1.5 + (index % 3);
  const delay   = (index * 0.2) % 3;
  const dur     = 1.3 + (index % 1.6);
  const colors  = [alpha(hex.gold.base, 1), alpha(hex.accent.orange, 0.95), alpha(hex.accent.yellow, 0.90), alpha(hex.accent.red, 0.85), alpha(hex.accent.orange, 0.95)];
  const c = colors[index % colors.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, bottom: '28%', left: `calc(50% + ${xBase}px)`, background: c, boxShadow: `0 0 ${size * 4}px ${c}`, zIndex: 8 }}
      animate={{ y: [0, -(75 + (index % 65))], x: [0, Math.sin(index * 1.9) * 20], opacity: [0, 1, 0.7, 0], scale: [0.3, 1.4, 0.5, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* ─── Fire ring expanding ─── */
const FireRing = ({ delay, size, color }: { delay: number; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, top: '50%', left: '50%', marginTop: -size / 2, marginLeft: -size / 2, border: `1.5px solid ${color}`, boxShadow: `0 0 12px ${color}` }}
    initial={{ scale: 0.3, opacity: 1 }}
    animate={{ scale: 2.6, opacity: 0 }}
    transition={{ duration: 1.6, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 4 }}
  />
);

/* ─── Floating background particle ─── */
const Particle = ({ index }: { index: number }) => {
  const x = (index * 137.508) % 100;
  const size = 1.2 + (index % 2);
  const delay = (index * 0.28) % 6;
  const duration = 9 + (index % 6);
  const cols: [string, string][] = [
    [alphaOf('green', 0.70),           `0 0 8px ${alphaOf('green', 0.80)}`],
    [alpha(hex.green.hover, 0.65),     `0 0 8px ${alpha(hex.green.hover, 0.80)}`],
    [alpha(hex.green.base, 0.60),      `0 0 7px ${alpha(hex.green.base, 0.70)}`],
    [alpha(hex.gold.base, 0.55),       `0 0 7px ${alpha(hex.gold.base, 0.70)}`],
    [alpha(hex.green.hover, 0.55),     `0 0 6px ${alpha(hex.green.hover, 0.70)}`],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -6, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(380 + (index % 180))], x: [0, Math.sin(index * 1.3) * 40], opacity: [0, 0.85, 0.6, 0], scale: [0.5, 1.2, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* ─── Countdown digit box ─── */
const CountBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <motion.div
      className="relative flex items-center justify-center rounded-xl"
      style={{ width: 58, height: 46, background: alphaOf('green', 0.06), border: `1px solid ${alphaOf('green', 0.18)}`, boxShadow: `0 0 14px ${alphaOf('green', 0.06)}` }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ boxShadow: [`0 0 8px ${alphaOf('green', 0.06)}`, `0 0 20px ${alphaOf('green', 0.16)}`, `0 0 8px ${alphaOf('green', 0.06)}`] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-lg font-black tabular-nums" style={{ color: hex.green.bright, textShadow: `0 0 18px ${alphaOf('green', 0.9)}, 0 0 40px ${alphaOf('green', 0.4)}` }}>
        {String(value).padStart(2, '0')}
      </span>
    </motion.div>
    <span className="text-[8px] font-bold tracking-[0.22em]" style={{ color: alphaOf('green', 0.32) }}>{label}</span>
  </div>
);

/* ─── Speed ray from ball center ─── */
const SpeedRay = ({ angle, index }: { angle: number; index: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: 1, height: 60 + (index % 35),
      top: '50%', left: '50%', marginLeft: -0.5,
      transformOrigin: 'bottom center',
      transform: `rotate(${angle}deg) translateY(-105px)`,
      background: `linear-gradient(to top, ${alpha(hex.gold.base, 0.65)}, transparent)`,
      filter: 'blur(0.5px)',
    }}
    animate={{ opacity: [0, 0.85, 0], scaleY: [0.3, 1, 0.3] }}
    transition={{ duration: 2, repeat: Infinity, delay: index * 0.16 + 0.4, ease: 'easeInOut' }}
  />
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [focused,   setFocused]   = useState<string | null>(null);
  const [verifiedBanner, setVerifiedBanner] = useState<'verified' | 'invalid' | null>(null);

  useEffect(() => {
    const v = searchParams.get('verified');
    const e = searchParams.get('error');
    if (v === 'true') setVerifiedBanner('verified');
    else if (e === 'invalid_token') setVerifiedBanner('invalid');
  }, [searchParams]);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [predCount, setPredCount] = useState(0);

  const [showPassword, setShowPassword] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail,    setFpEmail]    = useState('');
  const [fpLoading,  setFpLoading]  = useState(false);
  const [fpError,    setFpError]    = useState('');
  const [fpSuccess,  setFpSuccess]  = useState(false);

  /* 3D card tilt */
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX    = useMotionValue(0);
  const rawY    = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-300, 300], [10, -10]), { stiffness: 160, damping: 22 });
  const rotateY = useSpring(useTransform(rawX, [-300, 300], [-10, 10]),  { stiffness: 160, damping: 22 });
  const glowX   = useSpring(useTransform(rawX, [-300, 300], [0, 100]),   { stiffness: 160, damping: 22 });
  const glowY   = useSpring(useTransform(rawY, [-300, 300], [0, 100]),   { stiffness: 160, damping: 22 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(e.clientX - (rect.left + rect.width / 2));
    rawY.set(e.clientY - (rect.top + rect.height / 2));
  }, [rawX, rawY]);

  const handleMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

  /* countdown to World Cup 2026 opening June 11 */
  useEffect(() => {
    const target = new Date('2026-06-11T00:00:00');
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* live prediction count */
  useEffect(() => {
    fetch('/api/v1/public/predictions/count')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setPredCount(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { if (isAuthenticated && !authLoading) router.push('/'); }, [isAuthenticated, authLoading, router]);
  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Ingresa tu correo electrónico.'); return; }
    setFpLoading(true); setFpError('');
    try {
      const res  = await fetch('/api/v1/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: fpEmail.trim() }) });
      const data = await res.json();
      if (res.ok && data.success) setFpSuccess(true);
      else setFpError(data.message || 'No se pudo procesar la solicitud.');
    } catch { setFpError('Error de conexión con el servidor.'); }
    finally { setFpLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) router.push('/');
      else setError(authError || 'Credenciales incorrectas');
    } catch { setError('Error al iniciar sesión'); }
    finally { setIsLoading(false); }
  };

  // Pre-compute focus/blur style strings for inputs (reused in both fields)
  const inputFocusBg     = alphaOf('green', 0.06);
  const inputFocusBorder = `1px solid ${alphaOf('green', 0.50)}`;
  const inputFocusShadow = `0 0 22px ${alphaOf('green', 0.10)}`;
  const inputBlurBg      = alpha(hex.neutral.white, 0.025);
  const inputBlurBorder  = `1px solid ${alpha(hex.neutral.white, 0.055)}`;

  // Feature chips config (reused in mobile + desktop)
  const FEATURES_SM = [
    { icon: <FiTarget size={11} />,    label: 'Predicciones',   color: hex.green.bright, glow: alphaOf('green', 0.40),          bg: alphaOf('green', 0.08),          border: alphaOf('green', 0.20)          },
    { icon: <FiAward size={11} />,     label: 'Ligas',          color: hex.gold.base,    glow: alpha(hex.gold.base, 0.40),      bg: alpha(hex.gold.base, 0.07),      border: alpha(hex.gold.base, 0.20)      },
    { icon: <FiBarChart2 size={11} />, label: 'Estadísticas',   color: hex.green.hover,  glow: alpha(hex.green.hover, 0.40),    bg: alpha(hex.green.hover, 0.07),    border: alpha(hex.green.hover, 0.20)    },
    { icon: <FiGlobe size={11} />,     label: 'Mundial 2026',   color: hex.gold.base,    glow: alpha(hex.gold.base, 0.40),      bg: alpha(hex.gold.base, 0.07),      border: alpha(hex.gold.base, 0.20)      },
  ];
  const FEATURES_LG = [
    { icon: <FiTarget size={13} />,   label: 'Predicciones',   color: hex.green.bright, glow: alphaOf('green', 0.40),          bg: alphaOf('green', 0.08),          border: alphaOf('green', 0.20)          },
    { icon: <FiAward size={13} />,    label: 'Ligas privadas', color: hex.gold.base,    glow: alpha(hex.gold.base, 0.40),      bg: alpha(hex.gold.base, 0.07),      border: alpha(hex.gold.base, 0.20)      },
    { icon: <FiBarChart2 size={13} />,label: 'Estadísticas',   color: hex.green.hover,  glow: alpha(hex.green.hover, 0.40),    bg: alpha(hex.green.hover, 0.07),    border: alpha(hex.green.hover, 0.20)    },
    { icon: <FiGlobe size={13} />,    label: 'Mundial 2026',   color: hex.gold.base,    glow: alpha(hex.gold.base, 0.40),      bg: alpha(hex.gold.base, 0.07),      border: alpha(hex.gold.base, 0.20)      },
  ];

  return (
    <div
      className="relative w-full min-h-[100dvh] overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 28% 55%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 42%, ${hex.bg.primary} 100%)` }}
    >
      {/* ══ BACKGROUND ══════════════════════════════════════════════ */}

      {/* Stadium spotlight left */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 80% at 22% -5%, ${alpha(hex.accent.amber, 0.14)} 0%, rgba(120,53,15,0.06) 48%, transparent 72%)` }} />
      {/* Green glow right */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 45% 60% at 85% 50%, ${alpha(hex.green.hover, 0.08)} 0%, transparent 68%)` }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, ${alpha(hex.neutral.black, 0.55)} 100%)` }} />

      {/* Animated ambient orbs */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -150, background: `radial-gradient(circle, ${alpha(hex.green.hover, 0.10)} 0%, transparent 65%)`, filter: 'blur(70px)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 500, height: 500, bottom: -150, right: -120, background: `radial-gradient(circle, ${alpha(hex.green.base, 0.09)} 0%, transparent 65%)`, filter: 'blur(65px)' }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Tech grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.038]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke={hex.green.bright} strokeWidth="0.5" />
          </pattern>
          <radialGradient id="gfade" cx="30%" cy="50%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gm"><rect width="100%" height="100%" fill="url(#gfade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gm)" />
      </svg>

      {/* Aurora sweeps */}
      <motion.div className="absolute pointer-events-none inset-0"
        style={{ background: `linear-gradient(108deg, transparent 43%, ${alpha(hex.green.hover, 0.12)} 50%, ${alphaOf('green', 0.05)} 55%, transparent 62%)`, opacity: 0 }}
        animate={{ opacity: [0, 1, 0], x: ['-30%', '30%'] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 6, ease: [0.4, 0, 0.6, 1] }}
      />

      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => <Particle key={i} index={i} />)}
      </div>

      {/* ══ MAIN LAYOUT ══════════════════════════════════════════════ */}
      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-14">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ══════════════════════════════════════════════════════════
              MOBILE / TABLET HEADER  (hidden on lg+)
          ══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex lg:hidden flex-col items-center gap-4 w-full pt-2"
          >
            {/* Logo + title */}
            <div className="flex items-center gap-4">
              <motion.div
                className="relative shrink-0"
                style={{ width: 52, height: 52 }}
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image src="/Logo_Pestaña.png" alt="Orionix Gol" fill sizes="52px" style={{ objectFit: 'contain', filter: `drop-shadow(0 0 14px ${alpha(hex.gold.base, 0.85)}) drop-shadow(0 0 30px ${alpha(hex.accent.orange, 0.45)})` }} />
              </motion.div>
              <div className="leading-none">
                <div className="text-[2rem] font-black tracking-tight text-white leading-none"
                  style={{ textShadow: `0 0 24px ${alpha(hex.neutral.white, 0.15)}` }}>
                  MUNDIAL
                </div>
                <div className="text-[2rem] font-black tracking-tight leading-none"
                  style={{ color: hex.green.bright, textShadow: `0 0 22px ${alphaOf('green', 0.75)}` }}>
                  2026
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="flex items-center gap-2">
              <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.55)})` }} />
              <p className="text-[9px] font-bold tracking-[0.30em] uppercase" style={{ color: alphaOf('green', 0.45) }}>
                Football Tech Experience
              </p>
              <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.55)}, transparent)` }} />
            </div>

            {/* Feature chips — mobile */}
            <div className="flex flex-wrap justify-center gap-2">
              {FEATURES_SM.map(({ icon, label, color, glow, bg, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full select-none"
                  style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(12px)' }}
                >
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-md pointer-events-none"
                      style={{ background: glow, filter: 'blur(6px)', opacity: 0.25, transform: 'scale(1.2)' }} />
                    <motion.div
                      className="relative w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.85)})`, border: `1px solid ${color}35` }}
                      animate={{ boxShadow: [`0 0 5px ${color}12`, `0 0 13px ${color}35`, `0 0 5px ${color}12`] }}
                      transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <div className="absolute inset-0 rounded-md pointer-events-none"
                        style={{ background: `linear-gradient(130deg, ${alpha(hex.neutral.white, 0.10)} 0%, transparent 65%)` }} />
                      <div className="absolute inset-x-0 top-0 h-px rounded-md pointer-events-none"
                        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
                      <span style={{ color, filter: `drop-shadow(0 0 3px ${color})` }}>{icon}</span>
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-md pointer-events-none"
                      style={{ border: `1px solid ${color}28` }}
                      animate={{ opacity: [0, 0.8, 0], scale: [1, 1.55, 1] }}
                      transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.6 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: alpha(hex.accent.slateLight, 0.85) }}>{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════
              LEFT HERO
          ══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -55 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-1 flex-col items-center gap-4"
          >

            {/* ── Title ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.85 }}
              className="flex items-center gap-5"
            >
              <motion.div
                className="relative shrink-0"
                style={{ width: 80, height: 80 }}
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image src="/Logo_Pestaña.png" alt="Orionix Gol" fill sizes="52px" style={{ objectFit: 'contain', filter: `drop-shadow(0 0 18px ${alpha(hex.gold.base, 0.90)}) drop-shadow(0 0 40px ${alpha(hex.accent.orange, 0.55)})` }} />
              </motion.div>

              <div className="leading-none">
                <div className="text-[3.2rem] font-black tracking-tight text-white leading-none"
                  style={{ textShadow: `0 0 30px ${alpha(hex.neutral.white, 0.18)}, 0 0 60px ${alphaOf('green', 0.12)}` }}>
                  MUNDIAL
                </div>
                <div className="text-[3.2rem] font-black tracking-tight leading-none"
                  style={{ color: hex.green.bright, textShadow: `0 0 28px ${alphaOf('green', 0.80)}, 0 0 60px ${alphaOf('green', 0.35)}` }}>
                  2026
                </div>
              </div>
            </motion.div>

            {/* Tagline — letter by letter */}
            <div className="flex items-center gap-3">
              <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
                style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(hex.gold.base, 0.60)})` }} />
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: alphaOf('green', 0.50) }}>
                {'FOOTBALL TECH EXPERIENCE'.split('').map((char, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.035, duration: 0.25 }}>
                    {char}
                  </motion.span>
                ))}
              </p>
              <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
                style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${alpha(hex.gold.base, 0.60)}, transparent)` }} />
            </div>

            {/* ── Trophy 3D Scene ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center w-full"
              style={{ height: 480 }}
            >
              {/* Amber glow halo — behind canvas */}
              <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{ width: 300, height: 300, top: '50%', left: '50%', marginTop: -150, marginLeft: -150, background: `radial-gradient(circle, ${alpha(hex.gold.base, 0.18)} 0%, ${alpha(hex.accent.orange, 0.08)} 45%, transparent 70%)`, filter: 'blur(36px)', zIndex: 0 }}
                animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* 3D Trophy model */}
              <div className="absolute inset-0" style={{ zIndex: 1 }}>
                {/* Glow rim pulsante */}
                <motion.div
                  className="absolute -inset-[3px] rounded-2xl pointer-events-none"
                  style={{ border: `1px solid ${alphaOf('green', 0.14)}` }}
                  animate={{ boxShadow: [
                    `0 0 18px ${alphaOf('green', 0.12)}, 0 0 40px ${alpha(hex.gold.base, 0.06)}`,
                    `0 0 36px ${alphaOf('green', 0.28)}, 0 0 70px ${alpha(hex.gold.base, 0.14)}`,
                    `0 0 18px ${alphaOf('green', 0.12)}, 0 0 40px ${alpha(hex.gold.base, 0.06)}`,
                  ]}}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Trophy3D />
              </div>

              {/* Fire rings overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                <FireRing delay={0.8} size={220} color={alpha(hex.gold.base, 0.50)} />
                <FireRing delay={1.8} size={220} color={alpha(hex.accent.orange, 0.32)} />
              </div>

              {/* Embers */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
                {Array.from({ length: 12 }).map((_, i) => <Ember key={i} index={i} />)}
              </div>
            </motion.div>

            {/* ── Countdown below stadium ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-[8px] font-bold tracking-[0.32em] uppercase" style={{ color: alpha(hex.gold.base, 0.42) }}>
                ⚡ Faltan para el Mundial
              </p>
              <div className="flex items-end gap-2">
                <CountBox value={countdown.days}    label="DÍAS" />
                <span className="text-lg font-black mb-5" style={{ color: alphaOf('green', 0.35) }}>:</span>
                <CountBox value={countdown.hours}   label="HRS" />
                <span className="text-lg font-black mb-5" style={{ color: alphaOf('green', 0.35) }}>:</span>
                <CountBox value={countdown.minutes} label="MIN" />
                <span className="text-lg font-black mb-5" style={{ color: alphaOf('green', 0.35) }}>:</span>
                <CountBox value={countdown.seconds} label="SEG" />
              </div>
              {predCount > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                  className="flex items-center gap-1.5">
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: hex.green.bright }}
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  <span className="text-[9px] font-semibold tracking-wider" style={{ color: alpha(hex.green.hover, 0.50) }}>
                    {predCount.toLocaleString()} predicciones realizadas
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* ── Feature chips — desktop ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {FEATURES_LG.map(({ icon, label, color, glow, bg, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 + i * 0.09, duration: 0.5 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full select-none"
                  style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(12px)' }}
                >
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{ background: glow, filter: 'blur(8px)', opacity: 0.25, transform: 'scale(1.2)' }} />
                    <motion.div
                      className="relative w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(145deg, ${bg}, ${alpha(hex.bg.primary, 0.85)})`,
                        border: `1px solid ${color}35`,
                      }}
                      animate={{ boxShadow: [`0 0 6px ${color}15`, `0 0 16px ${color}38`, `0 0 6px ${color}15`] }}
                      transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <div className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{ background: `linear-gradient(130deg, ${alpha(hex.neutral.white, 0.10)} 0%, ${alpha(hex.neutral.white, 0.04)} 40%, transparent 65%)` }} />
                      <div className="absolute inset-x-0 top-0 h-px rounded-lg pointer-events-none"
                        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
                      <span style={{ color, filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}60)` }}>
                        {icon}
                      </span>
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{ border: `1px solid ${color}28` }}
                      animate={{ opacity: [0, 0.8, 0], scale: [1, 1.55, 1] }}
                      transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.6 }}
                    />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: alpha(hex.accent.slateLight, 0.88) }}>{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT LOGIN CARD
          ══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 55, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="w-full max-w-md"
            style={{ perspective: '1400px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              ref={cardRef}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              {/* Rotating laser border — conic gradient */}
              <div className="absolute -inset-[1.5px] rounded-3xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute"
                  style={{
                    width: '200%', height: '200%',
                    top: '-50%', left: '-50%',
                    transformOrigin: '50% 50%',
                    background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 310deg, ${alphaOf('green', 0.35)} 328deg, ${alpha(hex.green.hover, 0.90)} 343deg, ${hex.neutral.white} 349deg, ${alpha(hex.green.hover, 0.90)} 355deg, transparent 360deg)`,
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Mouse-tracking inner glow */}
              <motion.div
                className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-30"
                style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${alphaOf('green', 0.55)} 0%, transparent 58%)`) }}
              />

              {/* Card surface */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{ background: `linear-gradient(155deg, ${alpha(hex.bg.primary, 0.99)} 0%, ${alpha(hex.bg.secondary, 0.97)} 50%, ${alpha(hex.bg.primary, 0.99)} 100%)`, backdropFilter: 'blur(48px)', boxShadow: `0 50px 100px ${alpha(hex.neutral.black, 0.90)}, 0 0 60px ${alphaOf('green', 0.05)}, inset 0 1px 0 ${alphaOf('green', 0.12)}` }}
              >
                {/* Top edge glow */}
                <div className="absolute top-0 left-8 right-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.75)}, ${alpha(hex.green.hover, 0.45)}, transparent)` }} />
                {/* Bottom edge glow */}
                <div className="absolute bottom-0 left-12 right-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.30)}, transparent)` }} />
                {/* Corner glows */}
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 0%, ${alphaOf('green', 0.09)} 0%, transparent 60%)` }} />
                <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 100%, ${alphaOf('green', 0.07)} 0%, transparent 60%)` }} />

                <div className="relative px-9 py-9">

                  {/* Card header */}
                  <div className="flex items-center gap-4 mb-9">
                    <motion.div
                      className="relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${alphaOf('green', 0.15)}, ${alpha(hex.green.hover, 0.10)})`, border: `1px solid ${alphaOf('green', 0.35)}`, boxShadow: `0 0 20px ${alphaOf('green', 0.10)}` }}
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    >
                      <div className="w-9 h-9 relative">
                        <Image src="/logotipo_Orionix_Gol_transparente.png" alt="logo" fill sizes="36px" style={{ objectFit: 'contain' }} />
                      </div>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-[1.75rem] font-black text-white tracking-tight leading-none mb-1">Inicia Sesión</h2>
                      <p className="text-xs tracking-wide text-orionix-text-muted">Accede y comienza a predecir</p>
                    </div>

                    <motion.div
                      className="px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shrink-0"
                      style={{ background: alphaOf('green', 0.08), border: `1px solid ${alphaOf('green', 0.28)}`, color: hex.green.soft }}
                      animate={{ boxShadow: [`0 0 8px ${alphaOf('green', 0.08)}`, `0 0 18px ${alphaOf('green', 0.22)}`, `0 0 8px ${alphaOf('green', 0.08)}`] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      BETA
                    </motion.div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key="err"
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-red-300 text-xs font-medium border"
                        style={{ background: alpha(hex.accent.red, 0.06), borderColor: alpha(hex.accent.red, 0.25) }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email verification banner */}
                    {verifiedBanner === 'verified' && (
                      <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                        style={{ background: alpha(hex.accent.emerald, 0.10), border: `1px solid ${alpha(hex.accent.emerald, 0.30)}`, color: hex.green.hover }}>
                        ✓ Email verificado exitosamente. Ya puedes iniciar sesión.
                      </div>
                    )}
                    {verifiedBanner === 'invalid' && (
                      <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                        style={{ background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.30)}`, color: hex.accent.redSoft }}>
                        ✗ El enlace de verificación es inválido o ya fue usado.
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label htmlFor="login-email" className="block text-[10px] font-semibold tracking-widest uppercase mb-2 transition-colors duration-200"
                        style={{ color: focused === 'email' ? hex.green.bright : alpha(hex.accent.slate, 0.7) }}>Email</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                          style={{ color: focused === 'email' ? hex.green.bright : alpha(hex.accent.slateDeep, 0.6) }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </span>
                        <input
                          id="login-email"
                          type="email" value={email} onChange={e => setEmail(e.target.value)}
                          onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                          placeholder="tu@email.com" required
                          autoComplete="email"
                          className="w-full pl-10 pr-4 py-4 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-300"
                          style={{ background: focused === 'email' ? inputFocusBg : inputBlurBg, border: focused === 'email' ? inputFocusBorder : inputBlurBorder, boxShadow: focused === 'email' ? inputFocusShadow : 'none' }}
                        />
                        {focused === 'email' && (
                          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute bottom-px left-10 right-4 h-px"
                            style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.85)}, transparent)`, transformOrigin: 'left' }} />
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="login-password" className="block text-[10px] font-semibold tracking-widest uppercase mb-2 transition-colors duration-200"
                        style={{ color: focused === 'password' ? hex.green.bright : alpha(hex.accent.slate, 0.7) }}>Contraseña</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                          style={{ color: focused === 'password' ? hex.green.bright : alpha(hex.accent.slateDeep, 0.6) }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                          placeholder="••••••••" required
                          autoComplete="current-password"
                          className="w-full pl-10 pr-11 py-4 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-300"
                          style={{ background: focused === 'password' ? inputFocusBg : inputBlurBg, border: focused === 'password' ? inputFocusBorder : inputBlurBorder, boxShadow: focused === 'password' ? inputFocusShadow : 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          tabIndex={-1}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 opacity-60 hover:opacity-100"
                          style={{ color: showPassword ? hex.green.bright : alpha(hex.accent.slate, 0.8) }}
                        >
                          {showPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                        {focused === 'password' && (
                          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute bottom-px left-10 right-4 h-px"
                            style={{ background: `linear-gradient(90deg, ${alphaOf('green', 0.85)}, transparent)`, transformOrigin: 'left' }} />
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <motion.button
                        type="submit" disabled={isLoading}
                        className="relative w-full py-4 rounded-xl font-black text-sm tracking-[0.14em] uppercase overflow-hidden text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02, boxShadow: `0 16px 50px ${alphaOf('green', 0.55)}` }}
                        whileTap={{ scale: 0.975 }}
                        style={{ background: `linear-gradient(135deg, ${hex.green.dark} 0%, ${hex.green.base} 40%, ${hex.green.hover} 70%, ${hex.green.dark} 100%)`, boxShadow: `0 8px 32px ${alphaOf('green', 0.36)}` }}
                      >
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.20)} 50%, transparent 72%)` }}
                          animate={{ x: ['-120%', '120%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                        />
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.28)}, transparent)` }} />
                        <span className="relative flex items-center justify-center gap-2.5">
                          {isLoading ? (
                            <>
                              <motion.span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white inline-block" animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }} />
                              Accediendo...
                            </>
                          ) : (
                            <>
                              Iniciar Sesión
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </form>

                  {/* Footer links */}
                  <div className="mt-7 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setFpEmail(''); setFpError(''); setFpSuccess(false); }}
                      className="text-xs transition-colors duration-200 text-orionix-text-muted"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      className="text-xs font-semibold transition-colors duration-200 flex items-center gap-1"
                      style={{ color: alphaOf('green', 0.85) }}
                    >
                      Crear cuenta
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-7 pt-5 border-t text-center" style={{ borderColor: alpha(hex.neutral.white, 0.04) }}>
                    <p className="text-[10px] tracking-widest uppercase text-orionix-text-muted">
                      © 2026 ORIONIX GOL — TODOS LOS DERECHOS RESERVADOS
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* ══ FORGOT PASSWORD MODAL ══════════════════════════════════ */}
      <AnimatePresence>
        {showForgot && (
          <>
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: alpha(hex.neutral.black, 0.75), backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !fpLoading && setShowForgot(false)}
            />
            <motion.div
              className="fixed z-50 w-full px-4"
              style={{ top: '50%', left: '50%', maxWidth: 420, translateX: '-50%', translateY: '-50%' }}
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <div className="rounded-2xl p-6" style={{ background: `linear-gradient(145deg, ${alpha(hex.accent.navyCard, 0.99)}, ${alpha(hex.accent.navyCardMid, 0.97)})`, border: `1px solid ${alphaOf('green', 0.18)}`, boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.75)}` }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-white">Recuperar contraseña</h2>
                    <p className="text-xs mt-0.5 text-orionix-text-muted">Te enviamos una contraseña temporal al correo</p>
                  </div>
                  <button onClick={() => setShowForgot(false)} disabled={fpLoading} className="transition-colors text-orionix-text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                {fpSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: alphaOf('green', 0.10), border: `1px solid ${alphaOf('green', 0.30)}`, boxShadow: `0 0 24px ${alphaOf('green', 0.15)}` }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hex.green.bright} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-semibold mb-1 text-orionix-green-soft">¡Correo enviado!</p>
                    <p className="text-xs text-orionix-text-muted">Revisa tu bandeja de entrada e inicia sesión con la contraseña temporal.</p>
                    <button onClick={() => setShowForgot(false)} className="mt-5 px-6 py-2 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.base})`, boxShadow: `0 4px 16px ${alphaOf('green', 0.25)}` }}>
                      Entendido
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <AnimatePresence>
                      {fpError && (
                        <motion.p key="fpe" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-xs px-3 py-2 rounded-lg" style={{ background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.22)}`, color: hex.accent.redSoft }}>
                          {fpError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <div>
                      <label htmlFor="fp-email" className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5 text-orionix-text-muted">Correo de tu cuenta</label>
                      <input id="fp-email" type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="tu@email.com" required autoFocus
                        autoComplete="email"
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-orionix-text-muted outline-none transition-all duration-200"
                        style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.10)}` }}
                        onFocus={e => { e.currentTarget.style.border = `1px solid ${alphaOf('green', 0.40)}`; e.currentTarget.style.background = alphaOf('green', 0.05); }}
                        onBlur={e => { e.currentTarget.style.border = `1px solid ${alpha(hex.neutral.white, 0.10)}`; e.currentTarget.style.background = alpha(hex.neutral.white, 0.04); }}
                      />
                    </div>
                    <button type="submit" disabled={fpLoading} className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase overflow-hidden relative"
                      style={{ background: fpLoading ? alpha(hex.green.hover, 0.28) : `linear-gradient(90deg, ${hex.green.dark}, ${hex.green.base})`, color: '#fff', cursor: fpLoading ? 'not-allowed' : 'pointer', boxShadow: fpLoading ? 'none' : `0 6px 24px ${alphaOf('green', 0.28)}` }}>
                      {fpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          Enviar contraseña temporal
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
