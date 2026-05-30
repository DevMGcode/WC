'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiX, FiLock } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { DarkModal, DarkInput, ModalAlert } from './ui';

interface ChangePasswordModalProps {
  curPwd: string; setCurPwd: (v: string) => void;
  newPwd: string; setNewPwd: (v: string) => void;
  conPwd: string; setConPwd: (v: string) => void;
  showCur: boolean; setShowCur: (v: boolean) => void;
  showNew: boolean; setShowNew: (v: boolean) => void;
  showCon: boolean; setShowCon: (v: boolean) => void;
  pwdError: string;
  pwdOk: string;
  pwdLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  t: (key: string) => string;
}

export default function ChangePasswordModal({
  curPwd, setCurPwd, newPwd, setNewPwd, conPwd, setConPwd,
  showCur, setShowCur, showNew, setShowNew, showCon, setShowCon,
  pwdError, pwdOk, pwdLoading, onClose, onSave, t,
}: ChangePasswordModalProps) {
  return (
    <DarkModal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: alphaOf('green', 0.12), border: `1px solid ${alphaOf('green', 0.25)}` }}>
              <FiShield size={14} className="text-orionix-green-bright" />
            </div>
            <h2 className="text-base font-black tracking-wide text-orionix-text-primary">{t('profile.password.title')}</h2>
          </div>
          <button onClick={onClose} className="opacity-40 hover:opacity-80 transition-opacity">
            <FiX size={16} style={{ color: hex.accent.slate }} />
          </button>
        </div>

        <AnimatePresence>
          {pwdError && <ModalAlert message={pwdError} type="error" />}
          {pwdOk    && <ModalAlert message={pwdOk}    type="success" />}
        </AnimatePresence>

        <div className="space-y-4">
          <DarkInput id="cp-cur" label={t('profile.password.current')} value={curPwd} onChange={setCurPwd}
            placeholder={t('profile.password.currentPlaceholder')} icon={<FiLock size={14} />}
            autoComplete="current-password" showToggle show={showCur} onToggle={() => setShowCur(!showCur)} />
          <DarkInput id="cp-new" label={t('profile.password.new')} value={newPwd} onChange={setNewPwd}
            placeholder={t('profile.password.newPlaceholder')} icon={<FiLock size={14} />}
            autoComplete="new-password" showToggle show={showNew} onToggle={() => setShowNew(!showNew)} />
          <DarkInput id="cp-con" label={t('profile.password.confirm')} value={conPwd} onChange={setConPwd}
            placeholder={t('profile.password.confirmPlaceholder')} icon={<FiLock size={14} />}
            autoComplete="new-password" showToggle show={showCon} onToggle={() => setShowCon(!showCon)} />
        </div>

        <div className="flex gap-2.5 mt-6">
          <motion.button
            onClick={onClose} whileHover={{ borderColor: alpha(hex.neutral.white, 0.18) }} whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-orionix-text-muted"
            style={{ border: `1px solid ${alpha(hex.neutral.white, 0.08)}`, background: alpha(hex.neutral.white, 0.03) }}
          >
            {t('common.cancel')}
          </motion.button>
          <motion.button
            onClick={onSave} disabled={pwdLoading}
            whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${alphaOf('green', 0.38)}` }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base})`, boxShadow: `0 4px 16px ${alphaOf('green', 0.22)}` }}
          >
            {pwdLoading ? (
              <motion.div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white mx-auto"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <span className="flex items-center justify-center gap-1.5"><FiShield size={13} /> {t('profile.password.save')}</span>
            )}
          </motion.button>
        </div>
      </div>
    </DarkModal>
  );
}
