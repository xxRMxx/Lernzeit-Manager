import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Shield, Mail, Lock, UserX, UserCheck, Eye, EyeOff } from 'lucide-react'
import { useAdminUsers, useAdminUpdateUser, useAdminResetPassword, type AdminUser } from '../api/admin'

export default function Admin() {
  const { data: users, isLoading } = useAdminUsers()
  const updateUser = useAdminUpdateUser()
  const resetPassword = useAdminResetPassword()

  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ email: '', display_name: '', role: 'USER' as 'USER' | 'ADMIN' })
  const [resetUser, setResetUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function showFeedback(type: 'success' | 'error', message: string) {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3500)
  }

  function openEdit(user: AdminUser) {
    setEditUser(user)
    setEditForm({ email: user.email, display_name: user.display_name, role: user.role })
  }

  async function handleEdit() {
    if (!editUser) return
    try {
      await updateUser.mutateAsync({ id: editUser.id, email: editForm.email, display_name: editForm.display_name, role: editForm.role })
      showFeedback('success', 'Benutzer erfolgreich aktualisiert.')
      setEditUser(null)
    } catch (e: any) {
      showFeedback('error', e.response?.data?.email?.[0] || 'Fehler beim Speichern.')
    }
  }

  async function handleResetPassword() {
    if (!resetUser) return
    if (newPassword.length < 8) {
      showFeedback('error', 'Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    try {
      await resetPassword.mutateAsync({ id: resetUser.id, new_password: newPassword })
      showFeedback('success', `Passwort für ${resetUser.email} zurückgesetzt.`)
      setResetUser(null)
      setNewPassword('')
    } catch (e: any) {
      showFeedback('error', e.response?.data?.error || 'Fehler beim Zurücksetzen.')
    }
  }

  async function handleToggleActive(user: AdminUser) {
    try {
      await updateUser.mutateAsync({ id: user.id, is_active: !user.is_active })
      showFeedback('success', user.is_active ? `${user.email} wurde gesperrt.` : `${user.email} wurde aktiviert.`)
    } catch {
      showFeedback('error', 'Fehler beim Ändern des Status.')
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center">
          <Shield size={20} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-foreground">Benutzerverwaltung</h1>
          <p className="text-slate-400 text-sm">Admin-Bereich</p>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* User list */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 dark:border-border flex items-center justify-between">
          <h2 className="text-slate-700 dark:text-foreground font-bold text-sm">Alle Benutzer</h2>
          <span className="text-xs text-slate-400">{users?.length ?? 0} gesamt</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-border">
            {users?.map((u) => (
              <div key={u.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm ${
                    u.is_active
                      ? 'bg-gradient-to-br from-indigo-400 to-violet-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}>
                    {(u.display_name || u.email).substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800 dark:text-foreground truncate">
                        {u.display_name || '—'}
                      </p>
                      {u.role === 'ADMIN' && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-900/30">
                          Administrator
                        </span>
                      )}
                      {!u.is_active && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-red-50 dark:bg-red-900/10 text-red-500 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/20">
                          Gesperrt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                      Beigetreten {format(new Date(u.date_joined), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent text-xs font-medium transition-all"
                  >
                    <Mail size={13} />
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => { setResetUser(u); setNewPassword(''); setShowPassword(false) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent text-xs font-medium transition-all"
                  >
                    <Lock size={13} />
                    Passwort
                  </button>
                  <button
                    onClick={() => handleToggleActive(u)}
                    disabled={updateUser.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                      u.is_active
                        ? 'border border-red-100 dark:border-red-900/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                        : 'border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                    }`}
                  >
                    {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                    {u.is_active ? 'Sperren' : 'Aktivieren'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-1 text-slate-800 dark:text-foreground">Benutzer bearbeiten</h2>
            <p className="text-slate-400 text-sm mb-5">{editUser.email}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Anzeigename</label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-muted text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-Mail-Adresse</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-muted text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rolle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-muted text-sm"
                >
                  <option value="USER">Benutzer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-border rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted text-sm transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleEdit}
                disabled={updateUser.isPending}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-all"
              >
                {updateUser.isPending ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-1 text-slate-800 dark:text-foreground">Passwort zurücksetzen</h2>
            <p className="text-slate-400 text-sm mb-5">{resetUser.email}</p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Neues Passwort (mind. 8 Zeichen)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-muted text-sm pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setResetUser(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-border rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted text-sm transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetPassword.isPending}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-all"
              >
                {resetPassword.isPending ? 'Zurücksetzen…' : 'Zurücksetzen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
