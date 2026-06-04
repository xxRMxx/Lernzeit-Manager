import { useMemo } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { Bell, Calendar, AlertCircle, Clock } from 'lucide-react'
import { useGlobalTimeSlots } from '../api/goals'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Dein Lernfortschritt im Überblick' },
  '/goals': { title: 'Lernziele', subtitle: 'Verwalte deine Ziele und Fortschritte' },
  '/stopwatch': { title: 'Lernzeit-Tracker', subtitle: 'Konzentriert lernen und Zeit erfassen' },
  '/planning': { title: 'Lernzeiten-Planer', subtitle: 'Strukturiere deine Lernwoche' },
  '/settings': { title: 'Einstellungen', subtitle: 'Personalisiere deine App-Erfahrung' },
}

export default function Layout() {
  const location = useLocation()
  const path = location.pathname
  const info = pageTitles[path] || { title: 'Lernzeit-Manager', subtitle: 'Besser lernen, mehr erreichen' }

  const { data: timeSlots } = useGlobalTimeSlots()
  
  const notifications = useMemo(() => {
    if (!timeSlots) return []

    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    
    const openSlots = timeSlots.filter(ts => ts.status === 'OPEN')
    const notifs = []
    
    openSlots.forEach(ts => {
      if (ts.date === todayStr) {
        notifs.push({ ...ts, type: 'TODAY', label: 'Heute fällig', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', icon: Clock })
      } else if (ts.date === tomorrowStr) {
        notifs.push({ ...ts, type: 'TOMORROW', label: 'Morgen', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Calendar })
      } else if (ts.date < todayStr) {
        notifs.push({ ...ts, type: 'OVERDUE', label: 'Überfällig', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: AlertCircle })
      }
    })
    
    return notifs.sort((a, b) => a.date.localeCompare(b.date))
  }, [timeSlots])

  const notifCount = notifications.length

  return (
    <div className="flex h-screen bg-[#F4F6FB] dark:bg-background overflow-hidden transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-card border-b border-slate-100 dark:border-border px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 transition-colors">
          <div>
            <h1 className="text-slate-800 dark:text-foreground font-bold text-lg md:text-xl leading-tight">{info.title}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm mt-0.5">{info.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative w-9 h-9 rounded-xl bg-slate-50 dark:bg-muted border border-slate-100 dark:border-border flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-accent transition-all">
                  <Bell size={17} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 overflow-hidden bg-white dark:bg-card border-slate-100 dark:border-border rounded-2xl shadow-xl">
                <div className="p-4 border-b border-slate-50 dark:border-border bg-slate-50/50 dark:bg-muted/20">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-foreground">Benachrichtigungen</h3>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                     <div className="p-6 text-center">
                       <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                       <p className="text-sm text-slate-500 dark:text-slate-400">Alles erledigt!</p>
                     </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-border">
                      {notifications.map(n => (
                        <Link key={n.id} to={`/stopwatch?slotId=${n.id}`} className="block p-4 hover:bg-slate-50 dark:hover:bg-accent/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-2 rounded-xl ${n.bg} ${n.color}`}>
                              <n.icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-foreground mb-0.5 leading-tight">{n.goal_title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{n.note || 'Lernsession'}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${n.color}`}>{n.label}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-[10px] text-slate-400 font-medium">{format(new Date(n.date), 'dd.MM.yyyy', { locale: de })}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
