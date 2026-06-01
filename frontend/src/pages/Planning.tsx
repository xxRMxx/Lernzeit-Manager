import { useState, useRef, useEffect } from 'react'
import { useGoals, useCreatePlan, useCreateTimeSlot, useUpdateTimeSlot, useDeleteTimeSlot, useGlobalSessions, useGlobalTimeSlots, useCreateSession } from '../api/goals'
import type { TimeSlot, Session } from '../api/goals'
import { 
  CalendarDays, 
  ChevronRight, 
  Target, 
  Clock, 
  TrendingUp,
  Save,
  RotateCcw,
  Plus,
  History,
  X,
  Play,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Minus
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
  const { data: sessions } = useGlobalSessions()
  const { data: timeSlots } = useGlobalTimeSlots()
  
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [dayHours, setDayHours] = useState<number[]>(new Array(7).fill(0))
  
  // States for the Session Modal (Planning/Editing)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [newSessionGoalId, setNewSessionGoalId] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionMinutes, setSessionMinutes] = useState('60')
  const [sessionNote, setSessionNote] = useState('')

  // States for the "Zeit nachtragen" Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [logGoalId, setLogGoalId] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logMinutes, setLogMinutes] = useState(60)
  const [logNote, setLogNote] = useState('')

  // State for Action Menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createPlan = useCreatePlan(selectedGoalId)
  const createTimeSlot = useCreateTimeSlot(newSessionGoalId)
  const updateTimeSlot = useUpdateTimeSlot(newSessionGoalId)
  const deleteTimeSlot = useDeleteTimeSlot(newSessionGoalId)
  const createSession = useCreateSession(logGoalId)

  const totalPlannedHours = dayHours.reduce((a, b) => a + b, 0);
  const weeklyGoal = 15;
  const pct = Math.min(Math.round((totalPlannedHours / weeklyGoal) * 100), 100);
  const maxH = Math.max(...dayHours, 1);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleOpenCreateModal = () => {
    setEditingSlot(null)
    setNewSessionGoalId('')
    setSessionDate(new Date().toISOString().split('T')[0])
    setSessionMinutes('60')
    setSessionNote('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot)
    setNewSessionGoalId(slot.goal)
    setSessionDate(slot.date)
    setSessionMinutes(String(slot.planned_minutes))
    setSessionNote(slot.note)
    setOpenMenuId(null)
    setIsModalOpen(true)
  }

  const handleOpenLogModal = (slot?: TimeSlot) => {
    if (slot) {
      setLogGoalId(slot.goal)
      setLogDate(slot.date)
      setLogMinutes(slot.planned_minutes)
      setLogNote(slot.note)
    } else {
      setLogGoalId('')
      setLogDate(new Date().toISOString().split('T')[0])
      setLogMinutes(60)
      setLogNote('')
    }
    setOpenMenuId(null)
    setIsLogModalOpen(true)
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSessionGoalId || !sessionDate || !sessionMinutes) return
    
    const data = {
      date: sessionDate,
      planned_minutes: Number(sessionMinutes),
      note: sessionNote
    }

    if (editingSlot) {
      updateTimeSlot.mutate({ id: editingSlot.id, ...data }, {
        onSuccess: () => setIsModalOpen(false)
      })
    } else {
      createTimeSlot.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false)
          setSessionNote('')
        }
      })
    }
  }

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logGoalId || !logDate || logMinutes <= 0) return
    
    createSession.mutate({
        started_at: new Date(logDate).toISOString(),
        duration_seconds: logMinutes * 60,
        note: logNote
    }, {
        onSuccess: () => {
            setIsLogModalOpen(false)
            setLogNote('')
        }
    })
  }

  const handleSubmitWeekly = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId || totalPlannedHours === 0) return
    createPlan.mutate({ weekly_hours: totalPlannedHours })
  }

  const handleDeleteSession = (slot: TimeSlot) => {
    if (confirm('Möchtest du diese Session wirklich löschen?')) {
        deleteTimeSlot.mutate(slot.id)
        setOpenMenuId(null)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* 1. Sessions Section */}
      <section className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-slate-50 dark:border-border flex items-center justify-between bg-slate-50/50 dark:bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <CalendarDays size={20} />
            </div>
            <h2 className="text-slate-800 dark:text-foreground font-bold text-lg">Sessions</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md"
            >
              <Plus size={16} />
              Session planen
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Wochenfortschritt (geplant)</p>
               <p className="text-xs font-bold text-indigo-600">{totalPlannedHours}h / {weeklyGoal}h</p>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-muted rounded-full overflow-hidden shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>

          <div className="space-y-4">
            {(!sessions?.length && !timeSlots?.length) ? (
              <div className="p-12 text-center text-slate-400 italic">
                <p>Noch keine Sessions vorhanden. Plane jetzt deine erste Session!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Planned Slots */}
                {timeSlots?.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-6 p-4 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-2xl group hover:border-indigo-200 transition-all relative">
                    <div className="w-14 h-14 bg-white dark:bg-card rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-border shadow-sm flex-shrink-0">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase leading-none">{new Date(slot.date).toLocaleDateString('de-DE', { weekday: 'short' })}</span>
                      <span className="text-xl font-bold text-slate-700 dark:text-foreground leading-none mt-1">{new Date(slot.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/50 uppercase tracking-widest">Geplant</span>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">• {slot.goal_title}</span>
                      </div>
                      <p className="text-sm md:text-base font-bold text-slate-700 dark:text-foreground truncate">{slot.note || 'Lernsession'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Clock size={12} /> {slot.planned_minutes} Minuten Dauer
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === slot.id ? null : slot.id);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-slate-400 hover:text-indigo-600"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        {openMenuId === slot.id && (
                          <div ref={menuRef} className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-card border border-slate-100 dark:border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                             <div className="p-1.5 space-y-0.5">
                                <button 
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium"
                                >
                                   <Play size={15} className="text-indigo-500" />
                                   <span>Session starten</span>
                                </button>
                                <button 
                                  onClick={() => handleOpenLogModal(slot)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors font-medium"
                                >
                                   <Clock size={15} className="text-emerald-500" />
                                   <span>Zeit nachtragen</span>
                                </button>
                                <button 
                                  onClick={() => handleOpenEditModal(slot)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors font-medium"
                                >
                                   <Edit2 size={15} className="text-amber-500" />
                                   <span>Bearbeiten</span>
                                </button>
                                <div className="h-px bg-slate-50 dark:bg-border my-1" />
                                <button 
                                  onClick={() => handleDeleteSession(slot)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                                >
                                   <Trash2 size={15} />
                                   <span>Löschen</span>
                                </button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Past Sessions */}
                {sessions?.map((s) => (
                  <div key={s.id} className="flex items-center gap-6 p-4 border border-slate-50 dark:border-border bg-slate-50/30 dark:bg-muted/20 rounded-2xl grayscale opacity-70 group hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="w-14 h-14 bg-white dark:bg-card rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-border shadow-sm flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{new Date(s.started_at).toLocaleDateString('de-DE', { weekday: 'short' })}</span>
                      <span className="text-xl font-bold text-slate-400 dark:text-slate-500 leading-none mt-1">{new Date(s.started_at).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-muted text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-border uppercase tracking-widest">Abgeschlossen</span>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">• {s.goal_title}</span>
                      </div>
                      <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400 truncate">{s.note || 'Lern-Sitzung'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Clock size={12} /> {(s.duration_seconds / 60).toFixed(0)}m gelernt
                      </p>
                    </div>
                    <div className="hidden sm:block text-right pr-2">
                       <CheckCircle2 size={20} className="text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- PLANNING/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-card w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-border bg-slate-50/50 dark:bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-foreground">
                {editingSlot ? 'Session bearbeiten' : 'Neue Session planen'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveSession} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Lernziel</label>
                <select required value={newSessionGoalId} onChange={(e) => setNewSessionGoalId(e.target.value)} disabled={!!editingSlot} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-foreground outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                  <option value="">Lernziel auswählen...</option>
                  {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Datum</label>
                  <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Dauer (Min.)</label>
                  <input type="number" required step="15" min="15" value={sessionMinutes} onChange={(e) => setSessionMinutes(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Notiz</label>
                <input type="text" placeholder="Thema der Session..." value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-foreground" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-border text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">Abbrechen</button>
                <button type="submit" disabled={createTimeSlot.isPending || updateTimeSlot.isPending} className="flex-[2] bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-indigo-700 transition-all">
                  {editingSlot ? 'Änderungen speichern' : 'Session speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ZEIT NACHTRAGEN MODAL --- */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsLogModalOpen(false)} />
          <div className="relative bg-white dark:bg-card w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-border bg-slate-50/50 dark:bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-foreground">Zeit nachtragen</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleLogSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Lernziel</label>
                <select required value={logGoalId} onChange={(e) => setLogGoalId(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-foreground outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                  <option value="">Lernziel wählen...</option>
                  {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Datum</label>
                <input type="date" required value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-foreground" />
              </div>

              <div className="space-y-3">
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Gelernt Dauer</label>
                <div className="flex items-center gap-4">
                   <button 
                     type="button"
                     onClick={() => setLogMinutes(m => Math.max(0, m - 15))}
                     className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-muted flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all shadow-sm border border-slate-100 dark:border-border"
                   >
                     <Minus size={20} />
                   </button>
                   <div className="flex-1 relative">
                      <input 
                        type="number" 
                        value={logMinutes} 
                        onChange={(e) => setLogMinutes(Number(e.target.value))}
                        className="w-full text-center border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-foreground" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Min</span>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setLogMinutes(m => m + 15)}
                     className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-muted flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm border border-slate-100 dark:border-border"
                   >
                     <Plus size={20} />
                   </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest ml-1">Notiz</label>
                <input type="text" placeholder="Was hast du gelernt?" value={logNote} onChange={(e) => setLogNote(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-foreground" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLogModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-border text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">Abbrechen</button>
                <button type="submit" disabled={createSession.isPending} className="flex-[2] bg-emerald-600 text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none disabled:opacity-50">
                  Zeit speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
