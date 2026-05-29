import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export interface User {
  id: number
  email: string
  display_name: string
}

export interface Membership {
  id: number
  user: User
  role: 'VIEWER' | 'CONTRIBUTOR'
  joined_at: string
}

export interface Plan {
  id: string
  weekly_hours: number
  created_at: string
}

export interface Milestone {
  id: string
  title: string
  target_date: string | null
  note: string
  status: 'OPEN' | 'DONE'
  created_by: User
}

export interface Goal {
  id: string
  owner: User
  title: string
  description: string
  target_hours: number
  start_date: string | null
  end_date: string | null
  visibility: 'PRIVATE' | 'SHARED' | 'COLLABORATIVE'
  progress_percent: number
  open_milestones: number
  own_hours: number
  created_at: string
  memberships: Membership[]
  plans: Plan[]
  milestones: Milestone[]
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => client.get<Goal[]>('/goals/').then((r) => r.data),
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => client.get<Goal>(`/goals/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Goal>) =>
      client.post<Goal>('/goals/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Goal>) =>
      client.patch<Goal>(`/goals/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', id] })
      qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/goals/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useGoalStats(id: string) {
  return useQuery({
    queryKey: ['goals', id, 'stats'],
    queryFn: () =>
      client.get<{
        own_hours: number
        total_hours: number
        target_hours: number
        progress_percent: number
        session_count: number
      }>(`/goals/${id}/stats/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useAddMember(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { user_id: number; role: string }) =>
      client.post(`/goals/${goalId}/members/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useRemoveMember(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => client.delete(`/goals/${goalId}/members/${userId}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useCreateMilestone(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; target_date?: string; note?: string }) =>
      client.post<Milestone>(`/goals/${goalId}/milestones/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useUpdateMilestone(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Milestone> & { id: string }) =>
      client.patch<Milestone>(`/goals/${goalId}/milestones/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useCreatePlan(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { weekly_hours: number }) =>
      client.post(`/goals/${goalId}/plans/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}
