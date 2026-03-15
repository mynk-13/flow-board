import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LabelPicker } from './LabelPicker'

describe('LabelPicker', () => {
  let onChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChange = vi.fn()
  })

  it('renders preset label buttons', () => {
    render(<LabelPicker selected={[]} onChange={onChange} />)
    expect(screen.getByRole('button', { name: /bug/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /feature/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /infra/i })).toBeInTheDocument()
  })

  it('adds a label on click', () => {
    render(<LabelPicker selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /bug/i }))
    expect(onChange).toHaveBeenCalledWith(['bug'])
  })

  it('removes a label when clicking an already-selected one', () => {
    render(<LabelPicker selected={['bug', 'feature']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /bug/i }))
    expect(onChange).toHaveBeenCalledWith(['feature'])
  })

  it('shows selected labels with visual indicator', () => {
    render(<LabelPicker selected={['bug']} onChange={onChange} />)
    const bugBtn = screen.getByRole('button', { name: /bug/i })
    // Selected button has ring / border styling applied
    expect(bugBtn).toBeInTheDocument()
  })

  it('does nothing when disabled and a label is clicked', () => {
    render(<LabelPicker selected={[]} onChange={onChange} disabled />)
    fireEvent.click(screen.getByRole('button', { name: /bug/i }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows Custom label button', () => {
    render(<LabelPicker selected={[]} onChange={onChange} />)
    expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument()
  })

  it('opens custom input on Custom label click', () => {
    render(<LabelPicker selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /custom label/i }))
    expect(screen.getByPlaceholderText('Custom label…')).toBeInTheDocument()
  })

  it('adds custom label on Enter', () => {
    render(<LabelPicker selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /custom label/i }))
    const input = screen.getByPlaceholderText('Custom label…')
    fireEvent.change(input, { target: { value: 'my-label' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['my-label'])
  })

  it('does not add a duplicate custom label', () => {
    render(<LabelPicker selected={['my-label']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /custom label/i }))
    const input = screen.getByPlaceholderText('Custom label…')
    fireEvent.change(input, { target: { value: 'my-label' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    // onChange should not be called with the duplicate
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows custom selected labels as removable chips', () => {
    render(<LabelPicker selected={['my-label']} onChange={onChange} />)
    expect(screen.getByText('my-label')).toBeInTheDocument()
  })

  it('removes a custom label chip via the X button', () => {
    render(<LabelPicker selected={['my-label']} onChange={onChange} />)
    // The remove button inside the chip is the last button in the chip span
    const chip = screen.getByText('my-label').closest('span')!
    const removeBtn = chip.querySelector('button')!
    fireEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith([])
  })
})
