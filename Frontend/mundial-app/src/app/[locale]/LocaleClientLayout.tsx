'use client';

import Script from 'next/script';
import { Navigation } from '@/components/Navigation';
import { IntroSplash } from '@/components/IntroSplash';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import CookieConsent, { useCookieConsent } from '@/components/CookieConsent';
import { TourProvider } from '@/contexts/TourContext';


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
    </>
  );
}
