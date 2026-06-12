import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGlobalTimeSlots } from '../api/goals'
import { useSaveSession } from '../api/sessions'
import { useTimerStore } from '../store/timer'
import { 
  Play, 
  Pause, 
  Save, 
  ChevronDown, 
  PenLine, 
  Keyboard, 
  RotateCcw
} from "lucide-react";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return { h, m, sec };
}

export default function Stopwatch() {
  const [searchParams] = useSearchParams()
  const { data: timeSlots } = useGlobalTimeSlots()
  const saveSession = useSaveSession()

  const {
    running,
    elapsed,
    startedAt,
    selectedSlotId,
    selectedGoalId,
    note,
    manualMode,
    manualHours,
    manualMinutes,
    setRunning,
    setElapsed,
    setStartedAt,
    setSelectedSlotId,
    setSelectedGoalId,
    setNote,
    setManualMode,
    setManualHours,
    setManualMinutes,
    reset
  } = useTimerStore()

  const [tickingElapsed, setTickingElapsed] = useState(0)

  // Sync state with search params
  useEffect(() => {
    const slotId = searchParams.get('slotId')
    if (slotId) setSelectedSlotId(slotId)
    
    const goalId = searchParams.get('goalId')
    if (goalId) setSelectedGoalId(goalId)
  }, [searchParams, setSelectedSlotId, setSelectedGoalId])

  // Find the selected slot
  const selectedSlot = useMemo(() => 
    timeSlots?.find(ts => ts.id === selectedSlotId),
    [timeSlots, selectedSlotId]
  )

  // Update goal and note when slot changes
  useEffect(() => {
    if (selectedSlot) {
      setSelectedGoalId(selectedSlot.goal)
      setNote(selectedSlot.note || '')
    }
  }, [selectedSlot, setSelectedGoalId, setNote])

  // Manage ticking timer
  useEffect(() => {
    const getElapsedTime = () => {
      if (running && startedAt) {
        return elapsed + Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      }
      return elapsed
    }

    setTickingElapsed(getElapsedTime())

    if (running) {
      const interval = setInterval(() => {
        setTickingElapsed(getElapsedTime())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [running, startedAt, elapsed])

  const { h, m, sec } = formatTime(tickingElapsed);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (tickingElapsed % 3600) / 3600 * circumference;

  const handleStartPause = () => {
    if (running) {
      // Pause
      const current = elapsed + (startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0)
      setElapsed(current)
      setStartedAt(null)
      setRunning(false)
    } else {
      // Start/Resume
      setStartedAt(new Date().toISOString())
      setRunning(true)
    }
  }

  const handleReset = () => {
    reset()
  }

  const handleSave = () => {
    let finalDuration = tickingElapsed
    let startTime = startedAt || new Date().toISOString()

    if (manualMode) {
      finalDuration = (Number(manualHours) * 3600) + (Number(manualMinutes) * 60)
      startTime = new Date().toISOString()
    }

    if (!selectedGoalId || finalDuration === 0) return

    saveSession.mutate(
      { 
        goal: selectedGoalId, 
        timeslot: selectedSlotId || null,
        started_at: startTime, 
        duration_seconds: finalDuration, 
        note 
      },
      {
        onSuccess: () => {
          handleReset()
        },
      }
    )
  }


  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* 1. Mode Toggle */}
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

      {/* 2. Tracker Card */}
      <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-sm p-6 md:p-10 transition-colors">
        {!manualMode ? (
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* SVG ring */}
            <div className="relative flex-shrink-0 scale-110">
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
                <span className="text-slate-800 dark:text-foreground tabular-nums font-bold text-4xl tracking-tighter">
                  {h}:{m}:{sec}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 w-full space-y-6">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 ml-1">Geplante Session auswählen</p>
                <div className="relative">
                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    disabled={running}
                    className="w-full border border-slate-200 dark:border-border rounded-2xl px-5 py-4 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 appearance-none bg-slate-50/50 dark:bg-muted/50 transition-all text-base disabled:opacity-50 font-medium"
                  >
                    <option value="">Was hast du heute geplant?</option>
                    {timeSlots?.map((ts) => (
                      <option key={ts.id} value={ts.id}>
                        {ts.goal_title}: {ts.note || 'Lernsession'} ({ts.planned_minutes}m)
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStartPause}
                  disabled={!selectedGoalId}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl shadow-lg transition-all text-sm font-bold disabled:opacity-40 ${
                    running
                      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 hover:bg-amber-50"
                      : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-100 dark:shadow-none"
                  }`}
                >
                  {running ? <><Pause size={18} /> Pause</> : <><Play size={18} className="fill-white" /> {elapsed > 0 ? 'Fortsetzen' : 'Starten'}</>}
                </button>
                <button
                  onClick={handleReset}
                  disabled={elapsed === 0 || running}
                  className="px-5 py-4 rounded-2xl border border-slate-200 dark:border-border text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent transition-all disabled:opacity-30"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedGoalId || elapsed === 0 || running || saveSession.isPending}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all text-sm font-bold disabled:opacity-40"
                >
                  <Save size={18} />
                  {saveSession.isPending ? 'Speichert...' : 'Ergebnis speichern'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Manual Mode */
          <div className="space-y-8">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 ml-1">Geplante Session auswählen</p>
              <div className="relative">
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full border border-slate-200 dark:border-border rounded-2xl px-5 py-4 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 appearance-none bg-slate-50/50 dark:bg-muted/50 transition-all text-base font-medium"
                >
                  <option value="">Was hast du heute geplant?</option>
                  {timeSlots?.map((ts) => (
                    <option key={ts.id} value={ts.id}>
                      {ts.note || 'Lernsession'} ({ts.planned_minutes}m)
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-muted/30 p-8 rounded-2xl border border-slate-100 dark:border-border/50">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-6 text-center">Gelernt Dauer</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <input
                    type="number"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    min="0" max="12"
                    className="w-28 border border-slate-200 dark:border-border rounded-2xl px-3 py-4 text-slate-800 dark:text-foreground text-center outline-none focus:border-indigo-400 bg-white dark:bg-card text-4xl font-bold transition-all shadow-sm"
                  />
                  <p className="text-slate-400 text-[10px] mt-2 uppercase font-bold tracking-wider">Stunden</p>
                </div>
                <span className="text-slate-300 dark:text-slate-600 text-5xl mb-6 font-light">:</span>
                <div className="text-center">
                  <input
                    type="number"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    min="0" max="59"
                    className="w-28 border border-slate-200 dark:border-border rounded-2xl px-3 py-4 text-slate-800 dark:text-foreground text-center outline-none focus:border-indigo-400 bg-white dark:bg-card text-4xl font-bold transition-all shadow-sm"
                  />
                  <p className="text-slate-400 text-[10px] mt-2 uppercase font-bold tracking-wider">Minuten</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!selectedGoalId || saveSession.isPending}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl py-4 shadow-xl shadow-indigo-100 dark:shadow-none hover:opacity-95 transition-all text-sm font-bold disabled:opacity-40"
            >
              <Save size={18} />
              {saveSession.isPending ? 'Speichern...' : 'Zeit nachträglich speichern'}
            </button>
          </div>
        )}
      </div>

      {/* 3. Learning Note */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <PenLine size={16} className="text-indigo-500" />
          <label className="text-slate-600 dark:text-foreground text-sm font-semibold uppercase tracking-widest text-[10px]">Lernnotiz (optional)</label>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Was hast du heute gelernt? Offene Fragen, Erkenntnisse..."
          rows={3}
          className="w-full border border-slate-200 dark:border-border rounded-2xl px-5 py-4 text-slate-800 dark:text-foreground placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 resize-none bg-slate-50/50 dark:bg-muted/50 text-sm transition-all"
        />
      </div>

      {/* 4. Weekly Progress (Moved from Sidebar) */}
	  {/*
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-3xl p-8 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-[10px]">
            <TrendingUp size={16} /> Wochenfortschritt
          </h3>
          <span className="bg-white dark:bg-indigo-900/30 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/40">AKTUELL</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-indigo-700 dark:text-indigo-300 tracking-tighter">0h</span>
              <span className="text-indigo-400 dark:text-indigo-500 text-lg">/ --h Ziel</span>
           </div>
           <div className="flex-1 w-full max-w-lg">
              <div className="h-3 bg-white dark:bg-indigo-900/30 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-lg" style={{ width: "0%" }} />
              </div>
              <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-3 font-bold">Du hast noch kein Wochenziel festgelegt.</p>
           </div>
        </div>
      </div>
	  */}

    </div>
  )
}
