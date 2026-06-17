import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals, useCreateTimeSlot, useUpdateTimeSlot, useGlobalSessions, useGlobalTimeSlots, useCreateSession } from '../api/goals'
import { useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { TimeSlot, Session } from '../api/goals'
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { 
  Calendar, 
  Target, 
  Clock, 
  Plus, 
  X,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  Minus,
  TrendingUp,
  History,
  ChevronUp,
  ChevronDown,
  Circle,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";

interface UnifiedEntry {
  id: string;
  type: 'TIMESLOT' | 'UNPLANNED';
  status: 'PLANNED' | 'TRACKED' | 'COMPLETED';
  title: string;
  goal_id: string;
  goal_title: string;
  date: string;
  planned_minutes: number;
  tracked_minutes: number;
  created_at: string;
  updated_at: string;
  original_data: TimeSlot | Session;
}

type SortKey = 'title' | 'date' | 'updated_at';
type SortOrder = 'asc' | 'desc';

export default function Planning() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: goals } = useGoals()
  const { data: sessions } = useGlobalSessions()
  const { data: timeSlots } = useGlobalTimeSlots()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [newSessionGoalId, setNewSessionGoalId] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionMinutes, setSessionMinutes] = useState('60')
  const [sessionNote, setSessionNote] = useState('')

  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [logGoalId, setLogGoalId] = useState('')
  const [logSlotId, setLogSlotId] = useState<string | null>(null)
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logMinutes, setLogMinutes] = useState(60)
  const [logNote, setLogNote] = useState('')

  const [sortConfig, setSortConfig] = useState<{ key: SortKey, order: SortOrder }>({ 
    key: 'date', 
    order: 'desc' 
  })

  const createTimeSlot = useCreateTimeSlot(newSessionGoalId)
  const updateTimeSlot = useUpdateTimeSlot(newSessionGoalId)
  const createSession = useCreateSession(logGoalId)

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  const groupedEntries = useMemo(() => {
    // 1. Convert TimeSlots to entries and track accumulated time
    const entries: UnifiedEntry[] = (timeSlots || []).map(ts => {
      const relatedSessions = (sessions || []).filter(s => s.timeslot === ts.id);
      const tracked_minutes = relatedSessions.reduce((acc, s) => acc + Math.round(s.duration_seconds / 60), 0);
      
      let status: UnifiedEntry['status'] = 'PLANNED';
      if (ts.status === 'COMPLETED') status = 'COMPLETED';
      else if (tracked_minutes > 0) status = 'TRACKED';

      return {
        id: ts.id,
        type: 'TIMESLOT',
        status,
        title: ts.note || 'Lernsession',
        goal_id: ts.goal,
        goal_title: ts.goal_title,
        date: ts.date,
        planned_minutes: ts.planned_minutes,
        tracked_minutes,
        created_at: ts.created_at,
        updated_at: ts.updated_at,
        original_data: ts
      };
    });

    // 2. Find orphaned sessions (unplanned)
    (sessions || []).forEach(s => {
      if (!s.timeslot) {
        entries.push({
          id: s.id,
          type: 'UNPLANNED',
          status: 'TRACKED', // Unplanned is always tracked
          title: s.note || 'Ungeplante Session',
          goal_id: s.goal,
          goal_title: s.goal_title,
          date: s.started_at,
          planned_minutes: 0,
          tracked_minutes: Math.round(s.duration_seconds / 60),
          created_at: s.created_at,
          updated_at: s.updated_at,
          original_data: s
        });
      }
    });

    // 3. Grouping
    const groups: { title: string, id: string, items: UnifiedEntry[], total_planned_minutes: number, total_tracked_minutes: number }[] = [];
    const goalSorted = [...entries].sort((a, b) => a.goal_title.localeCompare(b.goal_title));

    goalSorted.forEach(item => {
      let group = groups.find(g => g.id === item.goal_id);
      if (!group) {
        group = { title: item.goal_title, id: item.goal_id, items: [], total_planned_minutes: 0, total_tracked_minutes: 0 };
        groups.push(group);
      }
      group.items.push(item);
      group.total_planned_minutes += item.planned_minutes;
      group.total_tracked_minutes += item.tracked_minutes;
    });

    // 4. Sorting within groups
    groups.forEach(g => {
      g.items.sort((a, b) => {
        // PLANNED/TRACKED first, COMPLETED last
        const getPrio = (s: UnifiedEntry['status']) => s === 'COMPLETED' ? 1 : 0;
        if (getPrio(a.status) !== getPrio(b.status)) return getPrio(a.status) - getPrio(b.status);
        
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
        return 0;
      });
    });

    return groups;
  }, [sessions, timeSlots, sortConfig]);

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
    setIsModalOpen(true)
  }

  const handleOpenLogModal = (goalId?: string, date?: string, minutes?: number, note?: string, slotId?: string) => {
    setLogGoalId(goalId || '')
    setLogSlotId(slotId || null)
    setLogDate(date || new Date().toISOString().split('T')[0])
    setLogMinutes(minutes || 60)
    setLogNote(note || '')
    setIsLogModalOpen(true)
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSessionGoalId || !sessionDate || !sessionMinutes) return
    
    const data = {
      goal: newSessionGoalId,
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
        note: logNote,
        timeslot: logSlotId
    }, {
        onSuccess: () => {
            setIsLogModalOpen(false)
            setLogNote('')
            setLogSlotId(null)
        }
    })
  }

  const handleDeleteItem = (item: UnifiedEntry) => {
    if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
        const url = item.type === 'TIMESLOT'
            ? `/goals/${item.goal_id}/time-slots/${item.id}/`
            : `/goals/${item.goal_id}/sessions/${item.id}/`
        client.delete(url).then(() => {
            qc.invalidateQueries({ queryKey: ['goals'] })
            qc.invalidateQueries({ queryKey: ['sessions'] })
            qc.invalidateQueries({ queryKey: ['time-slots'] })
            qc.invalidateQueries({ queryKey: ['dashboard'] })
        });
    }
  }

  const toggleTimeSlotStatus = (ts: TimeSlot) => {
    const newStatus = ts.status === 'OPEN' ? 'COMPLETED' : 'OPEN';
    client.patch(`/goals/${ts.goal}/time-slots/${ts.id}/`, { status: newStatus }).then(() => {
        location.reload();
    });
  }

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.order === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
  }

  const totalPlannedHours = (timeSlots || []).reduce((acc, ts) => acc + ts.planned_minutes, 0) / 60;
  const weeklyGoal = 15;
  const pct = Math.min(Math.round((totalPlannedHours / weeklyGoal) * 100), 100);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Sessions Section */}
      <section className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-slate-50 dark:border-border flex items-center justify-between bg-slate-50/50 dark:bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Calendar size={20} />
            </div>
            <h2 className="text-slate-800 dark:text-foreground font-bold text-lg">Lernzeiten-Planer</h2>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md"
          >
            <Plus size={16} />
            Session planen
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Wochenfortschritt (geplant)</p>
               <p className="text-xs font-bold text-indigo-600">{totalPlannedHours.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}h / {weeklyGoal}h</p>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-muted rounded-full overflow-hidden shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-muted/20">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => handleSort('title')}>
                    Bezeichnung <SortIndicator column="title" />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <div className="flex items-center gap-1.5"><Clock size={12} /> Zeit (Ist / Soll)</div>
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> Datum <SortIndicator column="date" /></div>
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => handleSort('updated_at')}>
                    <div className="flex items-center gap-1.5"><History size={12} /> Zuletzt geändert <SortIndicator column="updated_at" /></div>
                  </TableHead>
                  <TableHead className="text-right pr-6 text-[10px] uppercase font-bold tracking-widest text-slate-400">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">Keine Sessions vorhanden.</TableCell>
                  </TableRow>
                ) : (
                  groupedEntries.map((group, idx) => (
                    <React.Fragment key={group.id}>
                      {idx > 0 && (
                        <TableRow className="h-10 border-none hover:bg-transparent select-none pointer-events-none">
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}

                      <TableRow className="bg-slate-100/40 dark:bg-muted/20 border-y border-slate-200/60 dark:border-border/50 hover:bg-slate-100/40 dark:hover:bg-muted/20">
                        <TableCell colSpan={6} className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                              <Target size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-foreground uppercase tracking-wider">{group.title}</span>
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-widest shadow-sm">
                                Ist: {(group.total_tracked_minutes / 60).toLocaleString('de-DE', { maximumFractionDigits: 1 })}h
                              </span>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest shadow-sm">
                                Soll: {(group.total_planned_minutes / 60).toLocaleString('de-DE', { maximumFractionDigits: 1 })}h
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {group.items.map((item) => (
                        <TableRow 
                          key={`${item.type}-${item.id}`} 
                          className={cn(
                            "group transition-colors",
                            item.status === 'COMPLETED' 
                              ? "bg-slate-50/20 dark:bg-muted/5 opacity-60 hover:opacity-100 grayscale-[0.8] hover:grayscale-0"
                              : "hover:bg-slate-50/80 dark:hover:bg-accent/30"
                          )}
                        >
                          <TableCell className={cn(
                            "font-bold pl-8",
                            item.status === 'COMPLETED' ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-foreground"
                          )}>
                            <div className="flex items-center gap-2">
                                {item.type === 'UNPLANNED' && <AlertCircle size={14} className="text-amber-500" title="Ungeplante Session" />}
                                {item.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-bold uppercase tracking-tight py-0.5",
                              item.status === 'PLANNED' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                              item.status === 'TRACKED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              "bg-slate-100 text-slate-500 border-slate-200"
                            )}>
                              {item.status === 'PLANNED' ? 'Geplant' : item.status === 'TRACKED' ? 'Erfasst' : 'Abgeschlossen'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-bold text-slate-700 dark:text-foreground">
                            {item.tracked_minutes}m / {item.planned_minutes}m
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {format(new Date(item.date), 'dd.MM.yyyy', { locale: de })}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {item.updated_at ? format(new Date(item.updated_at), 'dd.MM.yyyy HH:mm', { locale: de }) : '—'}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.type === 'TIMESLOT' && (
                                <>
                                  {item.status !== 'COMPLETED' && (
                                    <button onClick={() => navigate(`/stopwatch?slotId=${item.id}`)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Starten"><Play size={14} fill="currentColor" /></button>
                                  )}
                                  <button onClick={() => handleOpenLogModal(item.goal_id, item.date, item.planned_minutes, item.title, item.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Zeit nachtragen"><Clock size={14} /></button>
                                  <button 
                                    onClick={() => toggleTimeSlotStatus(item.original_data as TimeSlot)} 
                                    className={cn("p-1.5 rounded-lg transition-colors", item.status !== 'COMPLETED' ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100")}
                                    title={item.status !== 'COMPLETED' ? "Als abgeschlossen markieren" : "Wieder öffnen"}
                                  >
                                    {item.status !== 'COMPLETED' ? <Circle size={14} /> : <CheckCircle2 size={14} />}
                                  </button>
                                  <button onClick={() => handleOpenEditModal(item.original_data as TimeSlot)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Bearbeiten"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteItem(item)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Löschen"><Trash2 size={14} /></button>
                                </>
                              )}
                              {item.type === 'UNPLANNED' && (
                                 <button onClick={() => handleDeleteItem(item)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Löschen"><Trash2 size={14} /></button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
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
                <select required value={newSessionGoalId} onChange={(e) => setNewSessionGoalId(e.target.value)} className="w-full border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-foreground outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
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
