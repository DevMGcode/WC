'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { hex }   from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';

interface Props  { children: ReactNode }
interface State  { hasError: boolean; errorMessage: string }

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Error desconocido en el módulo de pagos.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PaymentErrorBoundary]', { error, componentStack: info.componentStack });
  }

  handleRetry = () => this.setState({ hasError: false, errorMessage: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="relative overflow-hidden rounded-2xl p-6 text-center"
          style={{
            background: `linear-gradient(160deg, ${alpha(hex.bg.soft, 0.90)} 0%, ${alpha(hex.bg.elevated, 0.95)} 100%)`,
            border: `1px solid ${hex.status.danger}30`,
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${hex.status.danger}55, transparent)` }} />
          <p className="text-4xl mb-3">💳</p>
          <p className="text-sm font-black text-white mb-1">Error en el módulo de pagos</p>
          <p className="text-[12px] mb-1" style={{ color: hex.text.secondary }}>{this.state.errorMessage}</p>
          <p className="text-[11px] mb-4" style={{ color: hex.text.muted }}>
            Tus datos no han sido procesados. Puedes intentarlo de nuevo con seguridad.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2.5 rounded-xl text-sm font-black tracking-wide"
            style={{
              background: `linear-gradient(135deg, ${hex.status.danger}22, ${alpha(hex.bg.elevated, 0.90)})`,
              border: `1px solid ${hex.status.danger}40`,
              color: hex.status.danger,
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
