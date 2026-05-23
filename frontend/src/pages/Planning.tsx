import { useState } from 'react'
import { useGoals, useCreatePlan } from '../api/goals'
import { 
  CalendarDays, 
  ChevronRight, 
  Info, 
  Sun, 
  Target, 
  Clock, 
  TrendingUp,
  Save,
  RotateCcw
} from "lucide-react";

const initialDays = [
  { short: "Mo", full: "Montag", date: "21. Mai", color: "#4F6EF7" },
  { short: "Di", full: "Dienstag", date: "22. Mai", color: "#CBD5E1" },
  { short: "Mi", full: "Mittwoch", date: "23. Mai", color: "#7C3AED" },
  { short: "Do", full: "Donnerstag", date: "24. Mai", color: "#F59E0B" },
  { short: "Fr", full: "Freitag", date: "25. Mai", color: "#CBD5E1" },
  { short: "Sa", full: "Samstag", date: "26. Mai", color: "#10B981" },
  { short: "So", full: "Sonntag", date: "27. Mai", color: "#10B981" },
];

export default function Planning() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [dayHours, setDayHours] = useState<number[]>(new Array(7).fill(0))
  
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createPlan = useCreatePlan(selectedGoalId)

  const totalPlanned = dayHours.reduce((a, b) => a + b, 0);
  const weeklyGoal = 15; // Example weekly goal
  const pct = Math.min(Math.round((totalPlanned / weeklyGoal) * 100), 100);
  const maxH = Math.max(...dayHours, 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId || totalPlanned === 0) return
    createPlan.mutate({ weekly_hours: totalPlanned })
  }

  const latestPlan = selectedGoal?.plans[selectedGoal.plans.length - 1]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Top summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <p className="text-white/80 text-sm font-medium">Geplante Gesamtlernzeit</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold">{totalPlanned}</span>
              <span className="text-white/70">/ {weeklyGoal} Std. Wochenziel</span>
            </div>
            <div className="mt-4 h-2.5 bg-white/20 rounded-full w-full max-w-md overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-white/70 text-xs mt-2 font-medium">{pct}% des Wochenziels geplant</p>
          </div>
          <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/10 flex flex-col items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <span className="text-2xl font-bold">{pct}%</span>
            <span className="text-white/70 text-[10px] uppercase font-bold tracking-wider">Planung</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 flex flex-col justify-between transition-colors">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Lernziel</p>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full mt-2 border-none bg-slate-50 dark:bg-muted/50 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-foreground outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">Ziel wählen...</option>
              {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Status</p>
            <p className="text-2xl text-slate-800 dark:text-foreground mt-1 font-bold">
              {dayHours.filter((h) => h > 0).length} / 7 <span className="text-sm font-normal text-slate-400">Tagen</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bar chart and Day cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Bar chart */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
            <h2 className="text-slate-700 dark:text-foreground font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              Stundenverteilung nach Tag
            </h2>
            <div className="flex items-end gap-3 h-40 mb-4 px-2">
              {dayHours.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h > 0 ? `${h}h` : ""}
                  </span>
                  <div
                    className="w-full rounded-t-xl transition-all duration-300"
                    style={{
                      height: `${(h / maxH) * 100}%`,
                      minHeight: h > 0 ? "8px" : "4px",
                      backgroundColor: h > 0 ? initialDays[i].color : "currentColor",
                    }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${h > 0 ? '' : 'bg-slate-100 dark:bg-muted opacity-30'}`}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{initialDays[i].short}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {initialDays.map((day, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 flex flex-col ${dayHours[i] > 0 ? "border-slate-100 dark:border-indigo-500/30 scale-[1.02]" : "border-dashed border-slate-200 dark:border-border opacity-60"}`}
              >
                <div
                  className="px-2 py-2 text-center"
                  style={{ backgroundColor: dayHours[i] > 0 ? `${day.color}15` : "" }}
                  className={`px-2 py-2 text-center ${dayHours[i] > 0 ? '' : 'bg-slate-50 dark:bg-muted/30'}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dayHours[i] > 0 ? day.color : "#94A3B8" }}>{day.short}</p>
                </div>

                <div className="p-3 flex flex-col items-center gap-3 flex-1 justify-center">
                  <span className="text-xl font-bold tabular-nums" style={{ color: dayHours[i] > 0 ? day.color : "#CBD5E1" }}>
                    {dayHours[i]}h
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDayHours((prev) => { const n = [...prev]; n[i] = Math.max(0, +(n[i] - 0.5).toFixed(1)); return n; })}
                      className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-muted text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm hover:bg-slate-100 dark:hover:bg-accent transition-colors font-bold"
                    >−</button>
                    <button
                      onClick={() => setDayHours((prev) => { const n = [...prev]; n[i] = Math.min(12, +(n[i] + 0.5).toFixed(1)); return n; })}
                      className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-muted text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm hover:bg-slate-100 dark:hover:bg-accent transition-colors font-bold"
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Historie & Tips */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-border flex items-center gap-2">
              <CalendarDays size={18} className="text-indigo-500" />
              <h3 className="text-slate-700 dark:text-foreground font-bold text-sm uppercase tracking-wider">Planhistorie</h3>
            </div>
            {selectedGoal?.plans.length ? (
              <div className="divide-y divide-slate-50 dark:divide-border max-h-64 overflow-y-auto">
                {[...selectedGoal.plans].reverse().map((p, i) => (
                  <div key={p.id} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-accent transition-colors">
                    <div>
                      <p className={`text-sm font-bold ${i === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {p.weekly_hours}h / Woche
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(p.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {i === 0 && <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-900/40">AKTIV</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm italic">
                Wähle ein Ziel, um Pläne zu sehen.
              </div>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-amber-500" />
              <h3 className="text-amber-800 dark:text-amber-400 font-bold text-sm">Planungstipp</h3>
            </div>
            <p className="text-amber-700 dark:text-amber-500 text-xs leading-relaxed">
              Dieser Plan dient als Orientierung. Nutze ihn als Richtlinie, nicht als starre Vorgabe. Flexibilität ist wichtig für langfristigen Erfolg!
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-border">
        <button
          onClick={() => setDayHours(new Array(7).fill(0))}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-border text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent transition-all text-sm font-bold"
        >
          <RotateCcw size={16} />
          Plan zurücksetzen
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedGoalId || totalPlanned === 0 || createPlan.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl px-10 py-4 shadow-lg hover:shadow-xl hover:opacity-95 transition-all text-sm font-bold disabled:opacity-50"
        >
          <Save size={18} />
          {createPlan.isPending ? 'Speichert...' : 'Wochenplan speichern'}
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  )
}
