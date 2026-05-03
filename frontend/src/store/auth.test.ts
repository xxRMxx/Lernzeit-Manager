import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useAuthStore.setState({ token: null, user: null })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('should set auth data correctly', () => {
    const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }
    const mockToken = 'mock-token-123'

    useAuthStore.getState().setAuth(mockToken, mockUser)

    const state = useAuthStore.getState()
    expect(state.token).toBe(mockToken)
    expect(state.user).toEqual(mockUser)
  })

  it('should clear auth data on logout', () => {
    const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }
    const mockToken = 'mock-token-123'

    // Set initial state
    useAuthStore.setState({ token: mockToken, user: mockUser })

    // Perform logout
    useAuthStore.getState().logout()

    // Verify state is cleared
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })
})
