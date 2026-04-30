import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { IntroSplash } from '@/components/IntroSplash';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orionix Gol',
  description: 'Predicciones y seguimiento de Orionix Gol',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  icons: {
    icon: '/Logo_Pestaña.png',
    apple: '/Logo_Pestaña.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="tech-app-bg text-football-dark overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <IntroSplash />
          <div className="app-shell min-h-screen flex flex-col pb-20 md:pb-20 w-full relative">
            {children}
          </div>
          <Navigation />
        </AuthProvider>
      </body>
    </html>
  );
}
