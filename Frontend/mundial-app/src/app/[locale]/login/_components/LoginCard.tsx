'use client';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';
import { getPostLoginRoute } from '@/lib/postLoginRoute';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface LoginCardProps { onShowForgot: () => void; }

export default function LoginCard({ onShowForgot }: LoginCardProps) {
  const t           = useTranslations();
  const locale      = useLocale();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { login, loading: authLoading, error: authError } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused,      setFocused]      = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');

  // Viniendo del registro: prellenar el EMAIL (la credencial real de login).
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('prefill_login_email');
      if (saved) {
        setEmail(saved);
        sessionStorage.removeItem('prefill_login_email');
      }
    } catch { /* storage bloqueado */ }
  }, []);

  const verifiedBanner = useMemo(() => {
    const v = searchParams.get('verified');
    const e = searchParams.get('error');
    if (v === 'true') return 'verified' as const;
    if (e === 'invalid_token') return 'invalid' as const;
    return null;
  }, [searchParams]);

  /* 3D card tilt */
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX    = useMotionValue(0);
  const rawY    = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-300, 300], [10, -10]),   { stiffness: 160, damping: 22 });
  const rotateY = useSpring(useTransform(rawX, [-300, 300], [-10, 10]),   { stiffness: 160, damping: 22 });
  const glowX   = useSpring(useTransform(rawX, [-300, 300], [0, 100]),    { stiffness: 160, damping: 22 });
  const glowY   = useSpring(useTransform(rawY, [-300, 300], [0, 100]),    { stiffness: 160, damping: 22 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(e.clientX - (rect.left + rect.width  / 2));
    rawY.set(e.clientY - (rect.top  + rect.height / 2));
  }, [rawX, rawY]);

  const handleMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const ok = await login(email, password);
      // Primera vez (onboardingCompleted=false) → /onboarding; si no, home
      // en el idioma que el usuario guardó en su perfil.
      if (ok) router.push(getPostLoginRoute(authService.getUser(), locale));
      else setError(authError || t('auth.invalidCredentials'));
    } catch { setError(t('auth.loginError')); }
    finally { setIsLoading(false); }
  };

  /* Input styles pre-computed */
  const inputFocusBg     = alphaOf('green', 0.06);
  const inputFocusBorder = `1px solid ${alphaOf('green', 0.50)}`;
  const inputFocusShadow = `0 0 22px ${alphaOf('green', 0.10)}`;
  const inputBlurBg      = alpha(hex.neutral.white, 0.025);
  const inputBlurBorder  = `1px solid ${alpha(hex.neutral.white, 0.055)}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 55, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="w-full max-w-md"
      style={{ perspective: '1400px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div ref={cardRef} style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">

        {/* Rotating laser border */}
        <div className="absolute -inset-[1.5px] rounded-3xl overflow-hidden pointer-events-none">
          <motion.div className="absolute"
            style={{
              width: '200%', height: '200%', top: '-50%', left: '-50%', transformOrigin: '50% 50%',
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 310deg, ${alphaOf('green', 0.35)} 328deg, ${alpha(hex.green.hover, 0.90)} 343deg, ${hex.neutral.white} 349deg, ${alpha(hex.green.hover, 0.90)} 355deg, transparent 360deg)`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Mouse-tracking inner glow */}
        <motion.div className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-30"
          style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${alphaOf('green', 0.55)} 0%, transparent 58%)`) }}
        />

        {/* Card surface */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(155deg, ${alpha(hex.bg.primary, 0.99)} 0%, ${alpha(hex.bg.secondary, 0.97)} 50%, ${alpha(hex.bg.primary, 0.99)} 100%)`,
            backdropFilter: 'blur(48px)',
            boxShadow: `0 50px 100px ${alpha(hex.neutral.black, 0.90)}, 0 0 60px ${alphaOf('green', 0.05)}, inset 0 1px 0 ${alphaOf('green', 0.12)}`,
          }}>
          {/* Edge glows */}
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.75)}, ${alpha(hex.green.hover, 0.45)}, transparent)` }} />
          <div className="absolute bottom-0 left-12 right-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.30)}, transparent)` }} />
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 0%, ${alphaOf('green', 0.09)} 0%, transparent 60%)` }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 100%, ${alphaOf('green', 0.07)} 0%, transparent 60%)` }} />

          <div className="relative px-5 py-7 sm:px-9 sm:py-9">

            {/* Card header — vertical centrado en mobile, horizontal desde sm: */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 mb-7 sm:mb-9 text-center sm:text-left relative">
              <motion.div
                className="relative w-28 h-28 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 sm:order-1"
                style={{ background: `linear-gradient(135deg, ${alphaOf('green', 0.12)}, ${alpha(hex.green.hover, 0.07)})`, border: `1px solid ${alphaOf('green', 0.28)}`, boxShadow: `0 0 24px ${alphaOf('green', 0.08)}` }}
                whileHover={{ scale: 1.06, rotate: 4 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
                <div className="w-24 h-24 sm:w-16 sm:h-16 relative">
                  <Image src="/logotipo_Orionix_Gol_transparente.png" alt="logo" fill sizes="96px" style={{ objectFit: 'contain' }} />
                </div>
              </motion.div>
              <div className="flex-1 min-w-0 sm:order-2">
                <h2 className="text-3xl sm:text-[1.75rem] font-black text-white tracking-tight leading-tight sm:leading-none mb-1">{t('auth.title')}</h2>
                <p className="text-xs tracking-wide text-orionix-text-muted">{t('auth.subtitle')}</p>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div key="err"
                  initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-5 px-4 py-3 rounded-xl text-red-300 text-xs font-medium border"
                  style={{ background: alpha(hex.accent.red, 0.06), borderColor: alpha(hex.accent.red, 0.25) }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Verification banners */}
              {verifiedBanner === 'verified' && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                  style={{ background: alpha(hex.accent.emerald, 0.10), border: `1px solid ${alpha(hex.accent.emerald, 0.30)}`, color: hex.green.hover }}>
                  {t('auth.verifiedSuccess')}
                </div>
              )}
              {verifiedBanner === 'invalid' && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                  style={{ background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.30)}`, color: hex.accent.redSoft }}>
                  {t('auth.verifiedInvalid')}
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
                    id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    placeholder="tu@email.com" required autoComplete="username"
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
                  style={{ color: focused === 'password' ? hex.green.bright : alpha(hex.accent.slate, 0.7) }}>{t('auth.password')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                    style={{ color: focused === 'password' ? hex.green.bright : alpha(hex.accent.slateDeep, 0.6) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="login-password" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-4 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-300"
                    style={{ background: focused === 'password' ? inputFocusBg : inputBlurBg, border: focused === 'password' ? inputFocusBorder : inputBlurBorder, boxShadow: focused === 'password' ? inputFocusShadow : 'none' }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
                    aria-label={showPassword ? t('auth.togglePasswordHide') : t('auth.togglePasswordShow')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 opacity-60 hover:opacity-100"
                    style={{ color: showPassword ? hex.green.bright : alpha(hex.accent.slate, 0.8) }}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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
                <motion.button type="submit" disabled={isLoading}
                  className="relative w-full py-4 rounded-xl font-black text-sm tracking-[0.14em] uppercase overflow-hidden text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, boxShadow: `0 16px 50px ${alphaOf('green', 0.55)}` }}
                  whileTap={{ scale: 0.975 }}
                  style={{ background: `linear-gradient(135deg, ${hex.green.dark} 0%, ${hex.green.base} 40%, ${hex.green.hover} 70%, ${hex.green.dark} 100%)`, boxShadow: `0 8px 32px ${alphaOf('green', 0.36)}` }}>
                  <motion.div className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(108deg, transparent 28%, ${alpha(hex.neutral.white, 0.20)} 50%, transparent 72%)` }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.28)}, transparent)` }} />
                  <span className="relative flex items-center justify-center gap-2.5">
                    {isLoading ? (
                      <>
                        <motion.span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white inline-block"
                          animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }} />
                        {t('auth.accessing')}
                      </>
                    ) : (
                      <>{t('auth.signInButton')}
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
            <div className="mt-6">
              <button type="button" onClick={onShowForgot}
                className="text-xs transition-colors duration-200 text-orionix-text-muted hover:text-white/70">
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* Register CTA */}
            <div className="mt-5 space-y-3">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${alpha(hex.neutral.white, 0.07)})` }} />
                <span className="text-[10px] font-semibold tracking-widest uppercase shrink-0"
                  style={{ color: alpha(hex.accent.slate, 0.40) }}>
                  ¿Primera vez aquí?
                </span>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alpha(hex.neutral.white, 0.07)}, transparent)` }} />
              </div>

              <motion.button
                onClick={() => router.push('/register')}
                whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${alpha(hex.gold.base, 0.30)}` }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl font-black text-sm tracking-[0.10em] uppercase flex items-center justify-center gap-2.5 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${alpha(hex.gold.base, 0.12)}, ${alpha(hex.gold.bright, 0.08)})`,
                  border: `1px solid ${alpha(hex.gold.base, 0.38)}`,
                  color: hex.gold.bright,
                  boxShadow: `0 0 20px ${alpha(hex.gold.base, 0.08)}`,
                }}>
                Crear cuenta
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest"
                  style={{ background: alpha(hex.gold.base, 0.20), border: `1px solid ${alpha(hex.gold.base, 0.35)}` }}>
                  GRATIS
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>

              <p className="text-center text-[10px]" style={{ color: alpha(hex.accent.slate, 0.38) }}>
                Sin tarjeta de crédito &nbsp;·&nbsp; Empieza en 30 segundos
              </p>
            </div>

            <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: alpha(hex.neutral.white, 0.04) }}>
              <p className="text-[10px] tracking-widest uppercase text-orionix-text-muted">
                {t('auth.copyright')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
