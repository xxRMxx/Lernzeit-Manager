import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from './Login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../api/auth', () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  })
}))

describe('Login Page Smoke Test', () => {
  it('renders login page correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText(/Lernzeit-Manager/i)).toBeInTheDocument()
    expect(screen.getByText(/E-Mail Adresse/i)).toBeInTheDocument()
    expect(screen.getByText(/Passwort/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@beispiel.de')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument()
  })
})
