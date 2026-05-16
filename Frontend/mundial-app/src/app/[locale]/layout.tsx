'use client';

import Script from 'next/script';
import { Navigation } from '@/components/Navigation';
import { IntroSplash } from '@/components/IntroSplash';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      <AuthProvider>
        <SidebarProvider>
          <IntroSplash />
          <AppShell>
            {children}
          </AppShell>
          <Navigation />
        </SidebarProvider>
      </AuthProvider>
    </>
  );
}
