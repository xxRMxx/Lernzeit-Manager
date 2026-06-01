import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Dein Lernfortschritt im Überblick' },
  '/goals': { title: 'Lernziele', subtitle: 'Verwalte deine Ziele und Fortschritte' },
  '/stopwatch': { title: 'Lernzeit-Tracker', subtitle: 'Konzentriert lernen und Zeit erfassen' },
  '/planning': { title: 'Lernplan', subtitle: 'Strukturiere deine Lernwoche' },
  '/settings': { title: 'Einstellungen', subtitle: 'Personalisiere deine App-Erfahrung' },
}

export default function Layout() {
  const location = useLocation()
  const path = location.pathname
  const info = pageTitles[path] || { title: 'Lernzeit-Manager', subtitle: 'Besser lernen, mehr erreichen' }

  return (
    <div className="flex h-screen bg-[#F4F6FB] dark:bg-background overflow-hidden transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Hidden on mobile if needed, but keeping it for now as it adds polish */}
        <header className="bg-white dark:bg-card border-b border-slate-100 dark:border-border px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 transition-colors">
          <div>
            <h1 className="text-slate-800 dark:text-foreground font-bold text-lg md:text-xl leading-tight">{info.title}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm mt-0.5">{info.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <button className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-muted border border-slate-100 dark:border-border flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-accent transition-all">
                <Bell size={17} />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] text-white flex items-center justify-center">2</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
