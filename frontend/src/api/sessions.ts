import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { Session } from './goals'

export function useSaveSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { goal: string; timeslot?: string | null; started_at: string; duration_seconds: number; note?: string }) =>
      client.post(`/goals/${data.goal}/sessions/`, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['goals', variables.goal, 'stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useUpdateSession(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Session> & { id: string }) =>
      client.patch(`/goals/${goalId}/sessions/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useDeleteSession(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/goals/${goalId}/sessions/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
