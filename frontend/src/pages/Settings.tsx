import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { 
  useLogout,
  useChangePassword,
  useChangeEmail,
  useDeleteAccount,
  useUserPreferences,
  useUpdateUserPreferences,
} from '../api/auth'
import { 
  User, 
  LogOut, 
  Bell, 
  Shield, 
  ChevronRight,
  GraduationCap,
  Lock,
  Mail,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  // API Hooks
  const logout = useLogout()
  const changePassword = useChangePassword()
  const changeEmail = useChangeEmail()
  const deleteAccount = useDeleteAccount()
  const { data: preferences } = useUserPreferences()
  const updatePreferences = useUpdateUserPreferences()
  
  // Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  // Form States
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [emailForm, setEmailForm] = useState({ new_email: '', password: '' })
  const [deleteForm, setDeleteForm] = useState({ password: '', confirmDelete: false })
  const [profileForm, setProfileForm] = useState({ display_name: user?.display_name || '' })
  
  // UI States
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [learningReminders, setLearningReminders] = useState(preferences?.learning_reminders_enabled ?? true)
  const [weeklyReport, setWeeklyReport] = useState(preferences?.weekly_report_enabled ?? false)

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setLearningReminders(preferences.learning_reminders_enabled)
      setWeeklyReport(preferences.weekly_report_enabled)
    }
  }, [preferences])

  // Handle Password Change
  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Passwörter stimmen nicht überein')
      return
    }
    try {
      await changePassword.mutateAsync({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      })
      alert('Passwort erfolgreich geändert')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
      setShowPasswordModal(false)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Ändern des Passworts')
    }
  }

  // Handle Email Change
  const handleEmailChange = async () => {
    try {
      await changeEmail.mutateAsync({
        new_email: emailForm.new_email,
        password: emailForm.password,
      })
      alert('E-Mail-Adresse erfolgreich geändert')
      setEmailForm({ new_email: '', password: '' })
      setShowEmailModal(false)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Ändern der E-Mail-Adresse')
    }
  }

  // Handle Account Delete
  const handleDeleteAccount = async () => {
    if (!deleteForm.confirmDelete) {
      alert('Bitte bestätigen Sie, dass Sie Ihren Account löschen möchten')
      return
    }
    try {
      await deleteAccount.mutateAsync({ password: deleteForm.password })
      alert('Account erfolgreich gelöscht')
      setShowDeleteModal(false)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Löschen des Accounts')
    }
  }

  // Handle Preferences Update
  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences.mutateAsync({
        learning_reminders_enabled: learningReminders,
        weekly_report_enabled: weeklyReport,
      })
      alert('Einstellungen erfolgreich aktualisiert')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Aktualisieren der Einstellungen')
    }
  }

  // Handle Profile Update
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/users/me/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({ display_name: profileForm.display_name }),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      alert('Profil erfolgreich aktualisiert')
      setShowProfileModal(false)
    } catch (error: any) {
      alert(error.message || 'Fehler beim Aktualisieren des Profils')
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-7 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.display_name?.substring(0, 1).toUpperCase() || user?.email[0].toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-foreground">{user?.display_name || 'Kein Anzeigename'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
            <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
              Student
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">
              Verifiziert
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent text-sm font-medium transition-all"
        >
          Profil bearbeiten
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-indigo-500" />
            <h3 className="text-slate-700 dark:text-foreground font-bold">Benachrichtigungen</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-foreground">Lern-Erinnerungen</p>
                <p className="text-xs text-slate-400">Erinnere mich an geplante Sitzungen</p>
              </div>
              <button 
                onClick={() => {
                  setLearningReminders(!learningReminders)
                  handleUpdatePreferences()
                }}
                className={`w-10 h-5 rounded-full relative transition-all ${
                  learningReminders ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-muted'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                  learningReminders ? 'right-0.5' : 'left-0.5'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-foreground">Wochenbericht</p>
                <p className="text-xs text-slate-400">Statistiken per E-Mail erhalten</p>
              </div>
              <button 
                onClick={() => {
                  setWeeklyReport(!weeklyReport)
                  handleUpdatePreferences()
                }}
                className={`w-10 h-5 rounded-full relative transition-all ${
                  weeklyReport ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-muted'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                  weeklyReport ? 'right-0.5' : 'left-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden col-span-1 md:col-span-2">
          <div className="p-6 border-b border-slate-50 dark:border-border flex items-center gap-2">
            <Shield size={18} className="text-indigo-500" />
            <h3 className="text-slate-700 dark:text-foreground font-bold">Account & Sicherheit</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-border">
            <button 
              onClick={() => setShowEmailModal(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-500">
                  <Mail size={16} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-foreground">E-Mail Adresse ändern</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-500">
                  <Lock size={16} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-foreground">Passwort ändern</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-accent transition-colors text-red-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                  <Trash2 size={16} />
                </div>
                <span className="text-sm font-medium">Account löschen</span>
              </div>
              <ChevronRight size={16} className="text-red-200" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => logout.mutate()}
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-card border border-red-100 dark:border-red-900/20 text-red-500 rounded-2xl py-4 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm"
      >
        <LogOut size={18} />
        Abmelden
      </button>

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-4 pt-4 pb-8">
        <div className="flex items-center gap-2 opacity-30">
          <GraduationCap size={18} />
          <span className="font-bold text-sm tracking-tighter">LERNZEIT MANAGER</span>
        </div>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest">Version 2.0.0-PRO-2026</p>
      </div>

      {/* MODALS */}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-foreground">Passwort ändern</h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Aktuelles Passwort"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted pr-10"
                />
                <button
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-2.5 text-slate-400"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Neues Passwort"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted pr-10"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type="password"
                placeholder="Neues Passwort wiederholen"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-border rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={changePassword.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {changePassword.isPending ? 'Wird aktualisiert...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-foreground">E-Mail Adresse ändern</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Neue E-Mail-Adresse"
                value={emailForm.new_email}
                onChange={(e) => setEmailForm({ ...emailForm, new_email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted"
              />
              <input
                type="password"
                placeholder="Passwort zur Bestätigung"
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-border rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleEmailChange}
                disabled={changeEmail.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {changeEmail.isPending ? 'Wird aktualisiert...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-red-600">Account löschen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Dies kann nicht rückgängig gemacht werden. Alle Ihre Daten werden permanent gelöscht.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  placeholder="Passwort zur Bestätigung"
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted pr-10"
                />
                <button
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-2.5 text-slate-400"
                >
                  {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteForm.confirmDelete}
                  onChange={(e) => setDeleteForm({ ...deleteForm, confirmDelete: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Ich möchte meinen Account löschen
                </span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-border rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending || !deleteForm.confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {deleteAccount.isPending ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-foreground">Profil bearbeiten</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Anzeigename
                </label>
                <input
                  type="text"
                  placeholder="Ihr Anzeigename"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-muted"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-border rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleProfileUpdate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
