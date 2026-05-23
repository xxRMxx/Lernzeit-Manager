import { useState } from 'react'
import { useGoals, useCreateMilestone, useUpdateMilestone } from '../api/goals'
import type { Milestone } from '../api/goals'
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Star, 
  Plus,
  Target,
  ChevronRight,
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

export default function Milestones() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createMilestone = useCreateMilestone(selectedGoalId)
  const updateMilestone = useUpdateMilestone(selectedGoalId)

  // Dummy data for charts - in a real app, this would come from the API
  const weekData = [
    { day: "Mo", soll: 2, ist: 2 },
    { day: "Di", soll: 0, ist: 0 },
    { day: "Mi", soll: 2, ist: 1.5 },
    { day: "Do", soll: 1.5, ist: 2.5 },
    { day: "Fr", soll: 0, ist: 0 },
    { day: "Sa", soll: 3, ist: 3 },
    { day: "So", soll: 2, ist: 1 },
  ];

  const radarData = goals?.slice(0, 5).map(g => ({
    subject: g.title.substring(0, 10) + (g.title.length > 10 ? '..' : ''),
    A: g.progress_percent
  })) || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !selectedGoalId) return
    createMilestone.mutate(
      { title: newTitle, target_date: newDate || undefined },
      { onSuccess: () => { setNewTitle(''); setNewDate('') } }
    )
  }

  const toggleStatus = (m: Milestone) => {
    updateMilestone.mutate({ id: m.id, status: m.status === 'OPEN' ? 'DONE' : 'OPEN' })
  }

  const totalIst = weekData.reduce((a, d) => a + d.ist, 0);
  const totalSoll = 10.5;
  const pct = Math.round((totalIst / totalSoll) * 100);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <Trophy size={20} className="text-white/80" />
            <span className="text-white/70 text-xs">Woche</span>
          </div>
          <p className="text-3xl font-bold">{pct}%</p>
          <p className="text-white/80 text-sm mt-1">Wochenziel erreicht</p>
          <div className="mt-3 h-1.5 bg-white/20 rounded-full">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5 transition-colors">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-3">
            <Clock size={18} className="text-indigo-500" />
          </div>
          <p className="text-3xl text-slate-800 dark:text-foreground font-bold">
            {goals?.reduce((acc, g) => acc + g.own_hours, 0).toFixed(0)}h
          </p>
          <p className="text-slate-500 text-sm mt-1">Gesamtstunden</p>
          <p className="text-slate-400 text-xs mt-0.5">seit Semesterbeginn</p>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5 transition-colors">
          <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle2 size={18} className="text-violet-500" />
          </div>
          <p className="text-3xl text-slate-800 dark:text-foreground font-bold">36</p>
          <p className="text-slate-500 text-sm mt-1">Lern-Sitzungen</p>
          <p className="text-slate-400 text-xs mt-0.5">insgesamt</p>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5 transition-colors">
          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-amber-500" />
          </div>
          <p className="text-3xl text-slate-800 dark:text-foreground font-bold">{goals?.length || 0}</p>
          <p className="text-slate-500 text-sm mt-1">Aktive Lernziele</p>
          <p className="text-slate-400 text-xs mt-0.5">fortlaufend</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly bar chart – 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div>
              <h2 className="text-slate-700 dark:text-foreground font-bold">Soll–Ist-Vergleich</h2>
              <p className="text-slate-400 text-sm">Diese Woche</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[{ color: "#E0E7FF", label: "Geplant" }, { color: "#4F6EF7", label: "Ist" }, { color: "#10B981", label: "Ziel erreicht" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
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
        </div>

        {/* Radar chart */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
          <h2 className="text-slate-700 dark:text-foreground font-bold mb-1">Fortschritt</h2>
          <p className="text-slate-400 text-sm mb-4">Fortschritt je Fach (%)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-700" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Radar 
                  name="Fortschritt" 
                  dataKey="A" 
                  stroke="#4F6EF7" 
                  fill="#4F6EF7" 
                  fillOpacity={0.15} 
                  strokeWidth={2} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Milestones Management */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border">
          <div className="flex items-center gap-2">
            <BarChart2 size={17} className="text-indigo-500" />
            <h2 className="text-slate-700 dark:text-foreground font-bold">Meilensteine verwalten</h2>
          </div>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="border border-slate-200 dark:border-border rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-400 bg-slate-50 dark:bg-muted/50 transition-all"
          >
            <option value="">Lernziel auswählen...</option>
            {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>

        {selectedGoal ? (
          <div className="p-6 space-y-6">
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
              <input
                placeholder="Neuer Meilenstein (z.B. Kapitel 1 fertig)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 border border-slate-200 dark:border-border rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 bg-slate-50/50 dark:bg-muted/50 transition-all"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="border border-slate-200 dark:border-border rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 bg-slate-50/50 dark:bg-muted/50 transition-all"
              />
              <button
                type="submit"
                disabled={createMilestone.isPending || !newTitle}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md"
              >
                Hinzufügen
              </button>
            </form>

            <div className="divide-y divide-slate-50 dark:divide-border border border-slate-50 dark:border-border rounded-2xl overflow-hidden">
              {selectedGoal.milestones.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 text-sm italic">Noch keine Meilensteine für dieses Ziel</p>
                </div>
              ) : (
                selectedGoal.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors">
                    <button 
                      onClick={() => toggleStatus(m)} 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        m.status === 'DONE' 
                          ? 'bg-emerald-500 text-white' 
                          : 'border-2 border-slate-200 dark:border-border text-transparent'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold transition-all ${m.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-foreground'}`}>
                        {m.title}
                      </p>
                      {m.target_date && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                          <Clock size={10} /> bis {new Date(m.target_date).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-indigo-400" />
            </div>
            <p className="text-slate-500 font-medium">Wähle ein Lernziel aus, um Meilensteine zu verwalten</p>
          </div>
        )}
      </div>

      {/* Motivation Footer */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-white dark:bg-card rounded-2xl flex items-center justify-center shadow-sm">
            <Star size={24} className="text-amber-400 fill-amber-400" />
          </div>
          <div>
            <p className="text-indigo-700 dark:text-indigo-300 font-bold text-lg">Hervorragend!</p>
            <p className="text-indigo-600 dark:text-indigo-400 text-sm">Du hast diese Woche bereits {totalIst} Stunden gelernt. Weiter so!</p>
          </div>
        </div>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
        >
          Zurück nach oben <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
