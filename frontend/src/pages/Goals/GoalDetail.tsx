import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGoal, useGoalStats, useUpdateGoal, useDeleteGoal } from '../../api/goals'
import GoalForm from './GoalForm'
import ProgressBar from '../../components/ProgressBar'

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: goal, isLoading } = useGoal(id!)
  const { data: stats } = useGoalStats(id!)
  const updateGoal = useUpdateGoal(id!)
  const deleteGoal = useDeleteGoal()
  const [editing, setEditing] = useState(false)

  if (isLoading || !goal) return <div className="py-20 text-center text-gray-400">Laden...</div>

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-600">
        ← Zurück
      </button>

      {editing ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <GoalForm
            initial={goal}
            onSubmit={(data) => updateGoal.mutate(data, { onSuccess: () => setEditing(false) })}
            onCancel={() => setEditing(false)}
            isPending={updateGoal.isPending}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{goal.title}</h1>
              {goal.description && <p className="text-gray-500 text-sm mt-1">{goal.description}</p>}
            </div>
            <button onClick={() => setEditing(true)} className="text-sm text-primary-600 hover:underline">
              Bearbeiten
            </button>
          </div>
          {stats && (
            <div className="mt-4 space-y-2">
              <ProgressBar percent={stats.progress_percent} size="md" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{stats.own_hours.toFixed(1)} / {stats.target_hours} Stunden</span>
                <span>{stats.progress_percent.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-gray-400">{stats.session_count} Sessions aufgezeichnet</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Meilensteine</h2>
        {goal.milestones.length === 0 ? (
          <p className="text-sm text-gray-400">Noch keine Meilensteine</p>
        ) : (
          <ul className="space-y-2">
            {goal.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-3 text-sm">
                <span>{m.status === 'DONE' ? '✅' : '⭕'}</span>
                <span className={m.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700'}>
                  {m.title}
                </span>
                {m.target_date && <span className="text-gray-300 text-xs ml-auto">{m.target_date}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Mitglieder</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
              {goal.owner.email[0].toUpperCase()}
            </span>
            <div>
              <p className="text-gray-700">{goal.owner.display_name || goal.owner.email}</p>
              <p className="text-xs text-gray-400">Owner</p>
            </div>
          </div>
          {goal.memberships.map((m) => (
            <div key={m.id} className="flex items-center gap-3 text-sm">
              <span className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-xs">
                {m.user.email[0].toUpperCase()}
              </span>
              <div>
                <p className="text-gray-700">{m.user.display_name || m.user.email}</p>
                <p className="text-xs text-gray-400">{m.role === 'CONTRIBUTOR' ? 'Mitwirkend' : 'Betrachter'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (window.confirm('Ziel wirklich löschen?')) {
            deleteGoal.mutate(id!, { onSuccess: () => navigate('/goals') })
          }
        }}
        className="w-full text-red-500 text-sm hover:underline py-2"
      >
        Ziel löschen
      </button>
    </div>
  )
}
