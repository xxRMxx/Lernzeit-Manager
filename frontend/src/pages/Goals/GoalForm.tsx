import { useState } from 'react'
import type { Goal } from '../../api/goals'
import { Clock, Calendar, Flag, Save } from 'lucide-react'

interface Props {
  initial?: Partial<Goal>
  onSubmit: (data: Partial<Goal>) => void
  onCancel: () => void
  isPending: boolean
}

export default function GoalForm({ initial, onSubmit, onCancel, isPending }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetHours, setTargetHours] = useState(String(initial?.target_hours ?? ''))
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(initial?.start_date ?? today)
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [visibility, setVisibility] = useState<Goal['visibility']>(initial?.visibility ?? 'PRIVATE')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (startDate && endDate && endDate < startDate) {
      setError('Das Enddatum darf nicht vor dem Startdatum liegen.')
      return
    }
    setError(null)
    onSubmit({
      title,
      description,
      target_hours: Number(targetHours),
      start_date: startDate || null,
      end_date: endDate || null,
      visibility,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">Titel des Lernziels *</label>
        <input
          id="title"
          type="text"
          placeholder="z. B. Theoretische Informatik bestehen"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all bg-slate-50/50 dark:bg-muted/50 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">Beschreibung</label>
        <textarea
          id="description"
          placeholder="Notizen, Lerninhalte, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all bg-slate-50/50 dark:bg-muted/50 text-sm resize-none"
        />
      </div>

      {/* Hours + Visibility in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="target_hours" className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Clock size={14} className="inline mr-1.5 text-slate-400" />
            Zielstunden gesamt
          </label>
          <div className="flex items-center gap-2">
            <input
              id="target_hours"
              type="number"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              min="1" max="500"
              className="w-24 border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 bg-slate-50/50 dark:bg-muted/50 text-center transition-all text-sm"
            />
            <span className="text-slate-400 text-sm">Stunden</span>
          </div>
        </div>

        <div>
          <label htmlFor="visibility" className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Flag size={14} className="inline mr-1.5 text-slate-400" />
            Sichtbarkeit
          </label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Goal['visibility'])}
            className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 bg-slate-50/50 dark:bg-muted/50 transition-all text-sm"
          >
            <option value="PRIVATE">Privat</option>
            <option value="SHARED">Geteilt (nur lesen)</option>
            <option value="COLLABORATIVE">Kollaborativ</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="start_date" className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Calendar size={14} className="inline mr-1.5 text-slate-400" />
            Startdatum
          </label>
          <input
            id="start_date"
            type="date"
            value={startDate ?? ''}
            onChange={(e) => {
              setStartDate(e.target.value)
              setError(null)
            }}
            className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 bg-slate-50/50 dark:bg-muted/50 transition-all text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="end_date" className="text-slate-600 dark:text-slate-400 text-sm block font-medium">
              <Calendar size={14} className="inline mr-1.5 text-slate-400" />
              Enddatum / Prüfung
            </label>
            <button
              type="button"
              onClick={() => {
                if (startDate) {
                  const d = new Date(startDate);
                  d.setMonth(d.getMonth() + 6);
                  setEndDate(d.toISOString().split('T')[0]);
                  setError(null)
                }
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-all"
            >
              + 6 Monate
            </button>
          </div>
          <input
            id="end_date"
            type="date"
            value={endDate ?? ''}
            onChange={(e) => {
              setEndDate(e.target.value)
              setError(null)
            }}
            className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 bg-slate-50/50 dark:bg-muted/50 transition-all text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg hover:opacity-95 transition-all text-sm font-semibold disabled:opacity-50"
        >
          <Save size={16} />
          {isPending ? 'Speichern...' : 'Ziel speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-border text-slate-500 hover:bg-slate-50 dark:hover:bg-accent transition-all text-sm"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
