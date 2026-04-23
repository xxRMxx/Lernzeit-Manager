import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoals, useCreateGoal } from '../../api/goals'
import GoalForm from './GoalForm'

export default function GoalList() {
  const { data: goals, isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return <div className="py-20 text-center text-gray-400">Laden...</div>

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lernziele</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
        >
          + Neu
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Neues Ziel</h2>
          <GoalForm
            onSubmit={(data) => createGoal.mutate(data, { onSuccess: () => setShowForm(false) })}
            onCancel={() => setShowForm(false)}
            isPending={createGoal.isPending}
          />
        </div>
      )}

      {!goals?.length && !showForm ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p>Noch keine Ziele vorhanden</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {goals?.map((goal) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{goal.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{goal.target_hours} Stunden Ziel</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
