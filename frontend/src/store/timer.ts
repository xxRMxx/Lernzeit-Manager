import { create } from 'zustand'

export interface TimerState {
  running: boolean
  elapsed: number // Base elapsed time in seconds
  startedAt: string | null // ISO string of when it was last started/resumed
  selectedSlotId: string
  selectedGoalId: string
  note: string
  manualMode: boolean
  manualHours: string
  manualMinutes: string

  setRunning: (running: boolean) => void
  setElapsed: (elapsed: number) => void
  setStartedAt: (startedAt: string | null) => void
  setSelectedSlotId: (selectedSlotId: string) => void
  setSelectedGoalId: (selectedGoalId: string) => void
  setNote: (note: string) => void
  setManualMode: (manualMode: boolean) => void
  setManualHours: (manualHours: string) => void
  setManualMinutes: (manualMinutes: string) => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  running: false,
  elapsed: 0,
  startedAt: null,
  selectedSlotId: '',
  selectedGoalId: '',
  note: '',
  manualMode: false,
  manualHours: '1',
  manualMinutes: '30',

  setRunning: (running) => set({ running }),
  setElapsed: (elapsed) => set({ elapsed }),
  setStartedAt: (startedAt) => set({ startedAt }),
  setSelectedSlotId: (selectedSlotId) => set({ selectedSlotId }),
  setSelectedGoalId: (selectedGoalId) => set({ selectedGoalId }),
  setNote: (note) => set({ note }),
  setManualMode: (manualMode) => set({ manualMode }),
  setManualHours: (manualHours) => set({ manualHours }),
  setManualMinutes: (manualMinutes) => set({ manualMinutes }),
  reset: () => set({
    running: false,
    elapsed: 0,
    startedAt: null,
    selectedSlotId: '',
    selectedGoalId: '',
    note: '',
  })
}))
