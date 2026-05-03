import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import MockAdapter from 'axios-mock-adapter'
import client from './client'
import { useLogin, useRegister, useLogout } from './auth'
import { useAuthStore } from '../store/auth'
import React from 'react'

const mockClient = new MockAdapter(client)

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual as any,
    useNavigate: vi.fn(),
  }
})

describe('auth hooks', () => {
  let queryClient: QueryClient
  let navigateMock: any

  beforeEach(() => {
    mockClient.reset()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    useAuthStore.setState({ token: null, user: null })
    navigateMock = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(navigateMock)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  describe('useLogin', () => {
    it('should successfully log in, fetch user data, set auth store, and navigate', async () => {
      const { result } = renderHook(() => useLogin(), { wrapper })

      mockClient.onPost('/auth/login/').reply(200, { key: 'fake-token' })
      mockClient.onGet('/users/me/').reply(200, { id: 1, email: 'test@test.com', display_name: 'Test' })

      result.current.mutate({ email: 'test@test.com', password: 'password123' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(useAuthStore.getState().token).toBe('fake-token')
      expect(useAuthStore.getState().user).toEqual({ id: 1, email: 'test@test.com', display_name: 'Test' })
      expect(navigateMock).toHaveBeenCalledWith('/')
    })

    it('should handle login error', async () => {
      const { result } = renderHook(() => useLogin(), { wrapper })

      mockClient.onPost('/auth/login/').reply(400, { error: 'Invalid credentials' })

      result.current.mutate({ email: 'wrong@test.com', password: 'wrong' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(useAuthStore.getState().token).toBeNull()
      expect(navigateMock).not.toHaveBeenCalled()
    })
  })

  describe('useRegister', () => {
    it('should successfully register, fetch user data, set auth store, and navigate', async () => {
      const { result } = renderHook(() => useRegister(), { wrapper })

      mockClient.onPost('/auth/registration/').reply(200, { key: 'reg-token' })
      mockClient.onGet('/users/me/').reply(200, { id: 2, email: 'new@test.com', display_name: 'New User' })

      result.current.mutate({ email: 'new@test.com', password1: 'pass123', password2: 'pass123' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(useAuthStore.getState().token).toBe('reg-token')
      expect(useAuthStore.getState().user).toEqual({ id: 2, email: 'new@test.com', display_name: 'New User' })
      expect(navigateMock).toHaveBeenCalledWith('/')
    })
  })

  describe('useLogout', () => {
    it('should successfully logout, clear auth store, and navigate', async () => {
      useAuthStore.setState({ token: 'some-token', user: { id: 1, email: 'a', display_name: 'b' } })

      const { result } = renderHook(() => useLogout(), { wrapper })

      mockClient.onPost('/auth/logout/').reply(200)

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(useAuthStore.getState().token).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
      expect(navigateMock).toHaveBeenCalledWith('/login')
    })
  })
})
