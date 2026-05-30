'use client';

import React, { Component, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';

interface Props {
  children: ReactNode;
  /** Mensaje personalizado. Default: "Sección no disponible" */
  fallbackMessage?: string;
  /** Si true, muestra toda la pantalla en lugar de un bloque inline */
  fullPage?: boolean;
}

interface State { hasError: boolean; message: string }

/**
 * ErrorBoundary — atrapa errores de render de cualquier componente hijo
 * y muestra una UI de fallback en lugar de romper la pantalla completa.
 *
 * Uso:
 *   <ErrorBoundary fallbackMessage="No se pudieron cargar las alineaciones">
 *     <LineupsTab ... />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? 'Error desconocido' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  retry = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg = this.props.fallbackMessage; // si no se pasa, InlineFallback usa la key de i18n por defecto

    if (this.props.fullPage) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: `radial-gradient(ellipse at 25% 60%, ${hex.bg.primary} 0%, ${hex.bg.secondary} 45%, rgba(3,8,6,1) 100%)` }}
        >
          <InlineFallback msg={msg} onRetry={this.retry} />
        </div>
      );
    }

    return (
      <div
        className="rounded-2xl p-6 text-center my-4"
        style={{ background: alpha(hex.bg.elevated, 0.8), border: `1px solid ${alphaOf('danger', 0.15)}` }}
      >
        <InlineFallback msg={msg} onRetry={this.retry} compact />
      </div>
    );
  }
}

/* ── Sub-componente de UI del fallback ── */
const InlineFallback = ({
  msg, onRetry, compact = false,
}: { msg?: string; onRetry: () => void; compact?: boolean }) => {
  const t = useTranslations();
  const headline = msg ?? t('errors.sectionUnavailable');
  return (
    <div className={`text-center ${compact ? 'py-2' : 'py-8'}`}>
      <div className={`${compact ? 'text-2xl mb-2' : 'text-5xl mb-4'}`}>⚽</div>
      <p className={`font-black text-white ${compact ? 'text-sm mb-1' : 'text-lg mb-2'}`}>{headline}</p>
      {!compact && <p className="text-orionix-text-muted text-xs mb-5">{t('errors.sectionUnavailableBody')}</p>}
      <button
        onClick={onRetry}
        className={`px-5 py-2 rounded-xl font-black text-white text-xs`}
        style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.hover})` }}
      >
        {t('common.retry')}
      </button>
    </div>
  );
};

export default ErrorBoundary;
