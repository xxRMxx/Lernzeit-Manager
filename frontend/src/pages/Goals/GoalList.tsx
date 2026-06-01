import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoals, useCreateGoal } from '../../api/goals'
import GoalForm from './GoalForm'
import { BookOpen, Plus, Target, Clock, TrendingUp, ChevronRight } from "lucide-react";

export default function GoalList() {
  const { data: goals, isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  )

  const reachedGoals = goals?.filter(g => (g.progress_percent ?? 0) >= 100).length || 0
  const inProgressGoals = goals?.filter(g => (g.progress_percent ?? 0) < 100).length || 0
  const avgProgress = goals?.length 
    ? (goals.reduce((acc, g) => acc + (g.progress_percent ?? 0), 0) / goals.length).toFixed(0) 
    : 0

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Erreicht</p>
            <p className="text-xl font-bold text-slate-700 dark:text-foreground">{reachedGoals}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">In Arbeit</p>
            <p className="text-xl font-bold text-slate-700 dark:text-foreground">{inProgressGoals}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Clock size={18} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Fortschritt</p>
              <p className="text-xl font-bold text-indigo-600">{avgProgress}%</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <Target size={18} className="text-indigo-500" />
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Form and List */}
      <div className="space-y-6">
        {showForm && (
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50 dark:border-border bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-900/10 dark:to-violet-900/10">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-slate-800 dark:text-foreground font-semibold">Neues Lernziel anlegen</h2>
                <p className="text-slate-500 text-sm">Definiere dein Ziel klar und messbar</p>
              </div>
            </div>
            <div className="p-6">
              <GoalForm
                onSubmit={(data) => createGoal.mutate(data, { onSuccess: () => setShowForm(false) })}
                onCancel={() => setShowForm(false)}
                isPending={createGoal.isPending}
              />
            </div>
          </div>
        )}
<div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border">
    <div className="flex items-center gap-2">
      <Target size={17} className="text-indigo-500" />
      <h2 className="text-slate-700 dark:text-foreground font-semibold">Deine Ziele</h2>
      <span className="text-xs text-slate-400 font-medium ml-2"> (gesamt: {goals?.length || 0}) </span>
    </div>
    <button
      onClick={() => setShowForm(!showForm)}
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl px-4 py-2 shadow-md hover:shadow-lg hover:opacity-95 transition-all text-xs font-medium"
    >
      {showForm ? 'Abbrechen' : <><Plus size={16} /> Neues Ziel</>}
    </button>
  </div>
  <div className="divide-y divide-slate-50 dark:divide-border">
            {!goals?.length ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Noch keine Ziele vorhanden</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                >
                  Erstes Ziel erstellen
                </button>
              </div>
            ) : (
              goals.map((goal) => (
                <Link
                  key={goal.id}
                  to={`/goals/${goal.id}`}
                  className="group px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-foreground font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} /> {goal.target_hours}h Ziel
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <TrendingUp size={12} /> {(goal.progress_percent ?? 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block w-32 h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all" 
                        style={{ width: `${goal.progress_percent ?? 0}%` }}
                      />
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
