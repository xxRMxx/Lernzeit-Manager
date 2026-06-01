import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../api/dashboard'
import { useAuthStore } from '../store/auth'
import { useGoals, useCreateMilestone, useUpdateMilestone } from '../api/goals'
import type { Milestone } from '../api/goals'
import { 
  BookOpen, 
  Clock, 
  Plus, 
  Play, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Target, 
  Flame,
  CheckCircle2,
  History,
  Trophy,
  Star,
  BarChart2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
  Tooltip, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis 
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-xl shadow-lg px-4 py-3 text-sm transition-colors">
        {payload.map((p: any, i: number) => (
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
  const user = useAuthStore((s) => s.user)
  const { data: dashboardGoals, isLoading } = useDashboard()
  const { data: goals } = useGoals()
  const [activeTab, setActiveTab] = useState<'sessions' | 'goals' | 'next'>('goals')

  // States for Milestones logic
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createMilestone = useCreateMilestone(selectedGoalId)
  const updateMilestone = useUpdateMilestone(selectedGoalId)

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  )

  const activeGoals = dashboardGoals || []
  const primaryGoal = activeGoals[0]
  const totalOwnHours = activeGoals.reduce((acc, g) => acc + g.own_hours, 0)

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

  const radarData = goals?.slice(0, 5).map(g => ({
    subject: g.title.substring(0, 10) + (g.title.length > 10 ? '..' : ''),
    A: g.progress_percent
  })) || [];

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !selectedGoalId) return
    createMilestone.mutate(
      { title: newTitle, target_date: newDate || undefined },
      { onSuccess: () => { setNewTitle(''); setNewDate('') } }
    )
  }

  const toggleMilestoneStatus = (m: Milestone) => {
    updateMilestone.mutate({ id: m.id, status: m.status === 'OPEN' ? 'DONE' : 'OPEN' })
  }

  const totalIst = weekData.reduce((a, d) => a + d.ist, 0);
  const totalSoll = 0;
  const weeklyPct = totalSoll > 0 ? Math.round((totalIst / totalSoll) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">
      
      {/* Tab Navigation */}
      <section>
        <div className="flex p-1 bg-slate-100 dark:bg-muted rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
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
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Tab Content Logic from original Dashboard (simplified for brevity) */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {primaryGoal ? (
                <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border p-8 shadow-sm relative overflow-hidden group">
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
                <div className="bg-white dark:bg-card rounded-3xl border border-dashed border-slate-200 dark:border-border p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Target size={32} className="text-slate-300" /></div>
                  <h3 className="text-slate-700 dark:text-foreground font-bold text-lg">Kein aktives Lernziel</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Lege dein erstes Ziel an, um deinen Fortschritt zu verfolgen.</p>
                  <Link to="/goals" className="mt-6 inline-flex items-center gap-2 bg-indigo-500 text-white rounded-xl px-6 py-3 hover:bg-indigo-600 transition-all text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none"><Plus size={18} /> Erstes Ziel erstellen</Link>
                </div>
              )}
              {activeGoals.length > 1 && (
                <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border">
                    <div className="flex items-center gap-2"><BookOpen size={17} className="text-indigo-500" /><h2 className="text-slate-700 dark:text-foreground font-semibold text-sm">Weitere Ziele</h2></div>
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
            <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-border">
                <div className="flex items-center gap-2"><Clock size={18} className="text-indigo-500" /><h2 className="text-slate-700 dark:text-foreground font-bold">Letzte Lernsitzungen</h2></div>
                <Link to="/stopwatch" className="text-sm text-indigo-600 font-bold hover:underline">Timer öffnen</Link>
              </div>
              <div className="p-12 text-center text-slate-400 italic">
                <div className="w-16 h-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><History size={32} className="text-slate-300" /></div>
                <p>Keine Sitzungen in der letzten Zeit aufgezeichnet.</p>
              </div>
            </div>
          )}
          {activeTab === 'next' && (
            <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6"><Calendar size={20} className="text-amber-500" /><h2 className="text-slate-700 dark:text-foreground font-bold text-xl">Nächste Einheit</h2></div>
              <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-border rounded-3xl">
                <p className="text-slate-400 text-sm italic">Nichts für heute geplant</p>
                <Link to="/planning" className="mt-4 inline-block text-xs bg-slate-100 dark:bg-muted px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all font-bold uppercase tracking-widest">Lernplan öffnen</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="space-y-6 pt-4 border-t border-slate-100 dark:border-border pt-10">
        <h2 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Deine Statistik</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Clock size={20} className="text-white" /></div>
              <span className="text-indigo-100 text-xs font-bold bg-white/10 px-3 py-1 rounded-full">Diese Woche</span>
            </div>
            <p className="text-4xl font-bold">0h</p>
            <p className="text-indigo-100 text-sm mt-1">von --h Wochenziel</p>
            <div className="mt-5 h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: "0%" }} /></div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center flex-shrink-0"><TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Heute gelernt</p><p className="text-xl font-bold text-slate-800 dark:text-foreground">0h 00m</p></div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Flame size={24} className="text-amber-500" /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktueller Streak</p><p className="text-xl font-bold text-slate-800 dark:text-foreground">0 Tage 🔥</p></div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-slate-100 dark:border-border shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center flex-shrink-0"><Target size={24} className="text-violet-600 dark:text-violet-400" /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gesamtzeit</p><p className="text-xl font-bold text-slate-800 dark:text-foreground">{totalOwnHours.toFixed(1)} Stunden</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MOVED FROM MILESTONES PAGE --- */}
      <section className="space-y-10 pt-10 border-t border-slate-100 dark:border-border">
        {/* KPI row from Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100">
            <div className="flex items-center justify-between mb-3"><Trophy size={20} className="text-white/80" /><span className="text-white/70 text-xs">Woche</span></div>
            <p className="text-3xl font-bold">{weeklyPct}%</p>
            <p className="text-white/80 text-sm mt-1">Wochenziel erreicht</p>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${weeklyPct}%` }} /></div>
          </div>
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-3"><Clock size={18} className="text-indigo-500" /></div>
            <p className="text-3xl text-slate-800 dark:text-foreground font-bold">{goals?.reduce((acc, g) => acc + g.own_hours, 0).toFixed(0)}h</p>
            <p className="text-slate-500 text-sm mt-1">Gesamtstunden</p>
            <p className="text-slate-400 text-xs mt-0.5">seit Semesterbeginn</p>
          </div>
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-3"><CheckCircle2 size={18} className="text-violet-500" /></div>
            <p className="text-3xl text-slate-800 dark:text-foreground font-bold">0</p>
            <p className="text-slate-500 text-sm mt-1">Lern-Sitzungen</p>
            <p className="text-slate-400 text-xs mt-0.5">insgesamt</p>
          </div>
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-3"><TrendingUp size={18} className="text-amber-500" /></div>
            <p className="text-3xl text-slate-800 dark:text-foreground font-bold">{goals?.length || 0}</p>
            <p className="text-slate-500 text-sm mt-1">Aktive Lernziele</p>
            <p className="text-slate-400 text-xs mt-0.5">fortlaufend</p>
          </div>
        </div>

        {/* Charts row from Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
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
                 <BarChart2 size={32} className="text-slate-200 mb-2" /><p className="text-slate-400 text-sm italic">Keine Daten für diese Woche verfügbar</p>
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
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
            <h2 className="text-slate-700 dark:text-foreground font-bold mb-1">Fortschritt</h2>
            <p className="text-slate-400 text-sm mb-4">Fortschritt je Fach (%)</p>
            {radarData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-border rounded-xl">
                <Target size={32} className="text-slate-200 mb-2" /><p className="text-slate-400 text-sm italic">Keine Lernziele vorhanden</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-700" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                    <Radar name="Fortschritt" dataKey="A" stroke="#4F6EF7" fill="#4F6EF7" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Milestones Management from Milestones */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border">
            <div className="flex items-center gap-2"><BarChart2 size={17} className="text-indigo-500" /><h2 className="text-slate-700 dark:text-foreground font-bold">Meilensteine verwalten</h2></div>
            <select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} className="border border-slate-200 dark:border-border rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-400 bg-slate-50 dark:bg-muted/50 transition-all">
              <option value="">Lernziel auswählen...</option>
              {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          {selectedGoal ? (
            <div className="p-6 space-y-6">
              <form onSubmit={handleCreateMilestone} className="flex flex-col sm:flex-row gap-3">
                <input placeholder="Neuer Meilenstein (z.B. Kapitel 1 fertig)..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="flex-1 border border-slate-200 dark:border-border rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 bg-slate-50/50 dark:bg-muted/50 transition-all" />
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="border border-slate-200 dark:border-border rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 bg-slate-50/50 dark:bg-muted/50 transition-all" />
                <button type="submit" disabled={createMilestone.isPending || !newTitle} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md">Hinzufügen</button>
              </form>
              <div className="divide-y divide-slate-50 dark:divide-border border border-slate-50 dark:border-border rounded-2xl overflow-hidden">
                {selectedGoal.milestones.length === 0 ? (
                  <div className="p-12 text-center"><p className="text-slate-400 text-sm italic">Noch keine Meilensteine für dieses Ziel</p></div>
                ) : (
                  selectedGoal.milestones.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors">
                      <button onClick={() => toggleMilestoneStatus(m)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${m.status === 'DONE' ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 dark:border-border text-transparent'}`}><CheckCircle2 size={16} /></button>
                      <div className="flex-1 min-w-0"><p className={`text-sm font-semibold transition-all ${m.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-foreground'}`}>{m.title}</p>{m.target_date && (<div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider"><Clock size={10} /> bis {new Date(m.target_date).toLocaleDateString('de-DE')}</div>)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center"><div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4"><Star size={32} className="text-indigo-400" /></div><p className="text-slate-500 font-medium">Wähle ein Lernziel aus, um Meilensteine zu verwalten</p></div>
          )}
        </div>
      </section>

    </div>
  )
}
