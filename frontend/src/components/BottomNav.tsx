import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Target, 
  TimerIcon, 
  BarChart2, 
  Settings 
} from "lucide-react";

const links = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/goals', label: 'Ziele', icon: <Target size={20} /> },
  { to: '/stopwatch', label: 'Tracker', icon: <TimerIcon size={20} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-card/80 backdrop-blur-md border-t border-slate-100 dark:border-border flex md:hidden z-50 transition-colors pb-safe">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-[10px] gap-1 transition-all ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500'
            }`
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
