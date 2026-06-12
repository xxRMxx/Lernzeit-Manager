import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Settings from './Settings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import React from 'react'

vi.mock('../api/auth', () => ({
  useLogout: () => ({
    mutate: vi.fn(),
    isPending: false,
  })
}))

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Settings Page Smoke Test', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'mock-token-123',
      user: {
        id: 1,
        email: 'test-user@example.com',
        display_name: 'Max Mustermann',
      }
    })
  })

  it('renders settings page correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Max Mustermann')).toBeInTheDocument()
    expect(screen.getByText('test-user@example.com')).toBeInTheDocument()
    expect(screen.getByText('Benachrichtigungen')).toBeInTheDocument()
    expect(screen.getByText('Account & Sicherheit')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abmelden/i })).toBeInTheDocument()
  })
})
