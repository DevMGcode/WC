'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation';
import { Button, Card } from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [favoriteTeams, setFavoriteTeams] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'FAVORITES' | 'SETTINGS'>('PROFILE');
  const [language, setLanguage] = useState('es');
  const [notifications, setNotifications] = useState({
    fixtureReminders: true,
    resultNotifications: true,
    leagueUpdates: true,
    newsUpdates: false,
  });

  // Modales
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Formulario Editar Perfil
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Formulario Cambiar Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (authUser) {
      setUser({
        id: authUser.id,
        displayName: authUser.displayName,
        email: authUser.email,
        joinedAt: new Date(authUser.createdAt),
      });
    }

    setFavoriteTeams([
      { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
      { id: 2, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
    ]);

    setLanguage(localStorage.getItem('language') || 'es');
  }, [authUser, authLoading, isAuthenticated, router]);

  // ===== MODAL: Editar Perfil =====
  const handleOpenEditProfileModal = () => {
    setEditName(user?.displayName || '');
    setEditEmail(user?.email || '');
    setEditError('');
    setEditSuccess('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    setEditError('');
    setEditSuccess('');

    if (!editName.trim()) {
      setEditError('El nombre no puede estar vacío');
      return;
    }

    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEditError('El email no es válido');
      return;
    }

    try {
      const userId = authUser?.id || user?.id;
      if (!userId) {
        setEditError('No se pudo identificar el usuario autenticado');
        return;
      }

      const response = await fetch(`/api/v1/public/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editName.trim(),
          email: editEmail.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setEditError(payload?.message || 'Error al actualizar el perfil');
        return;
      }

      setUser((prev: any) => ({
        ...prev,
        displayName: editName.trim(),
        email: editEmail.trim(),
      }));

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.displayName = editName.trim();
          parsed.email = editEmail.trim();
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      }

      setEditSuccess('Perfil actualizado correctamente');
      setTimeout(() => setShowEditProfileModal(false), 1500);
    } catch (error) {
      setEditError('Error al actualizar el perfil');
    }
  };

  // ===== MODAL: Cambiar Contraseña =====
  const handleOpenChangePasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowChangePasswordModal(true);
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword.trim()) {
      setPasswordError('Ingresa tu contraseña actual');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 5) {
      setPasswordError('La nueva contraseña debe tener al menos 5 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      const userId = authUser?.id || user?.id;
      if (!userId) {
        setPasswordError('No se pudo identificar el usuario autenticado');
        return;
      }

      const response = await fetch(`/api/v1/public/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setPasswordError(payload?.message || 'Error al cambiar la contraseña');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setPasswordSuccess('Contraseña cambiada correctamente');
      setTimeout(() => setShowChangePasswordModal(false), 1500);
    } catch (error) {
      setPasswordError('Error al cambiar la contraseña. Verifica tu contraseña actual');
    }
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      window.sessionStorage.removeItem('orionix-dock-visible');
      window.location.replace('/login');
    }
  };

  if (authLoading || !user) {
    return null;
  }

  const handleRemoveFavorite = (teamId: number) => {
    setFavoriteTeams((prev) => prev.filter((t) => t.id !== teamId));
  };

  const handleSaveSettings = () => {
    // Save to backend
    console.log('Settings saved', { language, notifications });
  };

  const allTeams = [
    { id: 1, name: 'Argentina', shortName: 'ARG', flagUrl: 'https://flagcdn.com/ar.svg' },
    { id: 2, name: 'Brasil', shortName: 'BRA', flagUrl: 'https://flagcdn.com/br.svg' },
    { id: 3, name: 'España', shortName: 'ESP', flagUrl: 'https://flagcdn.com/es.svg' },
    { id: 4, name: 'Alemania', shortName: 'ALE', flagUrl: 'https://flagcdn.com/de.svg' },
    { id: 5, name: 'Francia', shortName: 'FRA', flagUrl: 'https://flagcdn.com/fr.svg' },
    { id: 6, name: 'México', shortName: 'MEX', flagUrl: 'https://flagcdn.com/mx.svg' },
    { id: 7, name: 'Colombia', shortName: 'COL', flagUrl: 'https://flagcdn.com/co.svg' },
    { id: 8, name: 'Uruguay', shortName: 'URU', flagUrl: 'https://flagcdn.com/uy.svg' },
  ];

  const handleAddFavorite = (teamId: number) => {
    const team = allTeams.find((t) => t.id === teamId);
    if (team && !favoriteTeams.find((t) => t.id === teamId)) {
      setFavoriteTeams((prev) => [...prev, team]);
    }
  };

  return (
    <div className="w-full">
      <Header title="👤 Mi Perfil" subtitle="Configuración y preferencias" centered />

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto w-full pb-32">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass-premium rounded-xl p-1.5 hover-lift-premium">
          {(['PROFILE', 'FAVORITES', 'SETTINGS'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.98 }}
              className={`relative flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab
                  ? 'text-white'
                  : 'bg-transparent text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="profile-tab-pill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-cyan-500/30"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative z-10">
              {tab === 'PROFILE' && '👤 Perfil'}
              {tab === 'FAVORITES' && '⭐ Favoritos'}
              {tab === 'SETTINGS' && '⚙️ Configuración'}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {/* Profile Tab */}
        {activeTab === 'PROFILE' && user && (
          <motion.div
            key="profile-tab"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* User Card */}
            <Card className="glass-premium hover-lift-premium border border-cyan-200/35">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 via-cyan-700 to-emerald-500 flex items-center justify-center text-white text-4xl font-black flex-shrink-0 shadow-xl shadow-cyan-500/30">
                  {user.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-slate-800 mb-1">{user.displayName}</h2>
                  <p className="text-slate-600 text-sm mb-2">{user.email}</p>
                  <p className="text-xs text-cyan-700 font-semibold">
                    Miembro desde {new Date(user.joinedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleOpenEditProfileModal}
                className="w-full text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
              >
                Editar Perfil
              </Button>
            </Card>

            {/* Statistics */}
            <Card className="glass-premium hover-lift-premium border border-cyan-200/35">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                📊 Mi Desempeño
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 glass-premium-dark rounded-lg neon-outline-cyan">
                  <p className="text-2xl font-black text-cyan-100">42</p>
                  <p className="text-xs text-cyan-300 font-semibold">Predicciones</p>
                </div>
                <div className="text-center p-3 glass-premium-dark rounded-lg border border-emerald-300/30">
                  <p className="text-2xl font-black text-emerald-200">26</p>
                  <p className="text-xs text-emerald-300 font-semibold">Acertadas</p>
                </div>
                <div className="text-center p-3 glass-premium-dark rounded-lg border border-amber-300/30">
                  <p className="text-2xl font-black text-amber-200">2,850</p>
                  <p className="text-xs text-amber-300 font-semibold">Puntos</p>
                </div>
                <div className="text-center p-3 glass-premium-dark rounded-lg border border-cyan-300/30">
                  <p className="text-2xl font-black text-cyan-200">#15</p>
                  <p className="text-xs text-cyan-300 font-semibold">Ranking Global</p>
                </div>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="glass-premium border border-rose-300/40 hover-lift-premium">
              <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                ⚠️ Acciones de Cuenta
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleOpenChangePasswordModal}
                  className="w-full text-cyan-800 hover:text-cyan-900 border-cyan-300/70 bg-gradient-to-r from-white/85 via-cyan-50/70 to-white/85 hover:from-cyan-100/90 hover:to-sky-100/90 shadow-[0_8px_20px_rgba(6,182,212,0.16)] hover:shadow-[0_12px_24px_rgba(6,182,212,0.24)]"
                >
                  🔑 Cambiar Contraseña
                </Button>
                <Button type="button" variant="danger" className="w-full" onClick={handleLogout}>
                  ❌ Cerrar Sesión
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'FAVORITES' && (
          <motion.div
            key="favorites-tab"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Current Favorites */}
            {favoriteTeams.length > 0 && (
              <Card className="glass-premium hover-lift-premium border border-cyan-200/35">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  ⭐ Equipos Favoritos
                </h3>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {favoriteTeams.map((team) => (
                    <div
                      key={team.id}
                      className="relative group cursor-pointer"
                      onClick={() => handleRemoveFavorite(team.id)}
                    >
                      <div className="rounded-lg overflow-hidden bg-gray-100 p-2 aspect-square flex items-center justify-center">
                        <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-black text-lg">✕</span>
                      </div>
                      <p className="text-xs font-bold text-center mt-2 text-slate-800">{team.shortName}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Add More */}
            <Card className="glass-premium hover-lift-premium border border-cyan-200/35">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                ➕ Agregar Favoritos
              </h3>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {allTeams
                  .filter((t) => !favoriteTeams.find((f) => f.id === t.id))
                  .map((team) => (
                    <div
                      key={team.id}
                      onClick={() => handleAddFavorite(team.id)}
                      className="rounded-lg overflow-hidden bg-gray-100 p-2 aspect-square flex items-center justify-center cursor-pointer hover:ring-4 ring-cyan-400 transition-all transform hover:scale-105"
                    >
                      <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'SETTINGS' && (
          <motion.div
            key="settings-tab"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Language */}
            <Card className="glass-premium hover-lift-premium border border-cyan-200/35">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                🌍 Idioma
              </h3>

              <div className="space-y-3">
                {[{ code: 'es', flag: '🇪🇸', name: 'Español' }, { code: 'en', flag: '🇺🇸', name: 'English' }].map(
                  (lang) => (
                    <label
                      key={lang.code}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        language === lang.code
                          ? 'border-cyan-400 bg-cyan-100/50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="language"
                        value={lang.code}
                        checked={language === lang.code}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer"
                      />
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-semibold text-slate-800 flex-1">{lang.name}</span>
                    </label>
                  )
                )}
              </div>
            </Card>

            {/* Notifications */}
            <Card className="glass-premium hover-lift-premium border border-cyan-200/35">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                🔔 Notificaciones
              </h3>

              <div className="space-y-3">
                {[
                  { key: 'fixtureReminders', label: 'Recordatorios de partidos', icon: '📅' },
                  { key: 'resultNotifications', label: 'Notificación de resultados', icon: '⚽' },
                  { key: 'leagueUpdates', label: 'Actualizaciones de ligas', icon: '👥' },
                  { key: 'newsUpdates', label: 'Noticias y actualizaciones', icon: '📰' },
                ].map((notif) => (
                  <label
                    key={notif.key}
                    className="flex items-center gap-3 p-4 bg-white/80 rounded-lg border-2 border-gray-200 hover:border-cyan-300 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={notifications[notif.key as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [notif.key]: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-xl">{notif.icon}</span>
                    <span className="font-semibold text-slate-800 flex-1">{notif.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Save Settings */}
            <Button className="w-full" onClick={handleSaveSettings}>
              💾 Guardar Cambios
            </Button>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* MODAL: Editar Perfil */}
      <AnimatePresence>
        {showEditProfileModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowEditProfileModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-96 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="text-2xl font-black text-slate-800 mb-4">✏️ Editar Perfil</h2>

              {editError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  {editSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-cyan-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-cyan-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSaveProfile}>
                  Guardar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL: Cambiar Contraseña */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowChangePasswordModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-96 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="text-2xl font-black text-slate-800 mb-4">🔑 Cambiar Contraseña</h2>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Contraseña Actual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-cyan-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Tu contraseña actual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-cyan-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Nueva contraseña"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-cyan-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Confirma tu contraseña"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSavePassword}>
                  Guardar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
