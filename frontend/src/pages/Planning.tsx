import { useState } from 'react'
import { useGoals, useCreatePlan } from '../api/goals'

export default function Planning() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [weeklyHours, setWeeklyHours] = useState('')
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createPlan = useCreatePlan(selectedGoalId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId || !weeklyHours) return
    createPlan.mutate({ weekly_hours: Number(weeklyHours) }, { onSuccess: () => setWeeklyHours('') })
  }

  const latestPlan = selectedGoal?.plans[selectedGoal.plans.length - 1]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Planung</h1>

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
          {latestPlan && (
            <div className="bg-primary-50 rounded-2xl p-4">
              <p className="text-sm text-primary-700 font-medium">Aktueller Plan</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{latestPlan.weekly_hours}h</p>
              <p className="text-xs text-primary-400">pro Woche</p>
              {selectedGoal.target_hours > 0 && latestPlan.weekly_hours > 0 && (
                <p className="text-xs text-primary-500 mt-2">
                  ≈ {Math.ceil(selectedGoal.target_hours / latestPlan.weekly_hours)} Wochen bis zum Ziel
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-700">Neuen Plan erstellen</h2>
            <input
              type="number"
              placeholder="Stunden pro Woche"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              min="0.5"
              step="0.5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={createPlan.isPending}
              className="w-full bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              Plan speichern
            </button>
          </form>

          {selectedGoal.plans.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm">
              <h2 className="font-semibold text-gray-700 p-4 pb-2">Planhistorie</h2>
              <div className="divide-y divide-gray-100">
                {[...selectedGoal.plans].reverse().map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className={i === 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                      {p.weekly_hours}h/Woche
                    </span>
                    <span className="text-gray-300 text-xs">
                      {new Date(p.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
