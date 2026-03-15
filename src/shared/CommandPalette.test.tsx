import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/features/auth', () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}))

const mockClose = vi.fn()
vi.mock('@/lib/store', () => ({
  useUIStore: vi.fn(() => ({
    cmdPaletteOpen: true,
    closeCmdPalette: mockClose,
  })),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CommandPalette', () => {
  const defaultProps = {
    ownedProjects: [],
    sharedProjects: [],
    onCreateProject: vi.fn(),
  }

  beforeEach(() => {
    mockClose.mockClear()
  })

  it('renders the search input when open', () => {
    render(<CommandPalette {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search or jump to…')).toBeInTheDocument()
  })

  it('renders navigation items (Home and Analytics)', () => {
    render(<CommandPalette {...defaultProps} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('renders Actions section items', () => {
    render(<CommandPalette {...defaultProps} />)
    expect(screen.getByText('Create new project')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('filters items by query — non-matching items disappear', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search or jump to…')
    // "Go to dashboard" is the description of "Home" — it won't match "analytics"
    expect(screen.getByText('Go to dashboard')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'analytics' } })
    expect(screen.queryByText('Go to dashboard')).not.toBeInTheDocument()
  })

  it('shows "No results" when query matches nothing', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search or jump to…')
    fireEvent.change(input, { target: { value: 'zzznomatch999' } })
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })

  it('calls closeCmdPalette on Escape key', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search or jump to…')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('shows an owned project in the results', () => {
    const props = {
      ...defaultProps,
      ownedProjects: [
        {
          id: 'p1', name: 'Alpha Project',
          members: {}, memberIds: [],
          createdBy: 'u1', workspaceId: 'w1',
          createdAt: Date.now(),
        } as any,
      ],
    }
    render(<CommandPalette {...props} />)
    expect(screen.getByText('Alpha Project')).toBeInTheDocument()
  })

  it('shows a shared project in the results', () => {
    const props = {
      ...defaultProps,
      sharedProjects: [
        {
          id: 'p2', name: 'Shared Project',
          members: {}, memberIds: [],
          createdBy: 'u2', workspaceId: 'w1',
          createdAt: Date.now(),
        } as any,
      ],
    }
    render(<CommandPalette {...props} />)
    expect(screen.getByText('Shared Project')).toBeInTheDocument()
  })
})
