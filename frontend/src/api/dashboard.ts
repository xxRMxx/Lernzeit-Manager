import { useQuery } from '@tanstack/react-query'
import client from './client'

export interface DashboardEntry {
  id: string
  title: string
  visibility: string
  own_hours: number
  target_hours: number
  progress_percent: number
  open_milestones: number
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => client.get<DashboardEntry[]>('/dashboard/').then((r) => r.data),
  })
}
