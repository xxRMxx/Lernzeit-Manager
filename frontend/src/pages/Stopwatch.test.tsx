import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Stopwatch from './Stopwatch'
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

vi.mock('../api/sessions', () => ({
  useSaveSession: () => ({
    mutate: vi.fn(),
    isPending: false,
  })
}))

describe('Stopwatch Page Smoke Test', () => {
  it('renders stopwatch page with controls correctly', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Stopwatch />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify time display and control buttons using textContent matcher since elements are split
    expect(screen.getByText((content, element) => element?.textContent === '00:00:00')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Was hast du heute gelernt/i)).toBeInTheDocument()
    expect(screen.getByText('Was hast du heute geplant?')).toBeInTheDocument()
  })
})
