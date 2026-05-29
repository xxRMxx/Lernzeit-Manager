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
    <div className="p-4 md:p-8 space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
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
            <div className="space-y-8">
              {/* Goal Title Card */}
              <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border p-8 shadow-sm transition-colors overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                      Aktives Ziel
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
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-slate-50 dark:border-border">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-foreground">In Bearbeitung</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fortschritt</p>
                      <p className="text-sm font-bold text-indigo-600">{progressPct.toFixed(0)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stunden</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-foreground">
                        {stats?.own_hours.toFixed(1)} / {goal.target_hours}h
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sessions</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-foreground">{stats?.session_count}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-700 dark:text-foreground font-bold flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-500" />
                    Fortschritts-Analyse
                  </h3>
                  <span className="text-2xl font-bold text-indigo-600">{progressPct.toFixed(0)}%</span>
                </div>
                <div className="h-4 bg-slate-50 dark:bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Start</span>
                  <span>Ziel: {goal.target_hours}h</span>
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-50 dark:border-border flex items-center justify-between">
                  <h3 className="text-slate-700 dark:text-foreground font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-500" />
                    Meilensteine
                  </h3>
                  <Link to="/milestones" className="text-xs text-indigo-600 hover:underline font-bold">Verwalten</Link>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-border">
                  {goal.milestones.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-sm">
                      Keine Meilensteine für dieses Ziel definiert.
                    </div>
                  ) : (
                    goal.milestones.map((m) => (
                      <div key={m.id} className="px-6 py-4 flex items-center gap-4 group hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${m.status === 'DONE' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-muted'}`} />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${m.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-foreground'}`}>
                            {m.title}
                          </p>
                          {m.target_date && <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{new Date(m.target_date).toLocaleDateString('de-DE')}</p>}
                        </div>
                        {m.status === 'DONE' && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-border">
              <h3 className="text-slate-700 dark:text-foreground font-bold text-sm flex items-center gap-2 uppercase tracking-wider">
                <Users size={16} className="text-indigo-500" />
                Mitglieder
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {goal.owner.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-foreground truncate">{goal.owner.display_name || goal.owner.email}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Owner</p>
                </div>
              </div>
              
              {goal.memberships.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
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
              
              <button className="w-full mt-2 py-3 border-2 border-dashed border-slate-100 dark:border-border rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all text-xs font-bold">
                + Mitglied einladen
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6 transition-colors">
            <h3 className="text-slate-700 dark:text-foreground font-bold text-sm mb-4 uppercase tracking-wider">Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zeitraum</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-foreground">
                    {goal.start_date ? new Date(goal.start_date).toLocaleDateString('de-DE') : '—'} bis {goal.end_date ? new Date(goal.end_date).toLocaleDateString('de-DE') : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Flag size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sichtbarkeit</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-foreground">
                    {goal.visibility === 'PRIVATE' ? 'Privat' : goal.visibility === 'SHARED' ? 'Geteilt' : 'Kollaborativ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-4">Wochen-Status</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-white/60 text-[10px]">DIESE WOCHE</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">8h</p>
                <p className="text-white/60 text-[10px]">DURCHSCHNITT</p>
              </div>
            </div>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">
              Alle Details ansehen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
