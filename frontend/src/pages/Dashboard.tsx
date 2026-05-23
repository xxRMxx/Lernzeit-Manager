import { Link } from 'react-router-dom'
import { useDashboard } from '../api/dashboard'
import { useAuthStore } from '../store/auth'
import { 
  BookOpen, 
  Clock, 
  Plus, 
  Play, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Target, 
  Flame 
} from "lucide-react";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: goals, isLoading } = useDashboard()

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  )

  // Mapping real data to the design
  const activeGoals = goals || []
  
  // Dummy data for sections not yet fully implemented in backend
  const recentSessions = [
    { subject: "Theoretische Informatik", duration: "1h 45min", date: "Heute, 08:00", icon: "💻" },
    { subject: "Datenbanksysteme", duration: "2h 00min", date: "Gestern, 19:30", icon: "🗄️" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-7">
      {/* KPI Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-white" />
            </div>
            <span className="text-indigo-200 text-xs">diese Woche</span>
          </div>
          <p className="text-3xl font-bold">10h</p>
          <p className="text-indigo-200 text-sm mt-1">von 15h Wochenziel</p>
          <div className="mt-3 h-1.5 bg-white/20 rounded-full">
            <div className="h-full bg-white rounded-full" style={{ width: "66%" }} />
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-slate-400 text-xs">heute</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-foreground">1h 45</p>
          <p className="text-slate-400 text-sm mt-1">Minuten gelernt</p>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
              <Flame size={18} className="text-amber-500" />
            </div>
            <span className="text-slate-400 text-xs">aktiv</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-foreground">5 🔥</p>
          <p className="text-slate-400 text-sm mt-1">Tage in Folge</p>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
              <Target size={18} className="text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-slate-400 text-xs">gesamt</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-foreground">
            {activeGoals.reduce((acc, g) => acc + g.own_hours, 0).toFixed(0)}h
          </p>
          <p className="text-slate-400 text-sm mt-1">Lernstunden gesamt</p>
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals list – 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active goals */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border">
              <div className="flex items-center gap-2">
                <BookOpen size={17} className="text-indigo-500" />
                <h2 className="text-slate-700 dark:text-foreground font-semibold text-sm md:text-base">Aktive Lernziele</h2>
              </div>
              <Link
                to="/goals"
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus size={15} />
                Neues Ziel
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-border">
              {!activeGoals.length ? (
                <div className="p-8 text-center text-slate-400">
                  <p>Noch keine aktiven Ziele</p>
                </div>
              ) : (
                activeGoals.map((goal) => (
                  <Link key={goal.id} to={`/goals/${goal.id}`} className="block px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-slate-700 dark:text-foreground text-sm font-medium">{goal.title}</span>
                        {goal.open_milestones > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                            {goal.open_milestones} offen
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-sm">{goal.own_hours.toFixed(1)}h / {goal.target_hours}h</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${goal.progress_percent}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1.5 text-indigo-500">{goal.progress_percent.toFixed(0)}% abgeschlossen</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border">
              <div className="flex items-center gap-2">
                <Clock size={17} className="text-indigo-500" />
                <h2 className="text-slate-700 dark:text-foreground font-semibold text-sm md:text-base">Letzte Lernsitzungen</h2>
              </div>
              <Link
                to="/stopwatch"
                className="text-sm text-indigo-600 flex items-center gap-1 hover:text-indigo-700 transition-colors"
              >
                Alle anzeigen <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-border">
              {recentSessions.map((s, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-muted rounded-xl flex items-center justify-center text-xl">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-foreground text-sm font-medium">{s.subject}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{s.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg font-medium">{s.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Next session */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={17} className="text-amber-500" />
              <h2 className="text-slate-700 dark:text-foreground font-semibold text-sm md:text-base">Nächste Lerneinheit</h2>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-4">
              <p className="text-amber-800 dark:text-amber-400 text-sm font-semibold">Theoretische Informatik</p>
              <p className="text-amber-600 dark:text-amber-500 text-xs mt-1">Heute · 19:00 – 21:00 Uhr</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-lg">2 Stunden</span>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-lg">Priorität: Hoch</span>
              </div>
            </div>
            <Link
              to="/stopwatch"
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-95 transition-all text-sm font-medium"
            >
              <Play size={15} className="fill-white" />
              Lernzeit starten
            </Link>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm font-semibold">Du bist auf Kurs! 🎯</p>
                <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-1.5 leading-relaxed">Noch <strong>5 Stunden</strong> bis zu deinem Wochenziel. Heute Abend kannst du es schaffen!</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h2 className="text-slate-700 dark:text-foreground mb-3 font-semibold text-sm md:text-base">Schnellaktionen</h2>
            <div className="space-y-2">
              <Link
                to="/goals"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all text-sm"
              >
                <Plus size={15} />
                Neues Lernziel
              </Link>
              <Link
                to="/planning"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all text-sm"
              >
                <Calendar size={15} />
                Lernplan bearbeiten
              </Link>
              <Link
                to="/milestones"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all text-sm"
              >
                <TrendingUp size={15} />
                Meilensteine ansehen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
