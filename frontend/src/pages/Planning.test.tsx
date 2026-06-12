import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Planning from './Planning'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

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
  }),
  useCreateTimeSlot: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTimeSlot: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTimeSlot: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateSession: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('Planning Page Smoke Test', () => {
  it('renders planning page correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Planning />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify presence of table headers and entry details
    expect(screen.getByText('Bezeichnung')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText(/Zeit \(Ist \/ Soll\)/i)).toBeInTheDocument()
    expect(screen.getByText('Aktionen')).toBeInTheDocument()
    expect(screen.getByText('Vorlesung nacharbeiten')).toBeInTheDocument()
  })
})
