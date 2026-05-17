'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CustomTour } from '@/components/Tour/CustomTour';
import type { TourStep } from '@/components/Tour/CustomTour';

const SEEN_KEY = 'orionix_tour_seen_dashboard';

interface TourContextValue {
  startTour: (steps: TourStep[]) => void;
  isTourSeen: () => boolean;
  markTourSeen: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside TourProvider');
  return ctx;
}

const LOCALE_STRINGS = {
  back: { es: 'Anterior', en: 'Back', fr: 'Précédent', de: 'Zurück', pt: 'Anterior', ru: 'Назад', ar: 'السابق' },
  next: { es: 'Siguiente', en: 'Next', fr: 'Suivant', de: 'Weiter', pt: 'Próximo', ru: 'Далее', ar: 'التالي' },
  skip: { es: 'Omitir tour', en: 'Skip tour', fr: 'Passer', de: 'Überspringen', pt: 'Pular', ru: 'Пропустить', ar: 'تخطي' },
  last: { es: '¡Entendido!', en: 'Got it!', fr: 'Compris!', de: 'Verstanden!', pt: 'Entendido!', ru: 'Понял!', ar: 'فهمت!' },
} as const;

type LocaleKey = keyof typeof LOCALE_STRINGS.back;

function getLocale(): LocaleKey {
  if (typeof window === 'undefined') return 'es';
  const seg = window.location.pathname.split('/').filter(Boolean)[0] ?? 'es';
  return (seg in LOCALE_STRINGS.back ? seg : 'es') as LocaleKey;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps]   = useState<TourStep[]>([]);
  const [run,   setRun]     = useState(false);

  const startTour = useCallback((newSteps: TourStep[]) => {
    setSteps(newSteps);
    setRun(true);
  }, []);

  const isTourSeen = useCallback(() =>
    localStorage.getItem(SEEN_KEY) === 'true', []);

  const markTourSeen = useCallback(() =>
    localStorage.setItem(SEEN_KEY, 'true'), []);

  const handleFinish = useCallback(() => {
    setRun(false);
    markTourSeen();
  }, [markTourSeen]);

  const loc = getLocale();
  const locale = {
    next: LOCALE_STRINGS.next[loc],
    back: LOCALE_STRINGS.back[loc],
    skip: LOCALE_STRINGS.skip[loc],
    last: LOCALE_STRINGS.last[loc],
  };

  return (
    <TourContext.Provider value={{ startTour, isTourSeen, markTourSeen }}>
      <CustomTour steps={steps} run={run} locale={locale} onFinish={handleFinish} />
      {children}
    </TourContext.Provider>
  );
}
