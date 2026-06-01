import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoalForm from './GoalForm'

describe('GoalForm', () => {
  it('defaults start_date to today for new goals', () => {
    const today = new Date().toISOString().split('T')[0]
    
    render(
      <GoalForm 
        onSubmit={() => {}} 
        onCancel={() => {}} 
        isPending={false} 
      />
    )
    
    const startDateInput = screen.getByLabelText(/Startdatum/i) as HTMLInputElement
    expect(startDateInput.value).toBe(today)
  })

  it('uses initial start_date when provided', () => {
    const initialDate = '2026-01-01'
    
    render(
      <GoalForm 
        initial={{ start_date: initialDate }}
        onSubmit={() => {}} 
        onCancel={() => {}} 
        isPending={false} 
      />
    )
    
    const startDateInput = screen.getByLabelText(/Startdatum/i) as HTMLInputElement
    expect(startDateInput.value).toBe(initialDate)
  })
})
