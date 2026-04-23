import { useState, useEffect, useRef } from 'react'
import { useGoals } from '../api/goals'
import { useSaveSession } from '../api/sessions'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function Stopwatch() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [note, setNote] = useState('')
  const startedAtRef = useRef<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveSession = useSaveSession(selectedGoalId)

  useEffect(() => {
    if (running) {
      if (!startedAtRef.current) startedAtRef.current = new Date()
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current!.getTime()) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const handleSave = () => {
    if (!selectedGoalId || elapsed === 0 || !startedAtRef.current) return
    saveSession.mutate(
      { started_at: startedAtRef.current.toISOString(), duration_seconds: elapsed, note },
      {
        onSuccess: () => {
          setElapsed(0)
          setNote('')
          startedAtRef.current = null
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Stoppuhr</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          disabled={running}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <option value="">Ziel auswählen...</option>
          {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>

        <div className="text-center">
          <p className="text-6xl font-mono font-bold text-gray-800 tracking-wider mb-8">
            {formatTime(elapsed)}
          </p>
          <div className="flex justify-center gap-4">
            {!running ? (
              <button
                onClick={() => setRunning(true)}
                disabled={!selectedGoalId}
                className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-40"
              >
                {elapsed > 0 ? 'Fortsetzen' : 'Start'}
              </button>
            ) : (
              <button
                onClick={() => setRunning(false)}
                className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-yellow-600"
              >
                Pause
              </button>
            )}
            {elapsed > 0 && !running && (
              <button
                onClick={() => { setElapsed(0); startedAtRef.current = null; setNote('') }}
                className="border border-gray-300 text-gray-600 px-5 py-3 rounded-xl hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {elapsed > 0 && !running && (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-700">Session speichern</h2>
          <textarea
            placeholder="Notiz (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            onClick={handleSave}
            disabled={saveSession.isPending}
            className="w-full bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {saveSession.isPending ? 'Speichern...' : `Session speichern (${formatTime(elapsed)})`}
          </button>
          {saveSession.isSuccess && (
            <p className="text-green-600 text-sm text-center">✓ Session gespeichert!</p>
          )}
        </div>
      )}
    </div>
  )
}
