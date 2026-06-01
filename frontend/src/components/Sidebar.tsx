import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useLogout } from '../api/auth'
import { 
  LayoutDashboard, 
  Target, 
  CalendarDays, 
  TimerIcon, 
  BarChart2, 
  GraduationCap, 
  Settings, 
  ChevronRight,
  LogOut,
  ChevronUp
} from "lucide-react";
import { useAuthStore } from '../store/auth';

const links = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/goals', label: 'Lernziele', icon: <Target size={18} /> },
  { to: '/planning', label: 'Lernplan', icon: <CalendarDays size={18} /> },
  { to: '/stopwatch', label: 'Lernzeit-Tracker', icon: <TimerIcon size={18} /> },
]

export default function Sidebar() {
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-card border-r border-slate-100 dark:border-border min-h-screen flex-shrink-0 shadow-sm transition-colors">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-100 dark:border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-slate-800 dark:text-foreground font-semibold text-sm">Lernzeit</p>
            <p className="text-indigo-500 leading-none text-xs mt-0.5">Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="text-xs text-slate-400 px-3 mb-2 uppercase tracking-wider font-medium">Navigation</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-accent hover:text-slate-700 dark:hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="px-3 pb-6 relative" ref={menuRef}>
        {/* Profile Menu (Dropdown/Pop-up) */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-card border border-slate-100 dark:border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="p-1.5 space-y-0.5">
              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent hover:text-indigo-600 dark:hover:text-indigo-300 transition-all"
              >
                <Settings size={17} className="text-slate-400" />
                <span className="font-medium">Einstellungen</span>
              </Link>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout.mutate();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
              >
                <LogOut size={17} className="text-slate-400" />
                <span className="font-medium">Abmelden</span>
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
            showProfileMenu 
              ? "bg-slate-100 dark:bg-muted" 
              : "bg-slate-50 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">
              {user?.display_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'LM'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-slate-700 dark:text-foreground text-xs font-bold truncate">
              {user?.display_name || user?.email || 'Gast'}
            </p>
            <p className="text-slate-400 text-[10px] truncate">Lern-Profil aktiv</p>
          </div>
          <ChevronUp 
            size={14} 
            className={`text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} 
          />
        </button>
      </div>
    </aside>
  )
}
