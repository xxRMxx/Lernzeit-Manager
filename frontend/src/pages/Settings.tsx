import { useAuthStore } from '../store/auth'
import { useLogout } from '../api/auth'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Einstellungen</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Profil</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{user?.display_name || 'Kein Anzeigename'}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Erscheinungsbild</h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                theme === t
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'light' ? 'Hell' : t === 'dark' ? 'Dunkel' : 'System'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Ziele teilen</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Öffne ein Ziel und ändere die Sichtbarkeit auf „Geteilt" oder „Kollaborativ".
          Mitglieder können über die Ziel-Detailseite eingeladen werden.
        </p>
      </div>

      <button
        onClick={() => logout.mutate()}
        className="w-full bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 rounded-2xl py-3 font-semibold hover:bg-red-100 dark:hover:bg-red-900/20"
      >
        Abmelden
      </button>
    </div>
  )
}
