import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals, useCreateGoal } from '../../api/goals'
import GoalForm from './GoalForm'
import { Target, Plus, Clock, TrendingUp, Calendar, Flag, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/utils";
import { format } from "date-fns";

type SortKey = 'title' | 'start_date' | 'end_date' | 'target_hours' | 'progress_percent' | 'visibility' | 'updated_at'
type SortOrder = 'asc' | 'desc'

export default function GoalList() {
  const navigate = useNavigate()
  const { data: goals, isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const [showForm, setShowForm] = useState(false)
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, order: SortOrder }>({ 
    key: 'updated_at', 
    order: 'desc' 
  })

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedGoals = useMemo(() => {
    if (!goals) return []
    
    return [...goals].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof typeof a]
      let bVal = b[sortConfig.key as keyof typeof b]

      // Handle nulls for dates
      if (aVal === null) return sortConfig.order === 'asc' ? -1 : 1
      if (bVal === null) return sortConfig.order === 'asc' ? 1 : -1

      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1
      return 0
    })
  }, [goals, sortConfig])

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

  const getVisibilityLabel = (v: string) => {
    switch(v) {
      case 'PRIVATE': return 'Privat';
      case 'SHARED': return 'Geteilt';
      case 'COLLABORATIVE': return 'Kollaborativ';
      default: return v;
    }
  }

  const getVisibilityColor = (v: string) => {
    switch(v) {
      case 'PRIVATE': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'SHARED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COLLABORATIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.order === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
		
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
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Gesamtfortschritt</p>
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
                <Target size={18} className="text-white" />
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-border bg-slate-50/30 dark:bg-muted/10">
            <div className="flex items-center gap-2">
              <Target size={17} className="text-indigo-500" />
              <h2 className="text-slate-700 dark:text-foreground font-bold">Deine Lernziele</h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full ml-2">
                {goals?.length || 0} GESAMT
              </span>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-2 shadow-sm hover:bg-indigo-700 transition-all text-xs font-bold"
            >
              {showForm ? 'Abbrechen' : <><Plus size={16} /> Neues Ziel</>}
            </button>
          </div>

          <div className="overflow-x-auto">
            {!sortedGoals.length ? (
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
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-muted/20">
                  <TableRow>
                    <TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-1.5">
                        Titel <SortIndicator column="title" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center gap-1.5">
                        Startpunkt <SortIndicator column="start_date" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('end_date')}
                    >
                      <div className="flex items-center gap-1.5">
                        Endzeitpunkt <SortIndicator column="end_date" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('target_hours')}
                    >
                      <div className="flex items-center gap-1.5">
                        Zeit (Ist / Soll) <SortIndicator column="target_hours" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('progress_percent')}
                    >
                      <div className="flex items-center gap-1.5">
                        Fortschritt <SortIndicator column="progress_percent" />
                      </div>
                    </TableHead>
					<TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 text-right pr-6 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('visibility')}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Sichtbarkeit <SortIndicator column="visibility" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[10px] uppercase font-bold tracking-widest text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                      onClick={() => handleSort('updated_at')}
                    >
                      <div className="flex items-center gap-1.5">
                        Zuletzt geändert <SortIndicator column="updated_at" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedGoals.map((goal) => (
                    <TableRow 
                      key={goal.id} 
                      className="cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-accent/30 transition-colors"
                      onClick={() => navigate(`/goals/${goal.id}`)}
                    >
                      <TableCell className="font-bold text-slate-700 dark:text-foreground group-hover:text-indigo-600 transition-colors">
                        {goal.title}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(goal.start_date)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(goal.end_date)}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-slate-700 dark:text-foreground">
                        {(goal.own_hours ?? 0).toLocaleString('de-DE', { maximumFractionDigits: 1 })}h / {goal.target_hours}h
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-indigo-600">{(goal.progress_percent ?? 0).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-muted rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500" 
                              style={{ width: `${goal.progress_percent ?? 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-tight py-0.5", getVisibilityColor(goal.visibility))}>
                          {getVisibilityLabel(goal.visibility)}
                        </Badge>
                      </TableCell>
					  <TableCell className="text-xs text-slate-500">
                        {goal.updated_at ? format(new Date(goal.updated_at), 'dd.MM.yyyy HH:mm') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
