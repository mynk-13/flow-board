import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingScreen } from './LoadingScreen'

describe('LoadingScreen', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingScreen />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the FlowBoard brand name', async () => {
    render(<LoadingScreen />)
    expect(screen.getByText('FlowBoard')).toBeInTheDocument()
  })

  it('shows a loading message', () => {
    render(<LoadingScreen />)
    expect(screen.getByText(/loading|please wait|setting up/i)).toBeInTheDocument()
  })

  it('has a dark background', () => {
    const { container } = render(<LoadingScreen />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('bg-slate-950')
  })

  it('renders the spinning SVG ring', () => {
    const { container } = render(<LoadingScreen />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
