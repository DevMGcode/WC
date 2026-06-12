"use client";

import { useEffect, useRef } from "react";
import { hex } from "@/lib/design/tokens";
import { alpha } from "@/lib/design/effects";
import { ADSTERRA } from "@/lib/ads/config";
import { useShowAds } from "./useShowAds";

/**
 * Banner nativo de Adsterra — tarjetas estilo "contenido recomendado".
 *
 * El script de Adsterra busca el div con el id exacto `containerId` y lo
 * rellena. Por eso este componente debe montarse COMO MÁXIMO UNA VEZ por
 * página (el id es fijo). El script se inyecta en el cliente al montar y se
 * retira al desmontar para no duplicarlo al navegar entre rutas.
 *
 * Solo se muestra a usuarios Free autenticados (useShowAds).
 */
export function AdsterraNative({ className = "" }: { className?: string }) {
  const showAds = useShowAds();
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showAds || !hostRef.current) return;

    const script = document.createElement("script");
    script.async = false;
    script.setAttribute("data-cfasync", "false");
    script.src = ADSTERRA.native.scriptSrc;
    hostRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [showAds]);

  if (!showAds) return null;

  // En móvil el Native genera demasiadas tarjetas y bloquea la navegación.
  // Se oculta por debajo de sm (640 px); el Banner rect300x250 al pie de
  // cada página cubre la monetización en pantallas pequeñas.
  return (
    <div ref={hostRef} className={`hidden sm:block w-full ${className}`}>
      <span
        className="block text-center text-[8px] font-bold tracking-[0.3em] uppercase mb-1"
        style={{ color: alpha(hex.text.muted, 0.55) }}
      >
        Publicidad
      </span>
      {/* max-h evita que Adsterra expanda el contenedor más allá de ~3 tarjetas */}
      <div id={ADSTERRA.native.containerId} className="max-h-[600px] overflow-hidden" />
    </div>
  );
}
