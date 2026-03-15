import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

// Mock the Zustand store
const mockToggleDark = vi.fn()
let mockIsDark = false

vi.mock('@/lib/store', () => ({
  useUIStore: () => ({
    isDark: mockIsDark,
    toggleDark: mockToggleDark,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockToggleDark.mockClear()
    mockIsDark = false
  })

  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Switch to dark mode" label in light mode', () => {
    mockIsDark = false
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode')
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Dark mode')
  })

  it('shows "Switch to light mode" label in dark mode', () => {
    mockIsDark = true
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode')
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Light mode')
  })

  it('calls toggleDark when clicked', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockToggleDark).toHaveBeenCalledOnce()
  })

  it('calls toggleDark again on second click', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(mockToggleDark).toHaveBeenCalledTimes(2)
  })
})
