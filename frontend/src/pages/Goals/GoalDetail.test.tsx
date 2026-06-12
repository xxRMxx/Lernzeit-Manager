import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoalDetail from './GoalDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

vi.mock('../../api/goals', () => ({
  useGoal: () => ({
    data: {
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
      owner: {
        id: 1,
        email: 'owner@example.com',
        display_name: 'Max Mustermann'
      },
      memberships: [],
      milestones: [],
      rough_plans: []
    },
    isLoading: false,
  }),
  useGoalStats: () => ({
    data: {
      own_hours: 12,
      target_hours: 30,
      progress_percent: 40,
      total_hours: 12,
    },
    isLoading: false,
  }),
  useUpdateGoal: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteGoal: () => ({ mutate: vi.fn(), isPending: false }),
  useAddMember: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('GoalDetail Page Smoke Test', () => {
  it('renders goal detail page correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/goals/g1']}>
          <Routes>
            <Route path="/goals/:id" element={<GoalDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify main components and descriptions are loaded
    expect(screen.getByText('Mathematik II')).toBeInTheDocument()
    expect(screen.getByText('Analysis und Lineare Algebra')).toBeInTheDocument()
    expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument()
    expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
  })
})
