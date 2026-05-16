'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { localeConfig, locales } from '@/i18n/locales';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiHeart, FiSettings, FiEdit3, FiLock, FiLogOut,
  FiActivity, FiCrosshair, FiAward, FiBarChart2, FiBell,
  FiSave, FiEye, FiEyeOff, FiCheck, FiX,
  FiAlertTriangle, FiPlus, FiTrash2, FiMail, FiShield,
  FiCalendar, FiZap, FiGlobe,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Navigation';
import { getCurrentTournament } from '@/services/publicTournament';
import { useT } from '@/hooks/useT';

/* ══════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════ */

const EQBars = ({ color, count = 9, maxH = 20 }: { color: string; count?: number; maxH?: number }) => {
  const seq = [6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12];
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: maxH }}>
      {Array.from({ length: count }).map((_, i) => {
        const h1 = (seq[i % seq.length] / 20) * maxH;
        const h2 = (seq[(i + 4) % seq.length] / 20) * maxH;
        const h3 = (seq[(i + 2) % seq.length] / 20) * maxH;
        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 2.5, background: color, boxShadow: `0 0 4px ${color}` }}
            animate={{ height: [h1, h2, h3, h2, h1] }}
            transition={{ duration: 1.3 + i * 0.11, repeat: Infinity, ease: 'easeInOut', delay: i * 0.09 }}
          />
        );
      })}
    </div>
  );
};

const Ring = ({
  value, max = 100, size = 68, stroke = 5, color, trail = 'rgba(255,255,255,0.05)',
}: { value: number; max?: number; size?: number; stroke?: number; color: string; trail?: string }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(1, value / Math.max(max, 1));
  const off  = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ overflow: 'visible' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trail} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}55)` }}
      />
    </svg>
  );
};

const GlowBar = ({ value, max = 100, color, height = 4 }: { value: number; max?: number; color: string; height?: number }) => {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.05)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}80` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />
    </div>
  );
};

const Particle = ({ index }: { index: number }) => {
  const x = (index * 137.508) % 100;
  const size = 1 + (index % 2);
  const delay = (index * 0.28) % 7;
  const duration = 9 + (index % 7);
  const cols: [string, string][] = [
    ['rgba(34,211,238,0.60)', '0 0 8px rgba(34,211,238,0.75)'],
    ['rgba(52,211,153,0.50)', '0 0 7px rgba(52,211,153,0.65)'],
    ['rgba(251,191,36,0.45)', '0 0 7px rgba(251,191,36,0.60)'],
    ['rgba(56,189,248,0.55)', '0 0 7px rgba(56,189,248,0.65)'],
  ];
  const [bg, shadow] = cols[index % cols.length];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -4, background: bg, boxShadow: shadow }}
      animate={{ y: [0, -(420 + (index % 200))], x: [0, Math.sin(index * 1.4) * 38], opacity: [0, 0.85, 0.5, 0], scale: [0.4, 1.3, 0.6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

const SectionLabel = ({ children, color = '#22d3ee' }: { children: React.ReactNode; color?: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-[3px] h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${color}, ${color}80)` }} />
    <span className="text-[10px] font-black text-slate-400 tracking-[0.24em] uppercase">{children}</span>
  </div>
);

const DarkInput = ({
  id, label, type = 'text', value, onChange, placeholder, icon, autoComplete,
  showToggle, show, onToggle, focusColor = 'rgba(34,211,238,0.55)',
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon: React.ReactNode; autoComplete?: string;
  showToggle?: boolean; show?: boolean; onToggle?: () => void;
  focusColor?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const inputType = showToggle ? (show ? 'text' : 'password') : type;
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: 'rgba(148,163,184,0.7)' }}
      >
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: focused ? focusColor : 'rgba(100,116,139,0.7)', transition: 'color 200ms' }}
        >
          {icon}
        </span>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 placeholder-slate-600 transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? focusColor : 'rgba(255,255,255,0.08)'}`,
            boxShadow: focused ? `0 0 0 3px ${focusColor}20` : 'none',
            outline: 'none',
          }}
        />
        {showToggle && onToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
            style={{ color: 'rgba(148,163,184,0.8)' }}
          >
            {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Toggle = ({
  checked, onChange, color = '#22d3ee',
}: { checked: boolean; onChange: (v: boolean) => void; color?: string }) => (
  <motion.button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="relative shrink-0 w-11 h-6 rounded-full cursor-pointer"
    style={{
      background: checked
        ? `linear-gradient(90deg, ${color}90, ${color})`
        : 'rgba(255,255,255,0.07)',
      border: `1px solid ${checked ? color + '55' : 'rgba(255,255,255,0.10)'}`,
      boxShadow: checked ? `0 0 12px ${color}40` : 'none',
      transition: 'background 250ms, border-color 250ms, box-shadow 250ms',
    }}
    whileTap={{ scale: 0.94 }}
  >
    <motion.div
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
      animate={{ x: checked ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
    />
  </motion.button>
);

const DarkModal = ({
  children, onClose, width = 'w-[min(420px,90vw)]',
}: { children: React.ReactNode; onClose: () => void; width?: string }) => (
  <>
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${width}`}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 12 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={{
        background: 'linear-gradient(145deg, rgba(2,8,22,0.98), rgba(4,14,36,0.97))',
        border: '1px solid rgba(34,211,238,0.22)',
        borderRadius: '1.25rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px rounded-t-[1.25rem]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.60), transparent)' }} />
      {children}
    </motion.div>
  </>
);

const ModalAlert = ({ message, type }: { message: string; type: 'error' | 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mb-4"
    style={
      type === 'error'
        ? { background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }
        : { background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.22)' }
    }
  >
    {type === 'error'
      ? <FiAlertTriangle size={13} style={{ color: '#f87171', flexShrink: 0 }} />
      : <FiCheck size={13} style={{ color: '#34d399', flexShrink: 0 }} />
    }
    <p className="text-xs font-medium" style={{ color: type === 'error' ? '#fca5a5' : '#6ee7b7' }}>
      {message}
    </p>
  </motion.div>
);

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function ProfilePage() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { t } = useT();

  const [user, setUser]                   = useState<any>(null);
  const [favoriteTeams, setFavoriteTeams] = useState<any[]>([]);
  const [activeTab, setActiveTab]         = useState<'PROFILE' | 'FAVORITES' | 'SETTINGS'>(
    () => (typeof window !== 'undefined' ? (sessionStorage.getItem('profile-tab') as any) || 'PROFILE' : 'PROFILE')
  );
  const [language, setLanguage]           = useState('es');
  const [notifications, setNotifications] = useState({
    fixtureReminders:    true,
    resultNotifications: true,
    leagueUpdates:       true,
    newsUpdates:         false,
  });
  const [stats, setStats] = useState({ predictions: 0, acertadas: 0, puntos: 0, rankGlobal: 0 });

  const [showEdit, setShowEdit]           = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showLogout, setShowLogout]       = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [editName, setEditName]       = useState('');
  const [editEmail, setEditEmail]     = useState('');
  const [editError, setEditError]     = useState('');
  const [editOk, setEditOk]           = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [curPwd, setCurPwd]         = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [conPwd, setConPwd]         = useState('');
  const [pwdError, setPwdError]     = useState('');
  const [pwdOk, setPwdOk]           = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCur, setShowCur]       = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showCon, setShowCon]       = useState(false);

  // Sync language selector with URL locale
  useEffect(() => {
    const urlLocale = pathname.split('/')[1];
    if (locales.includes(urlLocale as any)) {
      setLanguage(urlLocale);
    } else {
      setLanguage(localStorage.getItem('language') || 'es');
    }
  }, [pathname]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return; }
    if (authUser) {
      setUser({
        id: authUser.id,
        displayName: authUser.displayName,
        email: authUser.email,
        joinedAt: new Date(authUser.createdAt),
      });
      const fetchStats = async () => {
        try {
          const tournament = await getCurrentTournament();
          const tournamentId = tournament?.id ?? 1;
          const userId = authUser.id;
          const [predRes, scoreRes] = await Promise.all([
            fetch(`/api/v1/public/predictions/user/${userId}`),
            fetch(`/api/v1/public/scores/user/${tournamentId}?userId=${userId}`),
          ]);
          const predictions = predRes.ok ? ((await predRes.json())?.data ?? []).length : 0;
          let acertadas = 0, puntos = 0, rankGlobal = 0;
          if (scoreRes.ok) {
            const score = (await scoreRes.json())?.data;
            acertadas = score?.exactScores ?? 0;
            puntos    = score?.totalPoints ?? 0;
            rankGlobal = score?.rankPosition ?? 0;
          }
          setStats({ predictions, acertadas, puntos, rankGlobal });
        } catch { /* ignore */ }
      };
      fetchStats();
    }
    setFavoriteTeams([
      { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
      { id: 2, name: 'Colombia',  shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
    ]);
  }, [authUser, authLoading, isAuthenticated, router]);

  const handleOpenEdit = () => {
    setEditName(user?.displayName || '');
    setEditEmail(user?.email || '');
    setEditError(''); setEditOk('');
    setShowEdit(true);
  };

  const handleSaveProfile = async () => {
    setEditError(''); setEditOk('');
    if (!editName.trim()) { setEditError(t('profile.edit.nameRequired')); return; }
    if (!editEmail.trim() || !editEmail.includes('@')) { setEditError(t('profile.edit.emailInvalid')); return; }
    setEditLoading(true);
    try {
      const userId = authUser?.id || user?.id;
      const res = await fetch(`/api/v1/public/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: editName.trim(), email: editEmail.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) { setEditError(payload?.message || t('profile.edit.error')); return; }
      setUser((p: any) => ({ ...p, displayName: editName.trim(), email: editEmail.trim() }));
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.displayName = editName.trim(); parsed.email = editEmail.trim();
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      setEditOk(t('profile.edit.success'));
      setTimeout(() => setShowEdit(false), 1400);
    } catch { setEditError(t('profile.edit.error')); }
    finally { setEditLoading(false); }
  };

  const handleOpenPassword = () => {
    setCurPwd(''); setNewPwd(''); setConPwd('');
    setPwdError(''); setPwdOk('');
    setShowPassword(true);
  };

  const handleSavePassword = async () => {
    setPwdError(''); setPwdOk('');
    if (!curPwd.trim()) { setPwdError(t('profile.password.currentRequired')); return; }
    if (newPwd.length < 5) { setPwdError(t('profile.password.tooShort')); return; }
    if (newPwd !== conPwd) { setPwdError(t('profile.password.noMatch')); return; }
    setPwdLoading(true);
    try {
      const userId = authUser?.id || user?.id;
      const res = await fetch(`/api/v1/public/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPwd.trim(), newPassword: newPwd.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) { setPwdError(payload?.message || t('profile.password.connectionError')); return; }
      setCurPwd(''); setNewPwd(''); setConPwd('');
      setPwdOk(t('profile.password.success'));
      setTimeout(() => setShowPassword(false), 1400);
    } catch { setPwdError(t('profile.password.connectionError')); }
    finally { setPwdLoading(false); }
  };

  const handleLogout = () => {
    logout();
    window.sessionStorage.removeItem('orionix-dock-visible');
    window.location.replace('/login');
  };

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('language', language);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    const segments = pathname.split('/');
    const currentLocale = segments[1];
    setSettingsSaved(true);
    if (language !== currentLocale) {
      sessionStorage.setItem('profile-tab', 'SETTINGS');
      segments[1] = language;
      setTimeout(() => { router.push(segments.join('/')); }, 800);
    } else {
      setTimeout(() => setSettingsSaved(false), 2500);
    }
  };

  if (authLoading || !user) return null;

  const accuracyPct = stats.predictions > 0
    ? Math.round((stats.acertadas / stats.predictions) * 100) : 0;

  const allTeams = [
    { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
    { id: 2, name: 'Brasil',    shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
    { id: 3, name: 'España',    shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
    { id: 4, name: 'Alemania',  shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
    { id: 5, name: 'Francia',   shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
    { id: 6, name: 'México',    shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' },
    { id: 7, name: 'Colombia',  shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
    { id: 8, name: 'Uruguay',   shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' },
  ];

  const tabs = [
    { key: 'PROFILE',   label: t('profile.tabs.profile'),   icon: <FiUser size={14} />,     color: '#22d3ee' },
    { key: 'FAVORITES', label: t('profile.tabs.favorites'), icon: <FiHeart size={14} />,    color: '#f472b6' },
    { key: 'SETTINGS',  label: t('profile.tabs.settings'),  icon: <FiSettings size={14} />, color: '#34d399' },
  ] as const;

  return (
    <div
      className="w-full relative min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 22% 35%, #060f1e 0%, #030a14 48%, #010508 100%)' }}
    >
      {/* BACKGROUND ORBS */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -120, background: 'radial-gradient(circle, rgba(0,210,185,0.07) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 480, height: 480, bottom: -80, right: -80, background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 4 }} />

      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.026]" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pgrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(34,211,238,1)" strokeWidth="0.4" />
          </pattern>
          <radialGradient id="pgfade" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="pgm"><rect width="100%" height="100%" fill="url(#pgfade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#pgrid)" mask="url(#pgm)" />
      </svg>

      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 14 }).map((_, i) => <Particle key={i} index={i} />)}
      </div>

      {/* HEADER */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={t('profile.title')} subtitle={t('profile.subtitle')} centered />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-3 sm:px-5 py-5 max-w-4xl mx-auto w-full pb-32">

        {/* TAB BAR */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex gap-1 mb-6 p-1 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(2,8,22,0.92), rgba(4,14,32,0.90))',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.30), transparent)' }} />
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); sessionStorage.removeItem('profile-tab'); }}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black tracking-wide transition-colors z-10"
              style={{ color: activeTab === tab.key ? tab.color : 'rgba(100,116,139,0.7)' }}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(145deg, ${tab.color}15, ${tab.color}08)`,
                    border: `1px solid ${tab.color}30`,
                    boxShadow: `0 0 20px ${tab.color}10`,
                  }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                />
              )}
              <span className="relative">{tab.icon}</span>
              <span className="relative hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">

          {/* PROFILE TAB */}
          {activeTab === 'PROFILE' && (
            <motion.div
              key="profile"
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {/* Hero card */}
              <div
                className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
                style={{
                  background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
                  border: '1px solid rgba(34,211,238,0.18)',
                  backdropFilter: 'blur(32px)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.65), transparent)' }} />
                <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 65%)', filter: 'blur(28px)' }} />

                <div className="relative flex items-center gap-5">
                  <div className="relative shrink-0">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1.5px solid rgba(34,211,238,0.35)' }}
                      animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-black text-white"
                      style={{
                        background: 'linear-gradient(145deg, rgba(34,211,238,0.22), rgba(52,211,153,0.18))',
                        border: '1px solid rgba(34,211,238,0.30)',
                        boxShadow: '0 0 24px rgba(34,211,238,0.22)',
                        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      }}
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-black text-xl sm:text-2xl leading-tight text-transparent bg-clip-text"
                      style={{ backgroundImage: 'linear-gradient(90deg, #e2e8f0, #94a3b8)' }}
                    >
                      {user.displayName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <FiCalendar size={10} style={{ color: 'rgba(34,211,238,0.60)' }} />
                      <p className="text-[10px] font-semibold" style={{ color: 'rgba(34,211,238,0.60)' }}>
                        {t('profile.memberSince')} {new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleOpenEdit}
                    whileHover={{ scale: 1.06, boxShadow: '0 0 20px rgba(34,211,238,0.30)' }}
                    whileTap={{ scale: 0.95 }}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide"
                    style={{
                      background: 'rgba(34,211,238,0.10)',
                      border: '1px solid rgba(34,211,238,0.28)',
                      color: '#22d3ee',
                    }}
                  >
                    <FiEdit3 size={13} />
                    <span className="hidden sm:inline">{t('common.edit')}</span>
                  </motion.button>
                </div>
              </div>

              {/* KPI grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <FiActivity />,  value: stats.predictions, label: t('profile.stats.predictions'), color: '#22d3ee', glow: '#22d3ee', bg: 'rgba(34,211,238,0.07)',  delay: 0.05 },
                  { icon: <FiCrosshair />, value: stats.acertadas,   label: t('profile.stats.exact'),       color: '#34d399', glow: '#34d399', bg: 'rgba(52,211,153,0.07)',  delay: 0.10 },
                  { icon: <FiAward />,     value: stats.puntos,      label: t('profile.stats.points'),      color: '#fbbf24', glow: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  delay: 0.15 },
                  { icon: <FiBarChart2 />, value: stats.rankGlobal > 0 ? `#${stats.rankGlobal}` : '—', label: t('profile.stats.ranking'), color: '#38bdf8', glow: '#38bdf8', bg: 'rgba(56,189,248,0.07)', delay: 0.20 },
                ].map(({ icon, value, label, color, glow, bg, delay }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: -10, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3, scale: 1.03 }}
                    className="relative overflow-hidden rounded-2xl p-4 cursor-default"
                    style={{
                      background: `linear-gradient(145deg, ${bg}, rgba(2,8,20,0.96))`,
                      border: `1px solid ${glow}30`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 8px 28px ${glow}14, inset 0 1px 0 rgba(255,255,255,0.03)`,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-black tracking-[0.26em] uppercase" style={{ color: `${glow}80` }}>{label}</p>
                      <span style={{ color, fontSize: 13, filter: `drop-shadow(0 0 5px ${glow})` }}>{icon}</span>
                    </div>
                    <motion.p
                      className="text-2xl font-black tabular-nums leading-none"
                      style={{ color, textShadow: `0 0 20px ${glow}80` }}
                      animate={{ textShadow: [`0 0 16px ${glow}70`, `0 0 30px ${glow}`, `0 0 16px ${glow}70`] }}
                      transition={{ duration: 2.8 + delay * 4, repeat: Infinity }}
                    >
                      {value}
                    </motion.p>
                    <div className="mt-2">
                      <EQBars color={`${glow}80`} count={8} maxH={12} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance card */}
              <div
                className="relative overflow-hidden rounded-3xl p-5"
                style={{
                  background: 'linear-gradient(145deg, rgba(2,8,22,0.98), rgba(4,14,30,0.97))',
                  border: '1px solid rgba(52,211,153,0.15)',
                  backdropFilter: 'blur(28px)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.55), transparent)' }} />
                <SectionLabel color="#34d399">{t('profile.performance')}</SectionLabel>
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <Ring value={accuracyPct} max={100} size={80} stroke={6} color="#34d399" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-black text-emerald-300 leading-none tabular-nums"
                        style={{ textShadow: '0 0 14px rgba(52,211,153,0.8)' }}>
                        {accuracyPct}%
                      </p>
                      <p className="text-[6px] font-black text-slate-600 tracking-[0.2em] uppercase mt-0.5">{t('profile.stats.exact')}</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: t('profile.stats.predictions'), value: stats.predictions, max: 64,                     color: '#22d3ee' },
                      { label: t('profile.stats.exact'),       value: stats.acertadas,   max: stats.predictions || 1, color: '#34d399' },
                      { label: t('profile.stats.points'),      value: stats.puntos,      max: 192,                    color: '#fbbf24' },
                    ].map(({ label, value, max, color }) => (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-500 tracking-wide">{label}</span>
                          <span className="text-[10px] font-black tabular-nums" style={{ color }}>{value}</span>
                        </div>
                        <GlowBar value={value} max={max} color={color} height={3} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account actions */}
              <div
                className="relative overflow-hidden rounded-3xl p-5"
                style={{
                  background: 'linear-gradient(145deg, rgba(2,8,22,0.98), rgba(14,4,4,0.96))',
                  border: '1px solid rgba(239,68,68,0.12)',
                  backdropFilter: 'blur(28px)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.35), transparent)' }} />
                <SectionLabel color="#f87171">{t('profile.accountActions')}</SectionLabel>
                <div className="space-y-2">
                  {[
                    { label: t('profile.changePassword'), icon: <FiLock size={15} />,   color: '#22d3ee', border: 'rgba(34,211,238,0.20)', bg: 'rgba(34,211,238,0.06)', action: handleOpenPassword },
                    { label: t('profile.logout'),         icon: <FiLogOut size={15} />, color: '#f87171', border: 'rgba(239,68,68,0.20)',  bg: 'rgba(239,68,68,0.06)',  action: () => setShowLogout(true) },
                  ].map(({ label, icon, color, border, bg, action }) => (
                    <motion.button
                      key={label}
                      onClick={action}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all text-left"
                      style={{ background: bg, border: `1px solid ${border}` }}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ color }}>{icon}</span>
                        <span className="text-sm font-bold" style={{ color }}>{label}</span>
                      </div>
                      <span style={{ color: `${color}60`, fontSize: 12 }}>›</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'FAVORITES' && (
            <motion.div
              key="favorites"
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {favoriteTeams.length > 0 && (
                <div
                  className="relative overflow-hidden rounded-3xl p-5"
                  style={{
                    background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
                    border: '1px solid rgba(244,114,182,0.18)',
                    backdropFilter: 'blur(32px)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(244,114,182,0.55), transparent)' }} />
                  <SectionLabel color="#f472b6">{t('profile.myTeams')}</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {favoriteTeams.map(team => (
                      <motion.div
                        key={team.id}
                        whileHover={{ scale: 1.04 }}
                        className="relative group cursor-pointer rounded-2xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div className="aspect-square p-2 flex items-center justify-center">
                          <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <motion.div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl"
                          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.18 }}
                          onClick={() => setFavoriteTeams(p => p.filter(t => t.id !== team.id))}
                        >
                          <FiTrash2 size={16} style={{ color: '#f87171' }} />
                          <span className="text-[9px] font-black text-red-300 tracking-wide">{t('common.delete')}</span>
                        </motion.div>
                        <p className="text-[10px] font-black text-center py-1.5 text-slate-400 tracking-wide">{team.shortName}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {allTeams.filter(t => !favoriteTeams.find(f => f.id === t.id)).length > 0 && (
                <div
                  className="relative overflow-hidden rounded-3xl p-5"
                  style={{
                    background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
                    border: '1px solid rgba(34,211,238,0.14)',
                    backdropFilter: 'blur(32px)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.40), transparent)' }} />
                  <SectionLabel color="#22d3ee">{t('profile.addTeams')}</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {allTeams
                      .filter(tm => !favoriteTeams.find(f => f.id === tm.id))
                      .map(team => (
                        <motion.div
                          key={team.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            if (!favoriteTeams.find(f => f.id === team.id))
                              setFavoriteTeams(p => [...p, team]);
                          }}
                          className="relative group cursor-pointer rounded-2xl overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="aspect-square p-2 flex items-center justify-center">
                            <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover rounded-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <motion.div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl"
                            style={{ background: 'rgba(34,211,238,0.12)', backdropFilter: 'blur(4px)' }}
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.18 }}
                          >
                            <FiPlus size={16} style={{ color: '#22d3ee' }} />
                            <span className="text-[9px] font-black text-cyan-300 tracking-wide">+</span>
                          </motion.div>
                          <p className="text-[10px] font-black text-center py-1.5 text-slate-500 tracking-wide">{team.shortName}</p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {favoriteTeams.length === 0 && allTeams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <FiHeart size={40} style={{ opacity: 0.3 }} />
                  <p className="text-sm font-semibold mt-3">{t('profile.noFavorites')}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'SETTINGS' && (
            <motion.div
              key="settings"
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {/* Language */}
              <div
                className="relative overflow-hidden rounded-3xl p-5"
                style={{
                  background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
                  border: '1px solid rgba(34,211,238,0.14)',
                  backdropFilter: 'blur(32px)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.40), transparent)' }} />
                <SectionLabel color="#22d3ee">{t('profile.settings.language')}</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {locales.map(code => {
                    const cfg = localeConfig[code];
                    const active = language === code;
                    const flags: Record<string, string> = { es:'🇪🇸', en:'🇺🇸', fr:'🇫🇷', de:'🇩🇪', pt:'🇧🇷', ru:'🇷🇺', ar:'🇸🇦' };
                    return (
                      <motion.button
                        key={code}
                        onClick={() => handleSelectLanguage(code)}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all"
                        style={{
                          background: active ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${active ? 'rgba(34,211,238,0.28)' : 'rgba(255,255,255,0.06)'}`,
                          boxShadow: active ? '0 0 14px rgba(34,211,238,0.08)' : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none">{flags[code]}</span>
                          <div>
                            <p className="text-sm font-bold" style={{ color: active ? '#e2e8f0' : '#64748b' }}>{cfg.label}</p>
                            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(100,116,139,0.45)' }}>{code}</p>
                          </div>
                        </div>
                        <AnimatePresence>
                          {active && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <FiCheck size={14} style={{ color: '#22d3ee' }} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div
                className="relative overflow-hidden rounded-3xl p-5"
                style={{
                  background: 'linear-gradient(145deg, rgba(2,8,24,0.98), rgba(4,14,36,0.97))',
                  border: '1px solid rgba(251,191,36,0.12)',
                  backdropFilter: 'blur(32px)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.40), transparent)' }} />
                <SectionLabel color="#fbbf24">{t('profile.settings.notifications')}</SectionLabel>
                <div className="space-y-2">
                  {[
                    { key: 'fixtureReminders',    label: t('profile.settings.fixtureReminders'),    icon: <FiCalendar size={14} />,  color: '#22d3ee' },
                    { key: 'resultNotifications', label: t('profile.settings.resultNotifications'), icon: <FiZap size={14} />,       color: '#fbbf24' },
                    { key: 'leagueUpdates',       label: t('profile.settings.leagueUpdates'),       icon: <FiBarChart2 size={14} />, color: '#34d399' },
                    { key: 'newsUpdates',         label: t('profile.settings.newsUpdates'),         icon: <FiBell size={14} />,      color: '#f472b6' },
                  ].map(notif => {
                    const on = notifications[notif.key as keyof typeof notifications];
                    return (
                      <div
                        key={notif.key}
                        className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                        style={{
                          background: on ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${on ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span style={{ color: on ? notif.color : 'rgba(100,116,139,0.4)' }}>{notif.icon}</span>
                          <p className="text-sm font-semibold" style={{ color: on ? '#94a3b8' : '#475569' }}>{notif.label}</p>
                        </div>
                        <Toggle
                          checked={on}
                          onChange={v => setNotifications(p => ({ ...p, [notif.key]: v }))}
                          color={notif.color}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save button */}
              <motion.button
                onClick={handleSaveSettings}
                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,210,185,0.45)' }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full py-3.5 rounded-2xl font-black text-sm text-white tracking-wide overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4, #0ea5e9)', boxShadow: '0 6px 24px rgba(0,210,185,0.28)' }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.18) 50%, transparent 72%)' }}
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
                <AnimatePresence mode="wait">
                  {settingsSaved ? (
                    <motion.span
                      key="saved"
                      className="relative flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <FiCheck size={15} /> {t('profile.settings.saved')}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
                      className="relative flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <FiSave size={15} /> {t('profile.settings.save')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* MODAL: EDIT PROFILE */}
      <AnimatePresence>
        {showEdit && (
          <DarkModal onClose={() => setShowEdit(false)}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}>
                    <FiEdit3 size={14} style={{ color: '#22d3ee' }} />
                  </div>
                  <h2 className="text-base font-black text-slate-200 tracking-wide">{t('profile.edit.title')}</h2>
                </div>
                <button onClick={() => setShowEdit(false)} className="opacity-40 hover:opacity-80 transition-opacity">
                  <FiX size={16} style={{ color: '#94a3b8' }} />
                </button>
              </div>

              <AnimatePresence>
                {editError && <ModalAlert message={editError} type="error" />}
                {editOk    && <ModalAlert message={editOk}    type="success" />}
              </AnimatePresence>

              <div className="space-y-4">
                <DarkInput
                  id="ep-name"
                  label={t('profile.edit.name')}
                  value={editName}
                  onChange={setEditName}
                  placeholder={t('profile.edit.namePlaceholder')}
                  icon={<FiUser size={14} />}
                  autoComplete="name"
                />
                <DarkInput
                  id="ep-email"
                  label={t('profile.edit.email')}
                  type="email"
                  value={editEmail}
                  onChange={setEditEmail}
                  placeholder={t('profile.edit.emailPlaceholder')}
                  icon={<FiMail size={14} />}
                  autoComplete="email"
                />
              </div>

              <div className="flex gap-2.5 mt-6">
                <motion.button
                  onClick={() => setShowEdit(false)}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(0,210,185,0.38)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', boxShadow: '0 4px 16px rgba(0,210,185,0.22)' }}
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
        )}
      </AnimatePresence>

      {/* MODAL: CHANGE PASSWORD */}
      <AnimatePresence>
        {showPassword && (
          <DarkModal onClose={() => setShowPassword(false)}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}>
                    <FiShield size={14} style={{ color: '#22d3ee' }} />
                  </div>
                  <h2 className="text-base font-black text-slate-200 tracking-wide">{t('profile.password.title')}</h2>
                </div>
                <button onClick={() => setShowPassword(false)} className="opacity-40 hover:opacity-80 transition-opacity">
                  <FiX size={16} style={{ color: '#94a3b8' }} />
                </button>
              </div>

              <AnimatePresence>
                {pwdError && <ModalAlert message={pwdError} type="error" />}
                {pwdOk    && <ModalAlert message={pwdOk}    type="success" />}
              </AnimatePresence>

              <div className="space-y-4">
                <DarkInput
                  id="cp-cur"
                  label={t('profile.password.current')}
                  value={curPwd}
                  onChange={setCurPwd}
                  placeholder={t('profile.password.currentPlaceholder')}
                  icon={<FiLock size={14} />}
                  autoComplete="current-password"
                  showToggle
                  show={showCur}
                  onToggle={() => setShowCur(p => !p)}
                />
                <DarkInput
                  id="cp-new"
                  label={t('profile.password.new')}
                  value={newPwd}
                  onChange={setNewPwd}
                  placeholder={t('profile.password.newPlaceholder')}
                  icon={<FiLock size={14} />}
                  autoComplete="new-password"
                  showToggle
                  show={showNew}
                  onToggle={() => setShowNew(p => !p)}
                />
                <DarkInput
                  id="cp-con"
                  label={t('profile.password.confirm')}
                  value={conPwd}
                  onChange={setConPwd}
                  placeholder={t('profile.password.confirmPlaceholder')}
                  icon={<FiLock size={14} />}
                  autoComplete="new-password"
                  showToggle
                  show={showCon}
                  onToggle={() => setShowCon(p => !p)}
                />
              </div>

              <div className="flex gap-2.5 mt-6">
                <motion.button
                  onClick={() => setShowPassword(false)}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  onClick={handleSavePassword}
                  disabled={pwdLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(0,210,185,0.38)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)', boxShadow: '0 4px 16px rgba(0,210,185,0.22)' }}
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
        )}
      </AnimatePresence>

      {/* MODAL: LOGOUT CONFIRM */}
      <AnimatePresence>
        {showLogout && (
          <DarkModal onClose={() => setShowLogout(false)} width="w-[min(360px,88vw)]">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <FiLogOut size={22} style={{ color: '#f87171' }} />
                </div>
              </div>
              <h2 className="text-base font-black text-slate-200 mb-1.5">{t('profile.logout')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {t('profile.logoutConfirm')}<br />{t('profile.logoutSub')}
              </p>
              <div className="flex gap-2.5">
                <motion.button
                  onClick={() => setShowLogout(false)}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.22)' }}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <FiLogOut size={13} /> {t('profile.logout')}
                  </span>
                </motion.button>
              </div>
            </div>
          </DarkModal>
        )}
      </AnimatePresence>
    </div>
  );
}
