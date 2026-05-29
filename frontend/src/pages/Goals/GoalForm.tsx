import { useState } from 'react'
import type { Goal } from '../../api/goals'
import { Clock, Calendar, Flag, Save, X } from 'lucide-react'

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
  const [startDate, setStartDate] = useState(initial?.start_date ?? '')
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [visibility, setVisibility] = useState<Goal['visibility']>(initial?.visibility ?? 'PRIVATE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
        <label className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">Titel des Lernziels *</label>
        <input
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
        <label className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">Beschreibung</label>
        <textarea
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
          <label className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Clock size={14} className="inline mr-1.5 text-slate-400" />
            Zielstunden gesamt
          </label>
          <div className="flex items-center gap-2">
            <input
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
          <label className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Flag size={14} className="inline mr-1.5 text-slate-400" />
            Sichtbarkeit
          </label>
          <select
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
          <label className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Calendar size={14} className="inline mr-1.5 text-slate-400" />
            Startdatum
          </label>
          <input
            type="date"
            value={startDate ?? ''}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 bg-slate-50/50 dark:bg-muted/50 transition-all text-sm"
          />
        </div>
        <div>
          <label className="text-slate-600 dark:text-slate-400 text-sm block mb-2 font-medium">
            <Calendar size={14} className="inline mr-1.5 text-slate-400" />
            Enddatum / Prüfung
          </label>
          <input
            type="date"
            value={endDate ?? ''}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-slate-800 dark:text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 bg-slate-50/50 dark:bg-muted/50 transition-all text-sm"
          />
        </div>
      </div>

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
