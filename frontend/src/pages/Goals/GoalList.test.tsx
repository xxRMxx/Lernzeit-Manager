import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoalList from './GoalList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../../api/goals', () => ({
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
        visibility: 'PRIVATE',
        updated_at: '2026-06-11T12:00:00Z',
        members: []
      }
    ],
    isLoading: false,
  }),
  useCreateGoal: () => ({
    mutate: vi.fn(),
    isPending: false,
  })
}))

describe('GoalList Page Smoke Test', () => {
  it('renders goal list page correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GoalList />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify list headers and the mock goal
    expect(screen.getByText('Mathematik II')).toBeInTheDocument()
    expect(screen.getByText('Privat')).toBeInTheDocument()
    expect(screen.getByText('12h / 30h')).toBeInTheDocument()
  })
})
