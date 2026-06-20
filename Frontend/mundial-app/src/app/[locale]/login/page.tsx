'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useCountdown } from '@/hooks/useCountdown';
import LoginBackground from './_components/LoginBackground';
import LoginHero from './_components/LoginHero';
import LoginCard from './_components/LoginCard';
import ForgotPasswordModal from './_components/ForgotPasswordModal';
import { apiFetch } from '@/lib/apiFetch';
import { getPostLoginRoute } from '@/lib/postLoginRoute';

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { countdown, started } = useCountdown();

  const [showForgot, setShowForgot] = useState(false);
  const [predCount,  setPredCount]  = useState(0);

  useEffect(() => {
    // Sesión ya activa: misma regla post-login (onboarding pendiente → /onboarding)
    if (isAuthenticated && !authLoading) router.push(getPostLoginRoute(user, locale));
  }, [isAuthenticated, authLoading, user, locale, router]);

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  useEffect(() => {
    apiFetch('/api/v1/predictions/count')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setPredCount(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0a1a10 0%, #060d08 55%, #040a06 100%)' }}>

      <LoginBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <LoginHero countdown={countdown} predCount={predCount} started={started} />
        <LoginCard onShowForgot={() => setShowForgot(true)} />
      </div>

      <ForgotPasswordModal show={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
}
