'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCountdown } from '@/hooks/useCountdown';
import LoginBackground from './_components/LoginBackground';
import LoginHero from './_components/LoginHero';
import LoginCard from './_components/LoginCard';
import ForgotPasswordModal from './_components/ForgotPasswordModal';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { countdown } = useCountdown();

  const [showForgot, setShowForgot] = useState(false);
  const [predCount,  setPredCount]  = useState(0);

  useEffect(() => {
    if (isAuthenticated && !authLoading) router.push('/');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    document.body.classList.add('login-route');
    return () => document.body.classList.remove('login-route');
  }, []);

  useEffect(() => {
    fetch('/api/v1/public/predictions/count')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setPredCount(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0a1a10 0%, #060d08 55%, #040a06 100%)' }}>

      <LoginBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <LoginHero countdown={countdown} predCount={predCount} />
        <LoginCard onShowForgot={() => setShowForgot(true)} />
      </div>

      <ForgotPasswordModal show={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
}
