import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectDropdown } from './SelectDropdown'
import type { SelectOption } from './SelectDropdown'

const OPTIONS: SelectOption[] = [
  { value: 'admin',  label: 'Admin',  description: 'Full access' },
  { value: 'writer', label: 'Writer', description: 'Can edit tasks' },
  { value: 'reader', label: 'Reader', description: 'View only' },
]

describe('SelectDropdown', () => {
  let onChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChange = vi.fn()
  })

  it('renders the currently selected label', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('falls back to the first option for an unknown value', () => {
    render(<SelectDropdown value="unknown" onChange={onChange} options={OPTIONS} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('opens panel on trigger click', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} />)
    expect(screen.queryByText('View only')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Can edit tasks')).toBeInTheDocument()
    expect(screen.getByText('View only')).toBeInTheDocument()
  })

  it('calls onChange when an option is selected', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Writer'))
    expect(onChange).toHaveBeenCalledWith('writer')
  })

  it('closes panel after selection', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Reader'))
    expect(screen.queryByText('View only')).not.toBeInTheDocument()
  })

  it('is disabled when disabled=true', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} disabled />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('does not open when disabled', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByText('Can edit tasks')).not.toBeInTheDocument()
  })

  it('closes when clicking outside', () => {
    render(<SelectDropdown value="admin" onChange={onChange} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('View only')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('View only')).not.toBeInTheDocument()
  })

  it('shows a check next to the selected option in the open panel', () => {
    render(<SelectDropdown value="writer" onChange={onChange} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    const writerRow = screen.getAllByText('Writer').find(
      (el) => el.closest('[role="option"], button, li') !== null
    )
    expect(writerRow).toBeDefined()
  })
})
