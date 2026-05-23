import { useState, useEffect, useRef } from 'react'
import { useGoals } from '../api/goals'
import { useSaveSession } from '../api/sessions'
import { 
  Play, 
  Pause, 
  Save, 
  ChevronDown, 
  PenLine, 
  Keyboard, 
  RotateCcw, 
  BookOpen,
  Clock,
  TrendingUp
} from "lucide-react";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return { h, m, sec };
}

export default function Stopwatch() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [note, setNote] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualHours, setManualHours] = useState("1")
  const [manualMinutes, setManualMinutes] = useState("30")
  
  const startedAtRef = useRef<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveSession = useSaveSession(selectedGoalId)

  useEffect(() => {
    if (running) {
      if (!startedAtRef.current) startedAtRef.current = new Date()
      // If we resumed, we need to adjust startedAtRef to account for previous elapsed time
      const startTime = Date.now() - (elapsed * 1000)
      startedAtRef.current = new Date(startTime)
      
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current!.getTime()) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const { h, m, sec } = formatTime(elapsed);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (elapsed % 3600) / 3600 * circumference;

  const handleReset = () => {
    setRunning(false)
    setElapsed(0)
    setNote('')
    startedAtRef.current = null
  }

  const handleSave = () => {
    let finalDuration = elapsed
    let startTime = startedAtRef.current?.toISOString() || new Date().toISOString()

    if (manualMode) {
      finalDuration = (Number(manualHours) * 3600) + (Number(manualMinutes) * 60)
      // For manual mode, we just say it started now (or user could pick a date, but keep it simple)
      startTime = new Date().toISOString()
    }

    if (!selectedGoalId || finalDuration === 0) return

    saveSession.mutate(
      { started_at: startTime, duration_seconds: finalDuration, note },
      {
        onSuccess: () => {
          handleReset()
        },
      }
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: main timer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode toggle */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-1.5 flex w-fit gap-1 shadow-sm">
            <button
              onClick={() => setManualMode(false)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${!manualMode ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-foreground"}`}
            >
              <Play size={14} />
              Timer
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${manualMode ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-foreground"}`}
            >
              <Keyboard size={14} />
              Manuelle Eingabe
            </button>
          </div>

          {/* Timer card */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 md:p-8 transition-colors">
            {!manualMode ? (
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* SVG ring */}
                <div className="relative flex-shrink-0">
                  <svg width="180" height="180" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#EEF0FF" strokeWidth="6" className="dark:stroke-slate-800" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={running ? "#4F6EF7" : "#C7D2FE"}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-[10px] uppercase tracking-wider mb-1 font-bold ${running ? "text-indigo-500 animate-pulse" : "text-slate-300 dark:text-slate-600"}`}>
                      {running ? "● läuft" : "○ pausiert"}
                    </span>
                    <span className="text-slate-800 dark:text-foreground tabular-nums font-bold text-3xl tracking-tighter">
                      {h}:{m}:{sec}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex-1 w-full space-y-5">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2 font-medium">Lernziel auswählen</p>
                    <div className="relative">
                      <select
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                        disabled={running}
                        className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 appearance-none bg-slate-50/50 dark:bg-muted/50 transition-all text-sm disabled:opacity-50"
                      >
                        <option value="">Ziel auswählen...</option>
                        {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setRunning((r) => !r)}
                      disabled={!selectedGoalId}
                      className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-bold disabled:opacity-40 ${
                        running
                          ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 hover:bg-amber-50"
                          : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                      }`}
                    >
                      {running ? <><Pause size={16} /> Pause</> : <><Play size={16} className="fill-white" /> {elapsed > 0 ? 'Fortsetzen' : 'Starten'}</>}
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={elapsed === 0 || running}
                      className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-border text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent transition-all disabled:opacity-30"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!selectedGoalId || elapsed === 0 || running || saveSession.isPending}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white shadow-md hover:shadow-lg hover:bg-emerald-600 transition-all text-sm font-bold disabled:opacity-40"
                    >
                      <Save size={16} />
                      {saveSession.isPending ? 'Speichern...' : 'Speichern'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Manual Mode */
              <div className="space-y-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-2 font-medium">Lernziel auswählen</p>
                  <div className="relative">
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 appearance-none bg-slate-50/50 dark:bg-muted/50 transition-all text-sm"
                    >
                      <option value="">Ziel auswählen...</option>
                      {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                    <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 font-medium">Gelernte Zeit eingeben</p>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <input
                        type="number"
                        value={manualHours}
                        onChange={(e) => setManualHours(e.target.value)}
                        min="0" max="12"
                        className="w-24 border border-slate-200 dark:border-border rounded-xl px-3 py-3 text-slate-800 dark:text-foreground text-center outline-none focus:border-indigo-400 bg-slate-50 dark:bg-muted/50 text-2xl font-bold transition-all"
                      />
                      <p className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-wider">Stunden</p>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 text-3xl mb-4 font-light">:</span>
                    <div className="text-center">
                      <input
                        type="number"
                        value={manualMinutes}
                        onChange={(e) => setManualMinutes(e.target.value)}
                        min="0" max="59"
                        className="w-24 border border-slate-200 dark:border-border rounded-xl px-3 py-3 text-slate-800 dark:text-foreground text-center outline-none focus:border-indigo-400 bg-slate-50 dark:bg-muted/50 text-2xl font-bold transition-all"
                      />
                      <p className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-wider">Minuten</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!selectedGoalId || saveSession.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl px-8 py-3.5 shadow-md hover:shadow-lg hover:opacity-95 transition-all text-sm font-bold disabled:opacity-40"
                >
                  <Save size={16} />
                  {saveSession.isPending ? 'Speichern...' : 'Zeit speichern'}
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <PenLine size={16} className="text-indigo-500" />
              <label className="text-slate-600 dark:text-foreground text-sm font-semibold">Lernnotiz (optional)</label>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Was hast du heute gelernt? Offene Fragen, wichtige Erkenntnisse, nächste Schritte..."
              rows={4}
              className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 resize-none bg-slate-50/50 dark:bg-muted/50 text-sm transition-all"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50 dark:border-border bg-slate-50/30 dark:bg-muted/20">
              <BookOpen size={16} className="text-indigo-500" />
              <h3 className="text-slate-700 dark:text-foreground text-sm font-bold">Letzte Sitzungen</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-border p-2">
              <div className="p-8 text-center text-slate-400 text-xs italic">
                Deine Sitzungshistorie erscheint hier nach dem Speichern.
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-5">
            <h3 className="text-indigo-700 dark:text-indigo-300 font-bold mb-2 flex items-center gap-2 text-sm">
              <TrendingUp size={16} /> Wochenfortschritt
            </h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">10h</span>
              <span className="text-indigo-400 dark:text-indigo-500 text-xs">/ 15h Ziel</span>
            </div>
            <div className="mt-3 h-2 bg-white dark:bg-indigo-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: "66%" }} />
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 text-[10px] mt-2 font-medium">Du hast 66% deines Wochenziels erreicht.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
