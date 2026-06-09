import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import client from './client'
import { useAuthStore } from '../store/auth'

interface LoginData { email: string; password: string }
interface RegisterData { email: string; password1: string; password2: string }
interface ChangePasswordData { old_password: string; new_password: string }
interface ChangeEmailData { new_email: string; password: string }
interface DeleteAccountData { password: string }
interface UserPreferences { learning_reminders_enabled: boolean; weekly_report_enabled: boolean }

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginData) =>
      client.post<{ key: string }>('/auth/login/', data).then((r) => r.data),
    onSuccess: async (data) => {
      // Wir setzen erst den Token, damit der Interceptor ihn für den /me/ Call findet
      setAuth(data.key, null as any) 
      const me = await client.get('/users/me/')
      setAuth(data.key, me.data)
      navigate('/')
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterData) =>
      client.post<{ key: string }>('/auth/registration/', data).then((r) => r.data),
    onSuccess: async (data) => {
      // Wir setzen erst den Token, damit der Interceptor ihn für den /me/ Call findet
      setAuth(data.key, null as any) 
      const me = await client.get('/users/me/')
      setAuth(data.key, me.data)
      navigate('/')
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => client.post('/auth/logout/'),
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) =>
      client.post('/users/change-password/', data).then((r) => r.data),
  })
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: (data: ChangeEmailData) =>
      client.post('/users/change-email/', data).then((r) => r.data),
  })
}

export function useDeleteAccount() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: DeleteAccountData) =>
      client.post('/users/delete-account/', data).then((r) => r.data),
    onSuccess: () => {
      logout()
      navigate('/login')
    },
  })
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => client.get<UserPreferences>('/users/preferences/').then((r) => r.data),
  })
}

export function useUpdateUserPreferences() {
  return useMutation({
    mutationFn: (data: UserPreferences) =>
      client.patch('/users/preferences/', data).then((r) => r.data),
  })
}
