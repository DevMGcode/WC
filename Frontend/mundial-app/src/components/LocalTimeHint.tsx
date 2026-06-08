'use client';

/**
 * Muestra debajo de la hora oficial (CDMX) la hora LOCAL del navegador del
 * usuario, calculada solo en cliente para evitar mismatches SSR/CSR.
 *
 * Ejemplo de uso:
 *
 *   <span>11 jun · 1:00 PM CDMX</span>
 *   <LocalTimeHint date={fixture.kickoffAt} locale="es" />
 *   // → renderiza: "↳ tu hora: 2:00 PM" (en Bogotá)
 *
 * - En SSR no renderiza nada (devuelve null).
 * - En cliente, después de hidratar, muestra la hora local con un fade-in
 *   sutil para que el cambio no se note como flicker brusco.
 * - Si la TZ del usuario coincide con CDMX, no muestra nada (sería redundante).
 */

import React, { useEffect, useState } from 'react';

interface Props {
  date: Date | string | number;
  locale?: string;
  /** Texto que va antes de la hora local, por defecto "tu hora:" */
  prefix?: string;
  /** Estilo opcional para customizar */
  className?: string;
  style?: React.CSSProperties;
}

const SEDE_TZ = 'America/Mexico_City';

export default function LocalTimeHint({
  date,
  locale = 'es',
  prefix = 'tu hora:',
  className,
  style,
}: Props) {
  const [info, setInfo] = useState<{ time: string; tzName: string } | null>(null);

  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Si la TZ del usuario es la misma que la sede, no tiene sentido mostrar
      // dos veces la misma hora.
      if (userTz === SEDE_TZ) {
        setInfo(null);
        return;
      }
      const dt = new Date(date);
      const time = dt.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: userTz,
      });
      // Nombre corto de la ciudad (ej. "Bogota" en "America/Bogota").
      const tzCity = userTz.split('/').pop()?.replace(/_/g, ' ') ?? '';
      setInfo({ time, tzName: tzCity });
    } catch {
      setInfo(null);
    }
  }, [date, locale]);

  if (!info) return null;

  return (
    <span
      className={className}
      style={{
        fontSize: '10px',
        opacity: 0.65,
        fontWeight: 500,
        letterSpacing: '0.02em',
        ...style,
      }}>
      ↳ {prefix} {info.time}
      {info.tzName && (
        <span style={{ opacity: 0.6, marginLeft: 4 }}>({info.tzName})</span>
      )}
    </span>
  );
}
