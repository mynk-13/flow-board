import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowBoardLogo } from './FlowBoardLogo'

describe('FlowBoardLogo', () => {
  it('renders an SVG element', () => {
    const { container } = render(<FlowBoardLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('has correct default dimensions (28×28)', () => {
    const { container } = render(<FlowBoardLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '28')
    expect(svg).toHaveAttribute('height', '28')
  })

  it('accepts a custom size', () => {
    const { container } = render(<FlowBoardLogo size={52} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '52')
    expect(svg).toHaveAttribute('height', '52')
  })

  it('applies a custom className', () => {
    const { container } = render(<FlowBoardLogo className="my-logo" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('my-logo')
  })

  it('has an accessible aria-label', () => {
    const { container } = render(<FlowBoardLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'FlowBoard')
  })

  it('contains a gradient definition', () => {
    const { container } = render(<FlowBoardLogo />)
    const gradient = container.querySelector('linearGradient')
    expect(gradient).toBeInTheDocument()
    expect(gradient).toHaveAttribute('id', 'fbg')
  })

  it('renders the background rect with gradient fill', () => {
    const { container } = render(<FlowBoardLogo />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBeGreaterThan(0)
    // First rect is the background
    expect(rects[0]).toHaveAttribute('fill', 'url(#fbg)')
  })
})
