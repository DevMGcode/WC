/**
 * Jest configuration — Orionix Gol frontend.
 * Stack: Jest 29 + ts-jest + @testing-library/react + jsdom.
 *
 * Notas:
 *  - Varios paquetes publican únicamente ESM (next-intl, framer-motion,
 *    @sentry/nextjs, react-icons, lucide-react…). Por defecto Jest deja en
 *    CommonJS todo lo que esté bajo node_modules, así que esos imports rompen
 *    con `Unexpected token 'export'`. La whitelist en `transformIgnorePatterns`
 *    los pasa por ts-jest para que Jest los pueda evaluar.
 *  - `moduleNameMapper` resuelve los alias TypeScript (`@/...`) y mockea CSS y
 *    archivos estáticos (svg/png/etc.) para que los imports de assets no rompan.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif|webp|avif|ico)$': '<rootDir>/jest.fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        allowJs: true,
        resolveJsonModule: true
      },
      diagnostics: false
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|use-intl|@formatjs|intl-messageformat|@messageformat|framer-motion|motion-utils|@sentry|@sentry-internal|react-icons|lucide-react)/)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/i18n/messages/**'
  ],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json']
};
