'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

const STORAGE_KEY = 'orionix_cookie_consent';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus;
    if (stored) setConsent(stored);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsent('rejected');
  };

  return { consent, accept, reject };
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { consent, accept, reject } = useCookieConsent();
  const pathname = usePathname();
  const locale = pathname.split('/').filter(Boolean)[0] ?? 'es';
  const privacyUrl = `/${locale}/privacy`;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const handleAccept = () => { accept(); setVisible(false); };
  const handleReject = () => { reject(); setVisible(false); };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-20 left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
        >
          <div className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.98)}, ${alpha(hex.bg.secondary, 0.97)})`,
              border: `1px solid ${alphaOf('green', 0.18)}`,
              boxShadow: `0 20px 60px ${alpha(hex.neutral.black, 0.60)}`,
            }}>
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.5)}, transparent)` }} />

            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">🍪</span>
                <div>
                  <p className="text-white font-black text-sm">Cookies y privacidad</p>
                  <p className="text-orionix-text-muted text-xs mt-0.5 leading-relaxed">
                    Usamos Google Analytics para mejorar la app. No vendemos tus datos.
                    Aplica{' '}
                    <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 underline underline-offset-2">
                      Política de privacidad
                    </a>{' '}
                    (GDPR · Ley 1581 CO).
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={handleReject}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-2 rounded-xl text-xs font-black text-orionix-text-muted"
                  style={{ background: alpha(hex.neutral.white, 0.04), border: `1px solid ${alpha(hex.neutral.white, 0.08)}` }}
                >
                  Rechazar
                </motion.button>
                <motion.button
                  onClick={handleAccept}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-2 rounded-xl text-xs font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})`, boxShadow: `0 4px 16px ${alphaOf('green', 0.25)}` }}
                >
                  Aceptar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
