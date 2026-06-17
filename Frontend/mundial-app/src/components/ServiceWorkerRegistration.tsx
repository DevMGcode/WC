'use client';

import { useEffect } from 'react';

/** Tras cuántas horas en segundo plano la app se considera "vieja" y se recarga sola. */
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

/**
 * Registro del service worker + auto-actualización de la PWA.
 *
 * Problema que resuelve: tras cada deploy, los celulares con la PWA abierta o
 * en segundo plano siguen ejecutando el bundle viejo. Sus peticiones al
 * servidor nuevo fallan ("Failed to find Server Action ... older deployment")
 * y el usuario ve errores genéricos sin explicación.
 *
 * Estrategia en tres capas:
 *  1. Al volver la app a primer plano, pedirle al navegador que busque
 *     una versión nueva del SW (registration.update()).
 *  2. Cuando un SW nuevo toma control (controllerchange), recargar una sola
 *     vez para que el cliente corra el bundle recién desplegado.
 *  3. Red de seguridad: si la app llevaba >6 h abierta y vuelve a primer
 *     plano, recargar de una — cubre los deploys donde sw.js no cambió.
 */
export default function ServiceWorkerRegistration() {
  // Desbloquea la orientación en runtime para PWAs ya instaladas con manifest portrait-primary.
  // screen.orientation.unlock() solo funciona en modo standalone (PWA) o fullscreen.
  useEffect(() => {
    try {
      if (screen?.orientation && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock()
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const loadedAt = Date.now();
    let reloading = false;

    const reloadOnce = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    // 2. SW nuevo tomó control → el deploy nuevo está activo: recargar.
    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);

    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible — activarla ya (dispara controllerchange)
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // 1. + 3. Al volver a primer plano: buscar SW nuevo y recargar si la app está vieja.
        const onVisible = () => {
          if (document.visibilityState !== 'visible') return;
          registration.update().catch(() => { /* sin red — se reintenta en el próximo foco */ });
          if (Date.now() - loadedAt > STALE_AFTER_MS) reloadOnce();
        };
        document.addEventListener('visibilitychange', onVisible);
      })
      .catch(err => console.warn('SW registration failed:', err));
  }, []);

  return null;
}
