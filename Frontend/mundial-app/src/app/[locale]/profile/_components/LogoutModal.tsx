'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha } from '@/lib/design/effects';
import { DarkModal } from './ui';

interface LogoutModalProps {
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}

export default function LogoutModal({ onClose, onConfirm, t }: LogoutModalProps) {
  return (
    <DarkModal onClose={onClose} width="w-[min(360px,88vw)]">
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: alpha(hex.accent.red, 0.10), border: `1px solid ${alpha(hex.accent.red, 0.25)}` }}
          >
            <FiLogOut size={22} style={{ color: hex.accent.redSoft }} />
          </div>
        </div>
        <h2 className="text-base font-black mb-1.5 text-orionix-text-primary">{t('profile.logout')}</h2>
        <p className="text-xs leading-relaxed mb-6 text-orionix-text-muted">
          {t('profile.logoutConfirm')}<br />{t('profile.logoutSub')}
        </p>
        <div className="flex gap-2.5">
          <motion.button
            onClick={onClose} whileHover={{ borderColor: alpha(hex.neutral.white, 0.18) }} whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-orionix-text-muted"
            style={{ border: `1px solid ${alpha(hex.neutral.white, 0.08)}`, background: alpha(hex.neutral.white, 0.03) }}
          >
            {t('common.cancel')}
          </motion.button>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02, boxShadow: `0 8px 24px ${alpha(hex.accent.red, 0.35)}` }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
            style={{ background: `linear-gradient(135deg, ${hex.accent.redStrong}, ${hex.accent.red})`, boxShadow: `0 4px 14px ${alpha(hex.accent.red, 0.22)}` }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <FiLogOut size={13} /> {t('profile.logout')}
            </span>
          </motion.button>
        </div>
      </div>
    </DarkModal>
  );
}
