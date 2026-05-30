/**
 * Setup global de Jest — Orionix Gol frontend.
 *
 * Esto se ejecuta UNA vez antes de cada test (via `setupFilesAfterEach`).
 * Aquí mockeamos las APIs de Next.js que no funcionan dentro de jsdom:
 *  - next/navigation, next/link, next/image
 *  - next-intl (useTranslations, useLocale)
 *  - window.matchMedia y otros helpers de browser
 *
 * Cualquier test puede sobrescribir un mock concreto con `jest.mock(...)` en
 * su propio archivo si necesita comportamiento custom.
 */
import '@testing-library/jest-dom';
import React from 'react';

/* ─── Polyfill fetch / Response / Request / Headers ────────────────────────
 * jsdom no implementa la Fetch API. Node 18+ sí trae implementación nativa
 * de Response/Request/Headers/fetch en globalThis (vía undici interno). Las
 * exponemos a `global` para que estén disponibles en los tests.
 */
if (typeof (global as any).Response === 'undefined') {
  (global as any).Response = (globalThis as any).Response;
  (global as any).Request = (globalThis as any).Request;
  (global as any).Headers = (globalThis as any).Headers;
}
if (typeof (global as any).fetch === 'undefined') {
  (global as any).fetch = (globalThis as any).fetch;
}

/* ─── next/image: render <img> simple ──────────────────────────────────────── */
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // next/image acepta `fill`, `priority`, etc. que <img> normal rechaza; los limpiamos.
    const { fill, priority, placeholder, blurDataURL, loader, quality, ...rest } = props;
    return React.createElement('img', rest);
  }
}));

/* ─── next/link: pasa los hijos directo con href ───────────────────────────── */
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) =>
    React.createElement('a', { href, ...rest }, children)
}));

/* ─── next/navigation: hooks que retornan stubs útiles ─────────────────────── */
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/es',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'es' }),
  redirect: jest.fn()
}));

/* ─── next-intl: traducción es passthrough del key (suficiente para tests) ─── */
jest.mock('next-intl', () => ({
  __esModule: true,
  useTranslations: () => (key: string, values?: Record<string, any>) => {
    if (values && Object.keys(values).length > 0) {
      // Devuelve "key {var1} {var2}" interpolando los valores numéricos/strings.
      return `${key} ${Object.values(values).join(' ')}`.trim();
    }
    return key;
  },
  useLocale: () => 'es',
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }: any) => children
}));

/* ─── window.matchMedia (jsdom no lo implementa) ───────────────────────────── */
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });

  /* ─── IntersectionObserver y ResizeObserver: stubs no-op ─── */
  (window as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  (window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// `global.fetch` ya está disponible desde el polyfill Node nativo de arriba.
// Tests que necesiten un mock concreto pueden hacer:
//   jest.spyOn(global, 'fetch').mockResolvedValue(new Response(...))
