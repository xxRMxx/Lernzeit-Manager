import { useState } from 'react'
import type { Goal } from '../../api/goals'

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        placeholder="Titel *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <textarea
        placeholder="Beschreibung"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />
      <input
        type="number"
        placeholder="Ziel-Stunden"
        value={targetHours}
        onChange={(e) => setTargetHours(e.target.value)}
        min="0"
        step="0.5"
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Startdatum</label>
          <input
            type="date"
            value={startDate ?? ''}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Enddatum</label>
          <input
            type="date"
            value={endDate ?? ''}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as Goal['visibility'])}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="PRIVATE">Privat</option>
        <option value="SHARED">Geteilt (nur lesen)</option>
        <option value="COLLABORATIVE">Kollaborativ</option>
      </select>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Speichern...' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-600 hover:bg-gray-50"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
