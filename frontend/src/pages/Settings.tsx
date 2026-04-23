import { useAuthStore } from '../store/auth'
import { useLogout } from '../api/auth'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Einstellungen</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Profil</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.display_name || 'Kein Anzeigename'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-2">Ziele teilen</h2>
        <p className="text-sm text-gray-400">
          Öffne ein Ziel und ändere die Sichtbarkeit auf „Geteilt" oder „Kollaborativ".
          Mitglieder können über die Ziel-Detailseite eingeladen werden.
        </p>
      </div>

      <button
        onClick={() => logout.mutate()}
        className="w-full bg-red-50 text-red-500 rounded-2xl py-3 font-semibold hover:bg-red-100"
      >
        Abmelden
      </button>
    </div>
  )
}
