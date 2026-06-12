import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Settings from '../pages/Settings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { useAuthStore } from '../store/auth'
import React from 'react'

vi.mock('../api/auth', () => ({
  useLogout: () => ({
    mutate: vi.fn(),
    isPending: false,
  })
}))

describe('Settings & Theme Integration Test', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'mock-token-123',
      user: {
        id: 1,
        email: 'integration@example.com',
        display_name: 'Integration User',
      }
    })
  })

  it('verifies that dark class is removed and settings render', () => {
    // Manually add dark class to simulate previous dark mode state
    document.documentElement.classList.add('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const queryClient = new QueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ThemeProvider>
            <Settings />
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify user profile is rendered
    expect(screen.getByText('Integration User')).toBeInTheDocument()
    
    // Verify that the 'dark' class has been removed by the ThemeProvider
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
