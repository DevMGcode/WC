'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/locales';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiHeart, FiSettings, FiAward } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Navigation';
import { getCurrentTournament } from '@/services/publicTournament';
import { useTranslations } from 'next-intl';
import { hex } from '@/lib/design/tokens';
import { alpha, alphaOf } from '@/lib/design/effects';
import { apiFetch } from '@/lib/apiFetch';

import { Particle } from './_components/ui';
import ProfileTab        from './_components/ProfileTab';
import FavoritesTab      from './_components/FavoritesTab';
import AchievementsTab   from './_components/AchievementsTab';
import SettingsTab       from './_components/SettingsTab';
import EditProfileModal  from './_components/EditProfileModal';
import ChangePasswordModal from './_components/ChangePasswordModal';
import LogoutModal       from './_components/LogoutModal';
import { favoriteTeamsService, type FavoriteTeam, type PublicTeam } from '@/services/favoriteTeams';
import { notificationsService } from '@/services/notifications';
import { usePremium } from '@/hooks/usePremium';
import { AdSlot } from '@/components/ads';

export default function ProfilePage() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
  const t = useTranslations();

  const [user, setUser]                   = useState<any>(null);
  const { isPremium }                     = usePremium();

  // Favoritos múltiples conectados al backend
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeam[]>([]);
  const [allTeams,      setAllTeams]      = useState<PublicTeam[]>([]);
  const [favsLoading,   setFavsLoading]   = useState(true);
  const [favsError,     setFavsError]     = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<'PROFILE' | 'FAVORITES' | 'ACHIEVEMENTS' | 'SETTINGS'>(
    () => (typeof window !== 'undefined' ? (sessionStorage.getItem('profile-tab') as any) || 'PROFILE' : 'PROFILE')
  );
  const [tournamentId, setTournamentId]   = useState<number>(1);
  const [language, setLanguage]           = useState('es');
  const [langOpen, setLangOpen]           = useState(false);
  const langRef                           = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const urlLocale = pathname.split('/')[1];
    if (locales.includes(urlLocale as any)) {
      setLanguage(urlLocale);
    } else {
      setLanguage(localStorage.getItem('language') || 'es');
    }
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Carga las preferencias de notificación reales del backend (fuente única,
  // compartida con el onboarding). Antes el tab arrancaba con defaults fijos.
  useEffect(() => {
    if (!authUser?.id) return;
    let alive = true;
    notificationsService.get(authUser.id)
      .then(prefs => { if (alive) setNotifications(prefs); })
      .catch(() => { /* sin red: se quedan los defaults locales */ });
    return () => { alive = false; };
  }, [authUser?.id]);

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
          setTournamentId(tournamentId);
          const userId = authUser.id;
          const [predRes, scoreRes] = await Promise.all([
            apiFetch(`/api/v1/predictions/user/${userId}`),
            apiFetch(`/api/v1/scores/user/${tournamentId}?userId=${userId}`),
          ]);
          const predictions = predRes.ok ? ((await predRes.json())?.data ?? []).length : 0;
          let acertadas = 0, puntos = 0, rankGlobal = 0;
          if (scoreRes.ok) {
            const score = (await scoreRes.json())?.data;
            acertadas  = score?.exactScores   ?? 0;
            puntos     = score?.totalPoints   ?? 0;
            rankGlobal = score?.rankPosition  ?? 0;
          }
          setStats({ predictions, acertadas, puntos, rankGlobal });
        } catch { /* ignore */ }
      };
      fetchStats();
    }
  }, [authUser, authLoading, isAuthenticated, router]);

  // Cargar equipos disponibles + favoritos del usuario
  useEffect(() => {
    if (!authUser?.id) return;
    let cancelled = false;
    const fetchFavorites = async () => {
      setFavsLoading(true);
      setFavsError(null);
      try {
        const [favs, teams] = await Promise.all([
          favoriteTeamsService.list(authUser.id),
          favoriteTeamsService.listAllTeams(),
        ]);
        if (cancelled) return;
        setFavoriteTeams(favs);
        setAllTeams(teams);
      } catch (e: any) {
        if (!cancelled) setFavsError(e?.message || 'No se pudieron cargar los favoritos');
      } finally {
        if (!cancelled) setFavsLoading(false);
      }
    };
    fetchFavorites();
    return () => { cancelled = true; };
  }, [authUser?.id]);

  // ── Handlers favoritos ───────────────────────────────────────────────────

  const handleAddFavorite = async (teamId: number) => {
    if (!authUser?.id) return;
    setFavsError(null);
    try {
      const added = await favoriteTeamsService.add(authUser.id, teamId);
      // Recargar la lista para que el orden y principal queden bien
      const refreshed = await favoriteTeamsService.list(authUser.id);
      setFavoriteTeams(refreshed);
      void added;
    } catch (e: any) {
      setFavsError(e?.message || 'No se pudo agregar el equipo');
    }
  };

  const handleRemoveFavorite = async (teamId: number) => {
    if (!authUser?.id) return;
    setFavsError(null);
    try {
      await favoriteTeamsService.remove(authUser.id, teamId);
      const refreshed = await favoriteTeamsService.list(authUser.id);
      setFavoriteTeams(refreshed);
    } catch (e: any) {
      setFavsError(e?.message || 'No se pudo quitar el equipo');
    }
  };

  const handleSetPrimaryFavorite = async (teamId: number) => {
    if (!authUser?.id) return;
    setFavsError(null);
    try {
      await favoriteTeamsService.setPrimary(authUser.id, teamId);
      const refreshed = await favoriteTeamsService.list(authUser.id);
      setFavoriteTeams(refreshed);
    } catch (e: any) {
      setFavsError(e?.message || 'No se pudo marcar como principal');
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenEdit = () => {
    setEditName(user?.displayName || ''); setEditEmail(user?.email || '');
    setEditError(''); setEditOk(''); setShowEdit(true);
  };

  const handleSaveProfile = async () => {
    setEditError(''); setEditOk('');
    if (!editName.trim()) { setEditError(t('profile.edit.nameRequired')); return; }
    if (!editEmail.trim() || !editEmail.includes('@')) { setEditError(t('profile.edit.emailInvalid')); return; }
    setEditLoading(true);
    try {
      const userId = authUser?.id || user?.id;
      const res = await apiFetch(`/api/v1/users/${userId}/profile`, {
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
    setPwdError(''); setPwdOk(''); setShowPassword(true);
  };

  const handleSavePassword = async () => {
    setPwdError(''); setPwdOk('');
    if (!curPwd.trim()) { setPwdError(t('profile.password.currentRequired')); return; }
    if (newPwd.length < 5) { setPwdError(t('profile.password.tooShort')); return; }
    if (newPwd !== conPwd) { setPwdError(t('profile.password.noMatch')); return; }
    setPwdLoading(true);
    try {
      const userId = authUser?.id || user?.id;
      const res = await apiFetch(`/api/v1/users/${userId}/password`, {
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

  const handleSaveSettings = () => {
    localStorage.setItem('language', language);
    // Persiste las preferencias en el backend (fuente única). El onboarding lee
    // estas mismas. Si falla la red, no bloquea el resto de "Guardar".
    if (authUser?.id) {
      notificationsService.update(authUser.id, notifications).catch(() => { /* reintenta al volver */ });
    }
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

  const tabs = [
    { key: 'PROFILE',   label: t('profile.tabs.profile'),   icon: <FiUser size={14} />,     color: hex.green.bright },
    { key: 'FAVORITES', label: t('profile.tabs.favorites'), icon: <FiHeart size={14} />,    color: hex.accent.pink },
    { key: 'ACHIEVEMENTS', label: t('profile.tabs.achievements'), icon: <FiAward size={14} />, color: hex.gold.base },
    { key: 'SETTINGS',  label: t('profile.tabs.settings'),  icon: <FiSettings size={14} />, color: hex.green.hover },
  ] as const;

  return (
    <div className="w-full relative">
      {/* Background orbs */}
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: -180, left: -120, background: `radial-gradient(circle, ${alpha(hex.green.hover, 0.07)} 0%, transparent 65%)`, filter: 'blur(80px)', zIndex: 0 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed rounded-full pointer-events-none"
        style={{ width: 480, height: 480, bottom: -80, right: -80, background: `radial-gradient(circle, ${alpha(hex.accent.pink, 0.06)} 0%, transparent 65%)`, filter: 'blur(70px)', zIndex: 0 }}
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, delay: 4 }} />

      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.026]" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pgrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={hex.green.bright} strokeWidth="0.4" />
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

      {/* Header */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Header title={t('profile.title')} subtitle={t('profile.subtitle')} centered />
      </div>

      {/* Content */}
      <div className="relative z-10 px-3 sm:px-5 py-5 max-w-4xl mx-auto w-full pb-32">

        {/* ── PUBLICIDAD (solo Free) — entre header y tabs ── */}
        <AdSlot />

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex gap-1 mb-6 p-1 rounded-2xl"
          style={{
            background: `linear-gradient(145deg, ${alpha(hex.bg.primary, 0.92)}, ${alpha(hex.bg.secondary, 0.90)})`,
            border: `1px solid ${alpha(hex.neutral.white, 0.07)}`,
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, transparent, ${alphaOf('green', 0.30)}, transparent)` }} />
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); sessionStorage.removeItem('profile-tab'); }}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black tracking-wide transition-colors z-10"
              style={{ color: activeTab === tab.key ? tab.color : alpha(hex.accent.slateDeep, 0.7) }}
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

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'PROFILE' && (
            <ProfileTab
              user={user} stats={stats} t={t}
              onEditProfile={handleOpenEdit}
              onChangePassword={handleOpenPassword}
              onLogout={() => setShowLogout(true)}
            />
          )}
          {activeTab === 'FAVORITES' && (
            <FavoritesTab
              favoriteTeams={favoriteTeams}
              allTeams={allTeams}
              isPremium={isPremium}
              isLoading={favsLoading}
              errorMsg={favsError}
              onAdd={handleAddFavorite}
              onRemove={handleRemoveFavorite}
              onSetPrimary={handleSetPrimaryFavorite}
              t={t}
            />
          )}
          {activeTab === 'ACHIEVEMENTS' && (
            <AchievementsTab
              tournamentId={tournamentId}
              userId={authUser?.id ? Number(authUser.id) : null}
              t={t}
            />
          )}
          {activeTab === 'SETTINGS' && (
            <SettingsTab
              language={language} langOpen={langOpen} langRef={langRef}
              setLangOpen={setLangOpen} onSelectLanguage={setLanguage}
              notifications={notifications} setNotifications={setNotifications}
              onSave={handleSaveSettings} saved={settingsSaved} userId={authUser?.id} t={t}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            editName={editName} setEditName={setEditName}
            editEmail={editEmail} setEditEmail={setEditEmail}
            editError={editError} editOk={editOk} editLoading={editLoading}
            onClose={() => setShowEdit(false)} onSave={handleSaveProfile} t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPassword && (
          <ChangePasswordModal
            curPwd={curPwd} setCurPwd={setCurPwd}
            newPwd={newPwd} setNewPwd={setNewPwd}
            conPwd={conPwd} setConPwd={setConPwd}
            showCur={showCur} setShowCur={setShowCur}
            showNew={showNew} setShowNew={setShowNew}
            showCon={showCon} setShowCon={setShowCon}
            pwdError={pwdError} pwdOk={pwdOk} pwdLoading={pwdLoading}
            onClose={() => setShowPassword(false)} onSave={handleSavePassword} t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogout && (
          <LogoutModal onClose={() => setShowLogout(false)} onConfirm={handleLogout} t={t} />
        )}
      </AnimatePresence>
    </div>
  );
}
