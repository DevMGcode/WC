'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiCheck, FiCopy } from 'react-icons/fi';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'icon' | 'pill';
}

export default function ShareButton({
  title,
  text,
  url,
  label = 'Compartir',
  size = 'md',
  variant = 'pill',
}: ShareButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'shared'>('idle');

  const rawUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  // Si nos pasan una ruta relativa (p. ej. /es/fixtures/12), la volvemos absoluta
  // para que el link compartido lleve dominio y muestre la vista previa con foto.
  const shareUrl =
    rawUrl && !rawUrl.startsWith('http') && typeof window !== 'undefined'
      ? window.location.origin + (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`)
      : rawUrl;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        setState('shared');
        setTimeout(() => setState('idle'), 2000);
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const iconSize = size === 'sm' ? 11 : 13;

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="flex items-center justify-center rounded-xl"
        style={{
          width: size === 'sm' ? 28 : 34,
          height: size === 'sm' ? 28 : 34,
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.22)',
          color: '#22d3ee',
        }}
        title={label}
      >
        {state === 'copied' ? <FiCheck size={iconSize} /> : <FiShare2 size={iconSize} />}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full overflow-hidden"
      style={{
        background: 'rgba(34,211,238,0.08)',
        border: '1px solid rgba(34,211,238,0.22)',
        color: '#22d3ee',
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 800,
      }}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5">
            <FiShare2 size={iconSize} /> {label}
          </motion.span>
        )}
        {state === 'copied' && (
          <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5" style={{ color: '#34d399' }}>
            <FiCopy size={iconSize} /> Copiado
          </motion.span>
        )}
        {state === 'shared' && (
          <motion.span key="shared" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5" style={{ color: '#34d399' }}>
            <FiCheck size={iconSize} /> ¡Compartido!
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
