import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export function useSaveSession(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { started_at: string; duration_seconds: number; note?: string }) =>
      client.post(`/goals/${goalId}/sessions/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId, 'stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
