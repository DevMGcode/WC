import type { Metadata } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Orionix Gol',
  description: 'Predicciones y seguimiento del Mundial de Fútbol 2026',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  themeColor: '#22d3ee',
  icons: {
    icon: '/Logo_Pestaña.png',
    apple: '/Logo_Pestaña.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
