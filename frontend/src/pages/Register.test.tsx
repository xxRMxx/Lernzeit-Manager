import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Register from './Register'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../api/auth', () => ({
  useRegister: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  })
}))

describe('Register Page Smoke Test', () => {
  it('renders register page correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText(/Konto erstellen/i)).toBeInTheDocument()
    expect(screen.getByText('E-Mail Adresse')).toBeInTheDocument()
    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(screen.getByText('Passwort bestätigen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@beispiel.de')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Passwort wiederholen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Jetzt registrieren/i })).toBeInTheDocument()
  })
})
