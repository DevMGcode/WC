import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gradient' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300 hover:scale-105 active:scale-95',
  secondary:
    'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-100 font-bold shadow-lg hover:shadow-2xl hover:shadow-slate-800/50 transition-all duration-300 hover:scale-105 active:scale-95',
  outline:
    'border-2 border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30',
  danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg hover:shadow-2xl hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 active:scale-95',
  gradient: 'bg-gradient-to-r from-[#0b162a] via-[#123153] to-[#0d3c56] text-cyan-100 border border-cyan-400/35 shadow-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 hover:scale-105 active:scale-95 font-bold',
  neon: 'bg-[#081527] border-2 border-cyan-400/45 text-cyan-200 shadow-lg hover:shadow-2xl hover:shadow-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-105 active:scale-95 font-bold',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3.5 text-lg rounded-xl font-bold',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`font-semibold transition-all duration-300 ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; gradient?: boolean }> = ({
  children,
  className = '',
  gradient = false,
}) => {
  return (
    <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-6 backdrop-blur-sm border border-cyan-200/20 ${
      gradient 
        ? 'bg-gradient-to-br from-slate-900/95 via-blue-950/90 to-cyan-950/85 text-slate-100' 
        : 'bg-white/90'
    } ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  className?: string;
}> = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/25',
    warning: 'bg-amber-500/90 text-slate-900 shadow-lg shadow-amber-500/25 font-bold',
    danger: 'bg-rose-600/90 text-white shadow-lg shadow-rose-500/25',
    info: 'bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/25',
    primary: 'bg-slate-800 text-cyan-100 border border-cyan-400/30 shadow-lg shadow-cyan-500/20 font-bold',
  };

  return (
    <span
      className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Spinner: React.FC = () => (
  <div className="flex w-full max-w-xs flex-col items-center gap-3">
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-300/60">
      <div className="h-full w-1/3 animate-[loaderSlide_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" />
    </div>
    <span className="text-xs font-bold tracking-[0.22em] text-slate-600">CARGANDO</span>
  </div>
);

export default { Button, Card, Badge, Spinner };
