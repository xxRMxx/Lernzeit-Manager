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

export interface RoughPlan {
  id: string
  year: number
  month: number
  planned_hours: number
  note: string
}

export interface Session {
  id: string
  user: User
  goal: string
  timeslot?: string | null
  goal_title: string
  started_at: string
  duration_seconds: number
  note: string
  status: 'OPEN' | 'COMPLETED'
  created_at: string
  updated_at: string
}

export interface TimeSlot {
  id: string
  goal: string
  goal_title: string
  date: string
  planned_minutes: number
  note: string
  status: 'OPEN' | 'COMPLETED'
  created_at: string
  updated_at: string
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
  updated_at: string
  memberships: Membership[]
  plans: Plan[]
  rough_plans: RoughPlan[]
  time_slots: TimeSlot[]
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
    mutationFn: (data: { user_id?: number; email?: string; role: string }) =>
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

export function useCreateSession(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { started_at: string; duration_seconds: number; note?: string; timeslot?: string | null }) =>
      client.post(`/goals/${goalId}/sessions/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useCreateRoughPlan(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { year: number; month: number; planned_hours: number; note?: string }) =>
      client.post(`/goals/${goalId}/rough-plans/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useCreateTimeSlot(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { date: string; planned_minutes: number; note?: string }) =>
      client.post(`/goals/${goalId}/time-slots/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useUpdateTimeSlot(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<TimeSlot> & { id: string }) =>
      client.patch(`/goals/${goalId}/time-slots/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useDeleteTimeSlot(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/goals/${goalId}/time-slots/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useGlobalSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => client.get<Session[]>('/sessions/').then((r) => r.data),
  })
}

export function useGlobalTimeSlots() {
  return useQuery({
    queryKey: ['time-slots'],
    queryFn: () => client.get<TimeSlot[]>('/time-slots/').then((r) => r.data),
  })
}
