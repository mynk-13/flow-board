import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordInput } from './PasswordInput'

const noop = vi.fn()

describe('PasswordInput', () => {
  it('renders an input of type password by default', () => {
    render(<PasswordInput id="pw" value="" onChange={noop} />)
    const input = document.getElementById('pw') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.type).toBe('password')
  })

  it('renders a visibility toggle button', () => {
    render(<PasswordInput id="pw" value="" onChange={noop} />)
    const btn = screen.getByRole('button', { name: /show password/i })
    expect(btn).toBeInTheDocument()
  })

  it('toggles input type to text when toggle is clicked', () => {
    render(<PasswordInput id="pw" value="secret" onChange={noop} />)
    const input = document.getElementById('pw') as HTMLInputElement
    expect(input.type).toBe('password')
    fireEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(input.type).toBe('text')
  })

  it('hides the password again on second click', () => {
    render(<PasswordInput id="pw" value="secret" onChange={noop} />)
    const input = document.getElementById('pw') as HTMLInputElement
    fireEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(input.type).toBe('text')
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input.type).toBe('password')
  })

  it('calls onChange when typing', () => {
    const handleChange = vi.fn()
    render(<PasswordInput id="pw" value="" onChange={handleChange} />)
    const input = document.getElementById('pw') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(handleChange).toHaveBeenCalledOnce()
  })

  it('calls onBlur when focus leaves', () => {
    const handleBlur = vi.fn()
    render(<PasswordInput id="pw" value="" onChange={noop} onBlur={handleBlur} />)
    const input = document.getElementById('pw') as HTMLInputElement
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledOnce()
  })

  it('applies leftIcon when provided', () => {
    const { container } = render(
      <PasswordInput id="pw" value="" onChange={noop} leftIcon={<span data-testid="icon" />} />
    )
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
  })

  it('applies error state class', () => {
    render(<PasswordInput id="pw" value="" onChange={noop} state="error" />)
    const input = document.getElementById('pw') as HTMLInputElement
    expect(input.className).toContain('border-red-300')
  })

  it('applies success state class', () => {
    render(<PasswordInput id="pw" value="" onChange={noop} state="success" />)
    const input = document.getElementById('pw') as HTMLInputElement
    expect(input.className).toContain('border-emerald-400')
  })

  it('passes placeholder to the input', () => {
    render(<PasswordInput id="pw" value="" onChange={noop} placeholder="Enter password" />)
    const input = document.getElementById('pw') as HTMLInputElement
    expect(input.placeholder).toBe('Enter password')
  })

  it('sets required attribute when required=true', () => {
    render(<PasswordInput id="pw" value="" onChange={noop} required />)
    const input = document.getElementById('pw') as HTMLInputElement
    expect(input.required).toBe(true)
  })
})
