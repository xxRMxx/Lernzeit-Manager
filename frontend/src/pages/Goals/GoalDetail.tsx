import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGoal, useGoalStats, useUpdateGoal, useDeleteGoal } from '../../api/goals'
import GoalForm from './GoalForm'
import { 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Calendar,
  MoreVertical,
  Flag
} from "lucide-react";

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: goal, isLoading } = useGoal(id!)
  const { data: stats } = useGoalStats(id!)
  const updateGoal = useUpdateGoal(id!)
  const deleteGoal = useDeleteGoal()
  const [editing, setEditing] = useState(false)

  if (isLoading || !goal) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  )

  const progressPct = stats?.progress_percent || 0;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/goals')} 
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold"
        >
          <ChevronLeft size={20} />
          Zurück zur Übersicht
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-accent text-sm font-bold transition-all"
          >
            <Edit3 size={16} />
            {editing ? 'Abbrechen' : 'Bearbeiten'}
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Ziel wirklich löschen?')) {
                deleteGoal.mutate(id!, { onSuccess: () => navigate('/goals') })
              }
            }}
            className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Content */}
        {editing ? (
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-foreground mb-6">Lernziel bearbeiten</h2>
            <GoalForm
              initial={goal}
              onSubmit={(data) => updateGoal.mutate(data, { onSuccess: () => setEditing(false) })}
              onCancel={() => setEditing(false)}
              isPending={updateGoal.isPending}
            />
          </div>
        ) : (
          <>
            {/* Goal Title Card */}
            <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border p-8 shadow-sm transition-colors overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-sm font-bold text-slate-700 dark:text-foreground">In Bearbeitung</p>
                  </span>
                  {goal.visibility !== 'PRIVATE' && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      {goal.visibility === 'SHARED' ? 'Geteilt' : 'Kollaborativ'}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-foreground leading-tight">{goal.title}</h1>
                {goal.description && (
                  <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-2xl">{goal.description}</p>
                )}
                
                <div className="mt-10 pt-8 border-t border-slate-50 dark:border-border space-y-8">
                  {/* Row 1: Progress */}
                  <div className="bg-slate-50/50 dark:bg-muted/20 rounded-2xl p-6 border border-slate-100 dark:border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-700 dark:text-foreground font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                        <TrendingUp size={16} className="text-indigo-500" />
                        Fortschritts-Analyse
                      </h3>
                      <span className="text-2xl font-bold text-indigo-600">{progressPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-white dark:bg-muted rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span>Start</span>
                      <span>Ziel: {goal.target_hours}h</span>
                    </div>
                  </div>

                  {/* Row 2: Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sessions</p>
                      <p className="text-base font-bold text-slate-700 dark:text-foreground flex items-center gap-2">
                        <Clock size={16} className="text-slate-300" />
                        {stats?.session_count || 0} Einheiten
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Zeitraum</p>
                      <p className="text-base font-bold text-slate-700 dark:text-foreground flex items-center gap-2">
                        <Calendar size={16} className="text-slate-300" />
                        {goal.start_date ? new Date(goal.start_date).toLocaleDateString('de-DE') : '—'} - {goal.end_date ? new Date(goal.end_date).toLocaleDateString('de-DE') : '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sichtbarkeit</p>
                      <p className="text-base font-bold text-slate-700 dark:text-foreground flex items-center gap-2">
                        <Flag size={16} className="text-slate-300" />
                        {goal.visibility === 'PRIVATE' ? 'Privat' : goal.visibility === 'SHARED' ? 'Geteilt' : 'Kollaborativ'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-border">
                <h3 className="text-slate-700 dark:text-foreground font-bold text-sm flex items-center gap-2 uppercase tracking-wider">
                  <Users size={16} className="text-indigo-500" />
                  Mitglieder
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 group p-3 bg-slate-50/50 dark:bg-muted/20 rounded-xl border border-slate-100 dark:border-border/50">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {goal.owner.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 dark:text-foreground truncate">{goal.owner.display_name || goal.owner.email}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Owner</p>
                    </div>
                  </div>
                  
                  {goal.memberships.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-muted/20 rounded-xl border border-slate-100 dark:border-border/50">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-muted text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center font-bold text-sm">
                        {m.user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 dark:text-foreground truncate">{m.user.display_name || m.user.email}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {m.role === 'CONTRIBUTOR' ? 'Mitwirkend' : 'Betrachter'}
                        </p>
                      </div>
                    </div>
                  ))}

                  <button className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-100 dark:border-border rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all text-xs font-bold px-4">
                    + Mitglied einladen
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
