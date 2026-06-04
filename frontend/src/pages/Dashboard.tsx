import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../api/dashboard'
import { useGoals, useGlobalSessions, useGlobalTimeSlots } from '../api/goals'
import { format, addDays } from "date-fns"
import { de } from "date-fns/locale"
import { 
  History, 
  Clock, 
  Plus, 
  Play, 
  TrendingUp, 
  Calendar, 
  Target, 
  Flame,
  CheckCircle2,
  Trophy
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
  Tooltip
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-xl shadow-lg px-4 py-3 text-sm transition-colors">
        {payload.map((p, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name === "soll" ? "Geplant" : "Tatsächlich"}:</span>
            <span className="text-slate-800 dark:text-foreground font-bold">{p.value}h</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()
  const { data: goals } = useGoals()
  const { data: sessions, isLoading: isSessionsLoading } = useGlobalSessions()
  const { data: timeSlots, isLoading: isTimeSlotsLoading } = useGlobalTimeSlots()
  const [activeTab, setActiveTab] = useState<'sessions' | 'goals' | 'next'>('goals')

  const isLoading = isDashboardLoading || isSessionsLoading || isTimeSlotsLoading

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  )

  const activeGoals = dashboardData?.goals || []
  const primaryGoal = activeGoals[0]

  // Chart data - in a real app, this would come from the API
  const weekData = [
    { day: "Mo", soll: 0, ist: 0 },
    { day: "Di", soll: 0, ist: 0 },
    { day: "Mi", soll: 0, ist: 0 },
    { day: "Do", soll: 0, ist: 0 },
    { day: "Fr", soll: 0, ist: 0 },
    { day: "Sa", soll: 0, ist: 0 },
    { day: "So", soll: 0, ist: 0 },
  ];

  const totalIst = weekData.reduce((a, d) => a + d.ist, 0);
  const totalSoll = 0;
  const weeklyPct = totalSoll > 0 ? Math.round((totalIst / totalSoll) * 100) : 0;

  // Placeholder KPI calculations
  const todaySessions = sessions?.filter(s => format(new Date(s.started_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) || [];
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const todayHoursStr = `${Math.floor(todaySeconds / 3600)}h ${Math.floor((todaySeconds % 3600) / 60)}m`;
  
  const totalSessionsCount = sessions?.length || 0;
  const activeGoalsCount = goals?.length || 0;
  const streakDays = dashboardData?.streak || 0;

  // Future Time Slots
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const futureTimeSlots = timeSlots?.filter(ts => ts.date >= tomorrowStr && ts.status === 'OPEN').sort((a, b) => a.date.localeCompare(b.date)) || [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">
      
      {/* Combined Tab Section */}
      <section className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex p-2 bg-slate-50/80 dark:bg-muted/30 border-b border-slate-100 dark:border-border">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'sessions'
                ? "bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <History size={16} />
            <span className="hidden sm:inline">Letzte Sitzungen</span>
            <span className="sm:hidden">Sitzungen</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'goals'
                ? "bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Target size={16} />
            <span className="hidden sm:inline">Aktive Lernziele</span>
            <span className="sm:hidden">Ziele</span>
          </button>
          <button
            onClick={() => setActiveTab('next')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'next'
                ? "bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Nächste Einheit</span>
            <span className="sm:hidden">Nächste</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'goals' && (
            <div className="flex flex-col">
              {primaryGoal ? (
                <div className="p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                        Fokus Ziel
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-foreground leading-tight">{primaryGoal.title}</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-50 dark:border-border">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fortschritt</p>
                        <p className="text-sm font-bold text-indigo-600">{primaryGoal.progress_percent.toFixed(0)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stunden</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-foreground">{primaryGoal.own_hours.toFixed(1)} / {primaryGoal.target_hours}h</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Milestones</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-foreground">{primaryGoal.open_milestones} offen</p>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                      <Link to={`/goals/${primaryGoal.id}`} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl px-6 py-3 hover:bg-slate-900 dark:hover:bg-slate-600 transition-all text-sm font-bold">Details ansehen</Link>
                      <Link to="/stopwatch" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 text-white rounded-xl px-6 py-3 hover:bg-indigo-600 transition-all text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none"><Play size={16} className="fill-white" /> Lernen starten</Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Target size={32} className="text-slate-300" /></div>
                  <h3 className="text-slate-700 dark:text-foreground font-bold text-lg">Kein aktives Lernziel</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Lege dein erstes Ziel an, um deinen Fortschritt zu verfolgen.</p>
                  <Link to="/goals" className="mt-6 inline-flex items-center gap-2 bg-indigo-500 text-white rounded-xl px-6 py-3 hover:bg-indigo-600 transition-all text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none"><Plus size={18} /> Erstes Ziel erstellen</Link>
                </div>
              )}
              {activeGoals.length > 1 && (
                <div className="border-t border-slate-100 dark:border-border">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border bg-slate-50/30 dark:bg-muted/10">
                  <div className="flex items-center gap-2"><Target size={17} className="text-indigo-500" /><h2 className="text-slate-700 dark:text-foreground font-semibold text-sm">Weitere Ziele</h2></div>
                  <Link to="/goals" className="text-xs text-indigo-600 font-bold hover:underline">Alle anzeigen</Link>
                  </div>

                  <div className="divide-y divide-slate-50 dark:divide-border">
                    {activeGoals.slice(1).map((goal) => (
                      <Link key={goal.id} to={`/goals/${goal.id}`} className="block px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-700 dark:text-foreground text-sm font-semibold">{goal.title}</span>
                          <span className="text-slate-400 text-xs">{goal.progress_percent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-50 dark:bg-muted rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${goal.progress_percent}%` }} /></div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'sessions' && (
            <div>
              
              <div className="divide-y divide-slate-50 dark:divide-border">
                {!sessions || sessions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <History size={32} className="text-slate-300" />
                    </div>
                    <p>Keine Sitzungen in der letzten Zeit aufgezeichnet.</p>
                  </div>
                ) : (
                  sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-foreground">{session.goal_title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {format(new Date(session.started_at), 'dd.MM.yyyy', { locale: de })}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                              {Math.round(session.duration_seconds / 60)} Min.
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tight ${session.status === 'COMPLETED' ? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-muted dark:text-slate-400 dark:border-border" : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"}`}>
                        {session.status === 'COMPLETED' ? 'Abgeschlossen' : 'Erfasst'}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {sessions && sessions.length > 5 && (
                <div className="px-6 py-4 bg-slate-50/30 dark:bg-muted/10 text-center border-t border-slate-50 dark:border-border">
                  <Link to="/planning" className="text-xs text-slate-500 hover:text-indigo-600 font-bold transition-colors">Alle Sitzungen im Planer ansehen</Link>
                </div>
              )}
            </div>
          )}
          {activeTab === 'next' && (
            <div>
              
              <div className="divide-y divide-slate-50 dark:divide-border max-h-[400px] overflow-y-auto">
                {!futureTimeSlots || futureTimeSlots.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={32} className="text-slate-300" />
                    </div>
                    <p>Keine zukünftigen Einheiten ab morgen geplant.</p>
                  </div>
                ) : (
                  futureTimeSlots.map((ts) => (
                    <div key={ts.id} className="px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-foreground">{ts.goal_title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {format(new Date(ts.date), 'dd.MM.yyyy', { locale: de })}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                              {ts.planned_minutes} Min. geplant
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link to={`/stopwatch?slotId=${ts.id}`} className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all shadow-sm">
                        Starten
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Simplified Statistics Section */}
      <section className="space-y-6 pt-4 border-t border-slate-100 dark:border-border pt-10">
        <h2 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Deine Statistik</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Heute gelernt */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center flex-shrink-0"><TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Heute gelernt</p>
              <p className="text-xl font-bold text-slate-800 dark:text-foreground">{todayHoursStr}</p>
            </div>
          </div>

          {/* Aktueller Streak */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Flame size={24} className="text-amber-500" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktueller Streak</p>
              <p className="text-xl font-bold text-slate-800 dark:text-foreground">{streakDays} Tage 🔥</p>
            </div>
          </div>

          {/* Wochenziel erreicht */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-5 lg:col-span-1">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Trophy size={24} className="text-white" /></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Wochenziel</p>
                <span className="font-bold text-sm">{weeklyPct}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${weeklyPct}%` }} />
              </div>
            </div>
          </div>

          {/* Lernsitzungen insgesamt */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center flex-shrink-0"><CheckCircle2 size={24} className="text-violet-600 dark:text-violet-400" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lernsitzungen</p>
              <p className="text-xl font-bold text-slate-800 dark:text-foreground">{totalSessionsCount} <span className="text-sm text-slate-400 font-normal">insgesamt</span></p>
            </div>
          </div>

          {/* Aktive Lernziele */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Target size={24} className="text-blue-600 dark:text-blue-400" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lernziele</p>
              <p className="text-xl font-bold text-slate-800 dark:text-foreground">{activeGoalsCount} <span className="text-sm text-slate-400 font-normal">aktiv</span></p>
            </div>
          </div>
        </div>

        {/* Soll-Ist-Vergleich Chart */}
        <div className="mt-8">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <div><h2 className="text-slate-700 dark:text-foreground font-bold">Soll–Ist-Vergleich</h2><p className="text-slate-400 text-sm">Diese Woche</p></div>
              <div className="flex flex-wrap gap-3">
                {[{ color: "#E0E7FF", label: "Geplant" }, { color: "#4F6EF7", label: "Ist" }, { color: "#10B981", label: "Ziel erreicht" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: l.color }} />{l.label}</div>
                ))}
              </div>
            </div>
            {totalIst === 0 && totalSoll === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-border rounded-xl">
                 <TrendingUp size={32} className="text-slate-200 mb-2" /><p className="text-slate-400 text-sm italic">Keine Daten für diese Woche verfügbar</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData} barSize={16} barGap={4}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="soll" radius={[4, 4, 0, 0]} fill="#E0E7FF" name="soll" />
                    <Bar dataKey="ist" radius={[4, 4, 0, 0]} name="ist">
                      {weekData.map((entry, i) => (
                        <Cell key={i} fill={entry.ist >= entry.soll && entry.soll > 0 ? "#10B981" : "#4F6EF7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
