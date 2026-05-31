import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import client from './client'
import { useAuthStore } from '../store/auth'

interface LoginData { email: string; password: string }
interface RegisterData { email: string; password1: string; password2: string }

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
