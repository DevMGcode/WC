'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiX, FiSave, FiUser, FiMail } from 'react-icons/fi';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { DarkModal, DarkInput, ModalAlert } from './ui';

interface EditProfileModalProps {
  editName: string;
  setEditName: (v: string) => void;
  editEmail: string;
  setEditEmail: (v: string) => void;
  editError: string;
  editOk: string;
  editLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  t: (key: string) => string;
}

export default function EditProfileModal({
  editName, setEditName, editEmail, setEditEmail,
  editError, editOk, editLoading, onClose, onSave, t,
}: EditProfileModalProps) {
  return (
    <DarkModal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: alphaOf('green', 0.12), border: `1px solid ${alphaOf('green', 0.25)}` }}>
              <FiEdit3 size={14} className="text-orionix-green-bright" />
            </div>
            <h2 className="text-base font-black tracking-wide text-orionix-text-primary">{t('profile.edit.title')}</h2>
          </div>
          <button onClick={onClose} className="opacity-40 hover:opacity-80 transition-opacity">
            <FiX size={16} style={{ color: hex.accent.slate }} />
          </button>
        </div>

        <AnimatePresence>
          {editError && <ModalAlert message={editError} type="error" />}
          {editOk    && <ModalAlert message={editOk}    type="success" />}
        </AnimatePresence>

        <div className="space-y-4">
          <DarkInput
            id="ep-name" label={t('profile.edit.name')} value={editName} onChange={setEditName}
            placeholder={t('profile.edit.namePlaceholder')} icon={<FiUser size={14} />} autoComplete="name"
          />
          <DarkInput
            id="ep-email" label={t('profile.edit.email')} type="email" value={editEmail} onChange={setEditEmail}
            placeholder={t('profile.edit.emailPlaceholder')} icon={<FiMail size={14} />} autoComplete="email"
          />
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
            onClick={onSave} disabled={editLoading}
            whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${alphaOf('green', 0.38)}` }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${hex.green.dark}, ${hex.green.base})`, boxShadow: `0 4px 16px ${alphaOf('green', 0.22)}` }}
          >
            {editLoading ? (
              <motion.div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white mx-auto"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <span className="flex items-center justify-center gap-1.5"><FiSave size={13} /> {t('profile.edit.save')}</span>
            )}
          </motion.button>
        </div>
      </div>
    </DarkModal>
  );
}
