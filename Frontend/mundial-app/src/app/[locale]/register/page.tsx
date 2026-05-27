'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

/* ─── Floating neon particle ─── */
const Particle = ({ index }: { index: number }) => {
  const x = (index * 137.508) % 100;
  const size = 1.5 + (index % 3);
  const delay = (index * 0.28) % 6;
  const duration = 8 + (index % 6);
  const cols: [string, string][] = [
    [alphaOf('green', 0.9),          `0 0 10px ${alphaOf('green', 1)},0 0 24px ${alphaOf('green', 0.5)}`],
    [alpha(hex.green.hover, 0.9),    `0 0 10px ${alpha(hex.green.hover, 1)},0 0 24px ${alpha(hex.green.hover, 0.5)}`],
    [alpha(hex.green.soft, 0.8),      `0 0 8px ${alpha(hex.green.soft, 1)},0 0 20px ${alpha(hex.green.soft, 0.4)}`],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -8, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(380 + (index % 160))], x: [0, Math.sin(index * 1.3) * 50], opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

const PARTICLES = Array.from({ length: 22 });

interface Field {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Pre-computed input style fragments ──────────────────────────────────────
  const inputFocusBg     = alphaOf('green', 0.06);
  const inputFocusBorder = `1px solid ${alphaOf('green', 0.45)}`;
  const inputFocusShadow = `0 0 0 3px ${alphaOf('green', 0.08)}`;
  const inputBlurBg      = alpha(hex.neutral.white, 0.04);
  const inputBlurBorder  = `1px solid ${alpha(hex.neutral.white, 0.08)}`;
  const labelFocusColor  = alphaOf('green', 0.90);
  const iconFocusColor   = alphaOf('green', 0.80);

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) router.replace('/');
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 5) {
      setError('La contraseña debe tener al menos 5 caracteres.');
      return;
    }
    if (form.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    });

    if (result.ok) {
      setSuccess(true);
      if (!result.emailVerificationRequired) {
        setTimeout(() => router.replace('/'), 1200);
      }
    } else {
      setError(result.message || 'No se pudo crear la cuenta. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const fields: Field[] = [
    {
      id: 'firstName',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Tu nombre',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'lastName',
      label: 'Apellido',
      type: 'text',
      placeholder: 'Tu apellido',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'username',
      label: 'Usuario',
      type: 'text',
      placeholder: 'nombre_usuario',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20a6 6 0 0 0-12 0" /><circle cx="12" cy="10" r="4" /><path d="M22 20h-4M2 20h4" />
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'tu@email.com',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      id: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: 'Mínimo 5 caracteres',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      id: 'confirmPassword',
      label: 'Confirmar contraseña',
      type: 'password',
      placeholder: 'Repite tu contraseña',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 25% 60%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 45%, ${hex.bg.primary} 100%)` }}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((_, i) => <Particle key={i} index={i} />)}
      </div>

      {/* Ambient orbs */}
      <div className="absolute top-[-15%] right-[-5%] w-[38vw] h-[38vw] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${alpha(hex.green.hover, 0.09)} 0%, transparent 70%)`, filter: 'blur(55px)' }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[32vw] h-[32vw] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${alpha(hex.green.base, 0.07)} 0%, transparent 70%)`, filter: 'blur(50px)' }} />

      {/* Aurora slash 1 */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '-40%', left: '-20%', width: '65%', height: '200%',
          background: `linear-gradient(105deg, transparent 0%, ${alpha(hex.green.hover, 0.03)} 40%, ${alphaOf('green', 0.055)} 55%, transparent 100%)`,
          transform: 'skewX(-18deg)',
        }}
        animate={{ x: ['-10%', '110%'], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatDelay: 14, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '-40%', left: '-20%', width: '55%', height: '200%',
          background: `linear-gradient(105deg, transparent 0%, ${alpha(hex.green.base, 0.025)} 40%, ${alpha(hex.green.hover, 0.04)} 55%, transparent 100%)`,
          transform: 'skewX(-18deg)',
        }}
        animate={{ x: ['-10%', '120%'], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatDelay: 20, delay: 7, ease: 'easeInOut' }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full mx-4"
        style={{ maxWidth: 520 }}
      >
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] rounded-2xl pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${alphaOf('green', 0.5)} 20%, transparent 40%, ${alpha(hex.green.hover, 0.4)} 60%, transparent 80%)`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[1px] rounded-2xl"
            style={{ background: `linear-gradient(145deg, ${hex.bg.primary}, ${hex.bg.secondary})` }} />
        </div>

        <div
          className="relative rounded-2xl p-8"
          style={{
            background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.97)}, ${alpha(hex.bg.secondary, 0.95)})`,
            border: `1px solid ${alphaOf('green', 0.14)}`,
            boxShadow: `0 24px 64px ${alpha(hex.neutral.black, 0.55)}, inset 0 1px 0 ${alpha(hex.neutral.white, 0.04)}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${hex.bg.secondary}, ${hex.bg.soft})`, border: `1px solid ${alphaOf('green', 0.20)}` }}>
              <Image src="/logotipo_Orionix_Gol_transparente.png" alt="Orionix" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.01em' }}>
                Crear cuenta
              </h1>
              <p className="text-xs mt-0.5 text-orionix-text-muted">Únete y comienza a predecir</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: alpha(hex.gold.base, 0.10), color: hex.gold.base, border: `1px solid ${alpha(hex.gold.base, 0.25)}` }}>
              BETA
            </span>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2"
                style={{ background: alpha(hex.green.hover, 0.10), border: `1px solid ${alpha(hex.green.hover, 0.25)}`, color: hex.green.bright }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ¡Cuenta creada! Revisa tu correo (incluso la carpeta de spam) y haz clic en el enlace para activarla.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Two-column row for name */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {fields.slice(0, 2).map(f => (
                <div key={f.id}>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5"
                    style={{ color: focused === f.id ? labelFocusColor : 'rgba(148,163,184,0.7)' }}>
                    {f.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: focused === f.id ? iconFocusColor : 'rgba(100,116,139,0.7)' }}>
                      {f.icon}
                    </span>
                    <input
                      name={f.id}
                      type={f.type}
                      value={form[f.id as keyof typeof form]}
                      onChange={handleChange}
                      onFocus={() => setFocused(f.id)}
                      onBlur={() => setFocused(null)}
                      placeholder={f.placeholder}
                      required
                      autoComplete="off"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-orionix-text-muted transition-all duration-200"
                      style={{
                        background: focused === f.id ? inputFocusBg : inputBlurBg,
                        border: focused === f.id ? inputFocusBorder : inputBlurBorder,
                        outline: 'none',
                        boxShadow: focused === f.id ? inputFocusShadow : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Remaining fields */}
            {fields.slice(2).map(f => (
              <div key={f.id} className="mb-3">
                <label className="block text-[10px] font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: focused === f.id ? labelFocusColor : 'rgba(148,163,184,0.7)' }}>
                  {f.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: focused === f.id ? iconFocusColor : hex.text.muted }}>
                    {f.icon}
                  </span>
                  <input
                    name={f.id}
                    type={f.type}
                    value={form[f.id as keyof typeof form]}
                    onChange={handleChange}
                    onFocus={() => setFocused(f.id)}
                    onBlur={() => setFocused(null)}
                    placeholder={f.placeholder}
                    required
                    autoComplete={f.type === 'password' ? 'new-password' : 'off'}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-orionix-text-muted transition-all duration-200"
                    style={{
                      background: focused === f.id ? inputFocusBg : inputBlurBg,
                      border: focused === f.id ? inputFocusBorder : inputBlurBorder,
                      outline: 'none',
                      boxShadow: focused === f.id ? inputFocusShadow : 'none',
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading || success}
              className="w-full mt-2 py-3 rounded-xl font-bold text-sm tracking-widest uppercase relative overflow-hidden"
              style={{
                background: isLoading || success
                  ? alphaOf('green', 0.30)
                  : `linear-gradient(90deg, ${hex.green.dark} 0%, ${hex.green.hover} 100%)`,
                color: '#ffffff',
                border: 'none',
                cursor: isLoading || success ? 'not-allowed' : 'pointer',
                boxShadow: isLoading || success ? 'none' : `0 6px 28px ${alphaOf('green', 0.35)}`,
                letterSpacing: '0.15em',
              }}
              whileHover={!isLoading && !success ? { scale: 1.015 } : {}}
              whileTap={!isLoading && !success ? { scale: 0.985 } : {}}
            >
              {/* Shimmer */}
              {!isLoading && !success && (
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent 0%, ${alpha(hex.neutral.white, 0.18)} 50%, transparent 100%)` }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                />
              )}
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Creando cuenta...
                </span>
              ) : success ? (
                '¡Listo!'
              ) : (
                'Crear cuenta →'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-5 pt-4 flex items-center justify-center"
            style={{ borderTop: `1px solid ${alpha(hex.neutral.white, 0.06)}` }}>
            <span className="text-xs text-orionix-text-muted">¿Ya tienes cuenta?</span>
            <button
              onClick={() => router.push('/login')}
              className="ml-1.5 text-xs font-semibold transition-colors duration-200 flex items-center gap-1"
              style={{ color: alphaOf('green', 0.85) }}
            >
              Inicia sesión
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-center text-[10px] mt-4 text-orionix-text-muted">
            © 2026 MUNDIAL APP — TODOS LOS DERECHOS RESERVADOS
          </p>
        </div>
      </motion.div>
    </div>
  );
}
