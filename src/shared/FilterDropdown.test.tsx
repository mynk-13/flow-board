import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterDropdown } from './FilterDropdown'
import type { DropdownOption } from './FilterDropdown'

const OPTIONS: DropdownOption[] = [
  { value: 'bug',     label: 'Bug',     dotColor: '#ef4444' },
  { value: 'feature', label: 'Feature', dotColor: '#3b82f6' },
  { value: 'docs',    label: 'Docs',    dotColor: '#22c55e' },
]

describe('FilterDropdown', () => {
  let onChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChange = vi.fn()
  })

  it('renders the placeholder when no value is selected', () => {
    render(<FilterDropdown value={null} onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  it('shows selected label when value is set', () => {
    render(<FilterDropdown value="bug" onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
  })

  it('opens dropdown panel on trigger click', () => {
    render(<FilterDropdown value={null} onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    // Panel is hidden initially
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    // Options should be visible
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('calls onChange with the selected value', () => {
    render(<FilterDropdown value={null} onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Feature'))
    expect(onChange).toHaveBeenCalledWith('feature')
  })

  it('shows clear button when a value is selected', () => {
    render(<FilterDropdown value="bug" onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clears selection when clear button is clicked', () => {
    render(<FilterDropdown value="bug" onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    fireEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('closes dropdown when the same item is clicked again', () => {
    render(<FilterDropdown value={null} onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Bug')).toBeInTheDocument()
    // Click outside to close
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows a checkmark next to the currently selected option', () => {
    render(<FilterDropdown value="docs" onChange={onChange} options={OPTIONS} placeholder="Filter" />)
    // Open the dropdown using the main trigger (first button, not the clear span)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    // The selected option row ("Docs") should have a Check svg inside it
    const docsRow = screen.getAllByText('Docs').at(-1)!.closest('button')!
    expect(docsRow.querySelector('svg')).toBeInTheDocument()
  })
})
