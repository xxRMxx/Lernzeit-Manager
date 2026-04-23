import { Link } from 'react-router-dom'
import { useDashboard } from '../api/dashboard'
import { useAuthStore } from '../store/auth'

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-primary-500 h-2 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: goals, isLoading } = useDashboard()

  if (isLoading) return <div className="flex justify-center py-20 text-gray-400">Laden...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hallo{user?.display_name ? `, ${user.display_name}` : ''}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Deine aktiven Lernziele</p>
      </div>

      {!goals?.length ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium text-gray-500">Noch keine Ziele</p>
          <Link
            to="/goals"
            className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
          >
            Erstes Ziel erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{goal.title}</h2>
                  {goal.visibility !== 'PRIVATE' && (
                    <span className="text-xs text-primary-500 font-medium">
                      {goal.visibility === 'SHARED' ? 'Geteilt' : 'Kollaborativ'}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-primary-600">
                  {goal.progress_percent.toFixed(0)}%
                </span>
              </div>
              <ProgressBar percent={goal.progress_percent} />
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>{goal.own_hours.toFixed(1)} / {goal.target_hours} Stunden</span>
                {goal.open_milestones > 0 && <span>🏁 {goal.open_milestones} offen</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
