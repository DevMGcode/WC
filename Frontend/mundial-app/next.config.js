/** @type {import('next').NextConfig} */
// GlitchTip es open-source y compatible con el protocolo Sentry, por eso
// reutilizamos el wrapper oficial `withSentryConfig` del SDK `@sentry/nextjs`
// como transporte. Los eventos NO van a Sentry — van al DSN de GlitchTip.
const { withSentryConfig: withGlitchTipConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL || 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${internalApiBaseUrl}/api/:path*`,
        },
      ],
    };
  },
};

// Envolvemos Next con el wrapper de GlitchTip (alias de withSentryConfig).
// Sourcemaps desactivados: GlitchTip cloud free no acepta subir sourcemaps.
// Si auto-hospedas GlitchTip puedes activarlos.
module.exports = withGlitchTipConfig(withNextIntl(nextConfig), {
  silent: true,
  sourcemaps: {
    disable: true,
  },
});
