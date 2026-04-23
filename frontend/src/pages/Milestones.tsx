import { useState } from 'react'
import { useGoals, useCreateMilestone, useUpdateMilestone } from '../api/goals'
import type { Milestone } from '../api/goals'

export default function Milestones() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createMilestone = useCreateMilestone(selectedGoalId)
  const updateMilestone = useUpdateMilestone(selectedGoalId)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !selectedGoalId) return
    createMilestone.mutate(
      { title: newTitle, target_date: newDate || undefined },
      { onSuccess: () => { setNewTitle(''); setNewDate('') } }
    )
  }

  const toggleStatus = (m: Milestone) => {
    updateMilestone.mutate({ id: m.id, status: m.status === 'OPEN' ? 'DONE' : 'OPEN' })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Meilensteine</h1>

      <select
        value={selectedGoalId}
        onChange={(e) => setSelectedGoalId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Ziel auswählen...</option>
        {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
      </select>

      {selectedGoal && (
        <>
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 shadow-sm flex gap-2">
            <input
              placeholder="Neuer Meilenstein..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={createMilestone.isPending}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              +
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {selectedGoal.milestones.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">Noch keine Meilensteine</p>
            ) : (
              selectedGoal.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleStatus(m)} className="text-xl flex-shrink-0">
                    {m.status === 'DONE' ? '✅' : '⭕'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${m.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {m.title}
                    </p>
                    {m.target_date && <p className="text-xs text-gray-400">{m.target_date}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
