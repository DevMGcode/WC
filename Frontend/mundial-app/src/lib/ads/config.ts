/**
 * Configuración central de Adsterra — TODAS las claves de anuncios viven aquí.
 *
 * Los anuncios SOLO se muestran a usuarios autenticados del plan Free
 * (ver hook `useShowAds`). Premium = cero anuncios en toda la app.
 *
 * Unidades aprobadas para el dominio orionixgol (email de aprobación Adsterra):
 *   Popunder         29604937 → script pl29705436 (desactivado por defecto, ver abajo)
 *   Banner nativo    29604938 → script pl29705437 + contenedor por id
 *   Smartlink        29604939 → URL directa (no embebible — para tráfico directo)
 *   Social Bar       29604940 → script pl29705439 (widget flotante global)
 *   Banner 160x600   29604941
 *   Banner 300x250   29604942
 *   Banner 160x300   29604943
 *
 * Nota: las creatividades reales solo se sirven en el dominio aprobado
 * (orionixgol). En localhost los espacios pueden quedar vacíos — es normal.
 */

export interface BannerUnit {
  key: string;
  width: number;
  height: number;
}

export const ADSTERRA = {
  /** Interruptor global — apagarlo oculta toda la publicidad sin tocar código. */
  enabled: true,

  /** Banners formato iframe (atOptions + invoke.js de highperformanceformat). */
  banners: {
    /** 300x250 — rectángulo medio, el formato con mejor CPM. Contenido principal. */
    rect300x250: {
      key: "cf2a0fe893d6c4c7164b6b656d2dd9f8",
      width: 300,
      height: 250,
    } as BannerUnit,
    /** 160x600 — rascacielos, solo raíl lateral en pantallas anchas. */
    sky160x600: {
      key: "115fcbb9c370bb6d2eb7c2771b8bf374",
      width: 160,
      height: 600,
    } as BannerUnit,
    /** 160x300 — disponible para espacios angostos (sin colocación activa hoy). */
    box160x300: {
      key: "91fbf779c76a87e712643b60f9f3e223",
      width: 160,
      height: 300,
    } as BannerUnit,
    /** 728x90 — leaderboard horizontal, cierre de página en desktop. */
    leader728x90: {
      key: "d803412965fb194048128e2459c0d714",
      width: 728,
      height: 90,
    } as BannerUnit,
    /** 468x60 — banner horizontal para anchos intermedios (tablet). */
    banner468x60: {
      key: "cb48fe342a2d9408e93382de1db181d4",
      width: 468,
      height: 60,
    } as BannerUnit,
    /** 320x50 — banner horizontal móvil. */
    mobile320x50: {
      key: "287ad9a6936b89b757bcdc00a167a211",
      width: 320,
      height: 50,
    } as BannerUnit,
  },

  /** Banner nativo — se integra como tarjetas de contenido en el feed. */
  native: {
    scriptSrc:
      "https://pl29705437.effectivecpmnetwork.com/432a9c24e6d49373f0b50b27139820d0/invoke.js",
    containerId: "container-432a9c24e6d49373f0b50b27139820d0",
  },

  /** Social Bar — widget flotante global (formato no intrusivo de Adsterra). */
  socialBar: {
    enabled: false,
    scriptSrc:
      "https://pl29705439.effectivecpmnetwork.com/03/de/6f/03de6f65955f957e679ef67450572cd8.js",
  },

  /**
   * Popunder — DESACTIVADO a propósito.
   * Abre ventanas/pestañas nuevas al hacer clic en cualquier parte: daña la
   * retención, la calificación PWA y puede marcar el sitio como engañoso en
   * Chrome/Play Store. Activar solo si se asume ese costo (enabled: true).
   * OJO: además los popunders violan las políticas de Google AdSense —
   * mientras AdSense esté activo abajo, esto debe seguir en false.
   */
  popunder: {
    enabled: false,
    scriptSrc:
      "https://pl29705436.effectivecpmnetwork.com/4c/ca/37/4cca37ebf1a946cef1ac8f35ec73de92.js",
  },
} as const;

/**
 * Google AdSense (Auto Ads) — el loader habilita los anuncios automáticos
 * que se configuran en el panel de AdSense (adsense.google.com).
 *
 * Mismo gating que Adsterra: SOLO usuarios Free autenticados. Además
 * requiere consentimiento de cookies aceptado (AdSense personaliza con
 * cookies), igual que ya hace Google Analytics en este proyecto.
 */
export const GOOGLE_ADSENSE = {
  enabled: true,
  client: "ca-pub-9221658875005359",
} as const;
