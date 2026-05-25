'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    document.body.classList.add('login-route');

    return () => {
      document.body.classList.remove('login-route');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Redirigir a home
        router.push('/');
      } else {
        setError(authError || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100dvh+5rem)] md:min-h-[calc(100vh+5rem)] overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* 3D Background Effect - Efecto animado de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Elemento 1 - Superior izquierda */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '-100px', left: '-100px' }}
        />

        {/* Elemento 2 - Centro */}
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl"
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '300px', right: '-100px' }}
        />

        {/* Elemento 3 - Inferior derecha */}
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 50, -50, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '-100px', left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Contenido */}
      <div className="relative z-10 w-full min-h-[calc(100dvh+5rem)] md:min-h-[calc(100vh+5rem)] flex items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
              MUNDIAL 2026
            </h1>
            <p className="text-cyan-300/80 text-lg">Football Tech Experience</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-emerald-900/20 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20"
          >
            {/* Tabs para Login/Sign Up (por ahora solo login) */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white">Inicia Sesión</h2>
              <p className="text-slate-400 text-sm mt-1">Accede a tu cuenta para competir</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-2">Email</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-400/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-2">Contraseña</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-400/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Cargando...' : 'INICIA SESIÓN'}
              </motion.button>
            </form>

          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-slate-500 text-xs mt-6"
          >
            © 2026 Mundial App. Todos los derechos reservados.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
