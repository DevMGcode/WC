import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orionix Gol - Predicciones Mundial 2026',
    short_name: 'Orionix Gol',
    description: 'Predicciones y seguimiento del Mundial de Fútbol 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#030810',
    theme_color: '#22d3ee',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/Logo_Pestaña.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logotipo_Orionix_Gol.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['sports', 'entertainment'],
    lang: 'es',
  };
}
