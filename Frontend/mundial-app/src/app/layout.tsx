import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.orionixgol.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#22d3ee',
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Orionix Gol — Mundial 2026',
    template: '%s | Orionix Gol',
  },
  description: 'Predice los resultados del Mundial de Fútbol 2026, compite en ligas privadas y sigue el ranking en tiempo real.',
  keywords: ['mundial 2026', 'predicciones fútbol', 'world cup 2026', 'porra mundial', 'ligas privadas'],
  authors: [{ name: 'Orionix Gol' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-icon-180.png',
    shortcut: '/Logo_Pestaña.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Orionix Gol',
    title: 'Orionix Gol — Mundial 2026',
    description: 'Predice los resultados del Mundial de Fútbol 2026, compite en ligas privadas y sigue el ranking en tiempo real.',
    url: APP_URL,
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Orionix Gol — Mundial 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orionix Gol — Mundial 2026',
    description: 'Predice los resultados del Mundial 2026 y compite con tus amigos.',
    images: ['/og'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" translate="no" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="tech-app-bg text-football-dark overflow-x-clip" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
