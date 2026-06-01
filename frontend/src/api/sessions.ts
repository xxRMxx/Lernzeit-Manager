import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export function useSaveSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { goal: string; started_at: string; duration_seconds: number; note?: string }) =>
      client.post(`/goals/${data.goal}/sessions/`, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['goals', variables.goal, 'stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
