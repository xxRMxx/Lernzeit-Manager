import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export interface AdminUser {
  id: number
  email: string
  display_name: string
  avatar_url: string
  is_active: boolean
  role: 'USER' | 'ADMIN'
  date_joined: string
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => client.get<AdminUser[]>('/admin/users/').then((r) => r.data),
  })
}

export function useAdminUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminUser> & { id: number }) =>
      client.patch<AdminUser>(`/admin/users/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: ({ id, new_password }: { id: number; new_password: string }) =>
      client.post(`/admin/users/${id}/reset-password/`, { new_password }).then((r) => r.data),
  })
}
