import { NavLink } from 'react-router-dom'
import { useLogout } from '../api/auth'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/goals', label: 'Lernziele', icon: '🎯' },
  { to: '/stopwatch', label: 'Stoppuhr', icon: '⏱' },
  { to: '/milestones', label: 'Meilensteine', icon: '🏁' },
  { to: '/planning', label: 'Planung', icon: '📅' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar() {
  const logout = useLogout()

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4 flex-shrink-0 transition-colors">
      <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-6">Lernzeit</h1>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => logout.mutate()}
        className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-left px-3 py-2 mt-4"
      >
        Abmelden
      </button>
    </aside>
  )
}
