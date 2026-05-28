'use client';

import Script from 'next/script';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import CookieConsent, { useCookieConsent } from '@/components/CookieConsent';
import { TourProvider } from '@/contexts/TourContext';
import QueryProvider from '@/components/QueryProvider';

// Dynamic imports — estos componentes son pesados (framer-motion + lógica)
// Se cargan en paralelo pero NO bloquean el render inicial de la página
const Navigation  = dynamic(() => import('@/components/Navigation').then(m => ({ default: m.Navigation })),  { ssr: false });
const IntroSplash = dynamic(() => import('@/components/IntroSplash').then(m => ({ default: m.IntroSplash })), { ssr: false });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function GAScripts() {
  const { consent } = useCookieConsent();
  if (!GA_ID || consent !== 'accepted') return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{'anonymize_ip':true});`}
      </Script>
    </>
  );
}

export default function LocaleClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GAScripts />
      <QueryProvider>
        <AuthProvider>
          <SidebarProvider>
            <TourProvider>
              <IntroSplash />
              <AppShell>
                {children}
              </AppShell>
              <Navigation />
              <CookieConsent />
            </TourProvider>
          </SidebarProvider>
        </AuthProvider>
      </QueryProvider>
    </>
  );
}
