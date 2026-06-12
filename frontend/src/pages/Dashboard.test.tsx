import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../api/dashboard', () => ({
  useDashboard: () => ({
    data: {
      goals: [
        {
          id: 'g1',
          title: 'Mathematik II',
          visibility: 'PRIVATE',
          own_hours: 12,
          target_hours: 30,
          progress_percent: 40,
          open_milestones: 2,
        }
      ],
      streak: 5,
    },
    isLoading: false,
  })
}))

vi.mock('../api/goals', () => ({
  useGoals: () => ({
    data: [
      {
        id: 'g1',
        title: 'Mathematik II',
        description: 'Analysis und Lineare Algebra',
        start_date: '2026-06-01',
        target_hours: 30,
        is_collaborative: false,
        own_hours: 12,
        progress_percent: 40,
        members: []
      }
    ],
    isLoading: false,
  }),
  useGlobalSessions: () => ({
    data: [
      {
        id: 's1',
        goal: 'g1',
        goal_title: 'Mathematik II',
        started_at: new Date().toISOString(),
        duration_seconds: 3600,
        note: 'Übungsblatt 4 gelöst',
      }
    ],
    isLoading: false,
  }),
  useGlobalTimeSlots: () => ({
    data: [
      {
        id: 'ts1',
        goal: 'g1',
        goal_title: 'Mathematik II',
        date: new Date().toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '15:30',
        status: 'OPEN',
        note: 'Vorlesung nacharbeiten',
      }
    ],
    isLoading: false,
  })
}))

describe('Dashboard Page Smoke Test', () => {
  it('renders dashboard page with active widgets correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify streak and stats
    expect(screen.getByText(/5 Tage/i)).toBeInTheDocument() // Streak count
    expect(screen.getByText('Mathematik II')).toBeInTheDocument()
    expect(screen.getByText('12.0 / 30h')).toBeInTheDocument()
  })
})
