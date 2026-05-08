import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/goals', label: 'Ziele', icon: '🎯' },
  { to: '/stopwatch', label: 'Timer', icon: '⏱' },
  { to: '/milestones', label: 'Etappen', icon: '🏁' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex md:hidden z-50 transition-colors">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              isActive
                ? 'text-primary-600 dark:text-primary-400 font-semibold'
                : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          <span className="text-xl">{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
