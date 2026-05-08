import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import client from './client'
import {
  useGoals,
  useGoal,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useGoalStats,
  useAddMember,
  useRemoveMember,
  useCreateMilestone,
  useUpdateMilestone,
  useCreatePlan
} from './goals'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('goals hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useGoals', () => {
    it('fetches goals successfully', async () => {
      const mockGoals = [{ id: '1', title: 'Goal 1' }, { id: '2', title: 'Goal 2' }]
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockGoals })

      const { result } = renderHook(() => useGoals(), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockGoals)
      expect(client.get).toHaveBeenCalledWith('/goals/')
    })

    it('handles fetch error', async () => {
      const error = new Error('Network error')
      vi.mocked(client.get).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useGoals(), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toEqual(error)
      expect(client.get).toHaveBeenCalledWith('/goals/')
    })
  })

  describe('useGoal', () => {
    it('fetches single goal successfully', async () => {
      const mockGoal = { id: '1', title: 'Goal 1' }
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockGoal })

      const { result } = renderHook(() => useGoal('1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockGoal)
      expect(client.get).toHaveBeenCalledWith('/goals/1/')
    })

    it('does not fetch when id is not provided', async () => {
      const { result } = renderHook(() => useGoal(''), {
        wrapper: createWrapper()
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(client.get).not.toHaveBeenCalled()
    })
  })

  describe('useCreateGoal', () => {
    it('creates goal successfully', async () => {
      const newGoal = { title: 'New Goal' }
      const mockCreatedGoal = { id: '3', ...newGoal }
      vi.mocked(client.post).mockResolvedValueOnce({ data: mockCreatedGoal })

      const { result } = renderHook(() => useCreateGoal(), {
        wrapper: createWrapper()
      })

      result.current.mutate(newGoal)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockCreatedGoal)
      expect(client.post).toHaveBeenCalledWith('/goals/', newGoal)
    })
  })

  describe('useUpdateGoal', () => {
    it('updates goal successfully', async () => {
      const updateData = { title: 'Updated Goal' }
      const mockUpdatedGoal = { id: '1', ...updateData }
      vi.mocked(client.patch).mockResolvedValueOnce({ data: mockUpdatedGoal })

      const { result } = renderHook(() => useUpdateGoal('1'), {
        wrapper: createWrapper()
      })

      result.current.mutate(updateData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockUpdatedGoal)
      expect(client.patch).toHaveBeenCalledWith('/goals/1/', updateData)
    })
  })

  describe('useDeleteGoal', () => {
    it('deletes goal successfully', async () => {
      vi.mocked(client.delete).mockResolvedValueOnce({})

      const { result } = renderHook(() => useDeleteGoal(), {
        wrapper: createWrapper()
      })

      result.current.mutate('1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(client.delete).toHaveBeenCalledWith('/goals/1/')
    })
  })

  describe('useGoalStats', () => {
    it('fetches goal stats successfully', async () => {
      const mockStats = { own_hours: 10, total_hours: 20 }
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockStats })

      const { result } = renderHook(() => useGoalStats('1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockStats)
      expect(client.get).toHaveBeenCalledWith('/goals/1/stats/')
    })
  })

  describe('useAddMember', () => {
    it('adds member successfully', async () => {
      const memberData = { user_id: 2, role: 'CONTRIBUTOR' }
      const mockResponse = { id: 1, ...memberData }
      vi.mocked(client.post).mockResolvedValueOnce({ data: mockResponse })

      const { result } = renderHook(() => useAddMember('1'), {
        wrapper: createWrapper()
      })

      result.current.mutate(memberData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
      expect(client.post).toHaveBeenCalledWith('/goals/1/members/', memberData)
    })
  })

  describe('useRemoveMember', () => {
    it('removes member successfully', async () => {
      vi.mocked(client.delete).mockResolvedValueOnce({})

      const { result } = renderHook(() => useRemoveMember('1'), {
        wrapper: createWrapper()
      })

      result.current.mutate(2)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(client.delete).toHaveBeenCalledWith('/goals/1/members/2/')
    })
  })

  describe('useCreateMilestone', () => {
    it('creates milestone successfully', async () => {
      const milestoneData = { title: 'New Milestone' }
      const mockResponse = { id: 'm1', ...milestoneData }
      vi.mocked(client.post).mockResolvedValueOnce({ data: mockResponse })

      const { result } = renderHook(() => useCreateMilestone('1'), {
        wrapper: createWrapper()
      })

      result.current.mutate(milestoneData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
      expect(client.post).toHaveBeenCalledWith('/goals/1/milestones/', milestoneData)
    })
  })

  describe('useUpdateMilestone', () => {
    it('updates milestone successfully', async () => {
      const updateData = { id: 'm1', title: 'Updated Milestone' }
      const mockResponse = { ...updateData }
      vi.mocked(client.patch).mockResolvedValueOnce({ data: mockResponse })

      const { result } = renderHook(() => useUpdateMilestone('1'), {
        wrapper: createWrapper()
      })

      result.current.mutate(updateData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
      const { id, ...dataWithoutId } = updateData
      expect(client.patch).toHaveBeenCalledWith('/goals/1/milestones/m1/', dataWithoutId)
    })
  })

  describe('useCreatePlan', () => {
    it('creates plan successfully', async () => {
      const planData = { weekly_hours: 10 }
      const mockResponse = { id: 'p1', ...planData }
      vi.mocked(client.post).mockResolvedValueOnce({ data: mockResponse })

      const { result } = renderHook(() => useCreatePlan('1'), {
        wrapper: createWrapper()
      })

      result.current.mutate(planData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
      expect(client.post).toHaveBeenCalledWith('/goals/1/plans/', planData)
    })
  })
})
