import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './store'

// Reset Zustand store state between tests
beforeEach(() => {
  useUIStore.setState({
    tasks: [],
    filterPriority: null,
    filterLabel: null,
    filterSearch: '',
    sidebarOpen: true,
    taskDetailId: null,
    cmdPaletteOpen: false,
  })
  localStorage.clear()
})

describe('UIStore — sidebar', () => {
  it('toggles sidebarOpen', () => {
    const { toggleSidebar } = useUIStore.getState()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('sets sidebarOpen directly', () => {
    useUIStore.getState().setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })
})

describe('UIStore — task detail', () => {
  it('opens and closes task detail', () => {
    expect(useUIStore.getState().taskDetailId).toBeNull()
    useUIStore.getState().openTaskDetail('abc-123')
    expect(useUIStore.getState().taskDetailId).toBe('abc-123')
    useUIStore.getState().closeTaskDetail()
    expect(useUIStore.getState().taskDetailId).toBeNull()
  })
})

describe('UIStore — filters', () => {
  it('sets and clears filterPriority', () => {
    useUIStore.getState().setFilterPriority('high')
    expect(useUIStore.getState().filterPriority).toBe('high')
    useUIStore.getState().setFilterPriority(null)
    expect(useUIStore.getState().filterPriority).toBeNull()
  })

  it('sets and clears filterLabel', () => {
    useUIStore.getState().setFilterLabel('bug')
    expect(useUIStore.getState().filterLabel).toBe('bug')
    useUIStore.getState().setFilterLabel(null)
    expect(useUIStore.getState().filterLabel).toBeNull()
  })

  it('sets filterSearch', () => {
    useUIStore.getState().setFilterSearch('login fix')
    expect(useUIStore.getState().filterSearch).toBe('login fix')
  })
})

describe('UIStore — tasks', () => {
  const sampleTask = {
    id: 't1',
    title: 'Fix bug',
    description: '',
    columnId: 'todo' as const,
    priority: 'high' as const,
    labels: [],
    position: 0,
    projectId: 'p1',
    workspaceId: 'w1',
    createdAt: new Date().toISOString(),
  }

  it('setTasks replaces the whole array', () => {
    useUIStore.getState().setTasks([sampleTask])
    expect(useUIStore.getState().tasks).toHaveLength(1)
    expect(useUIStore.getState().tasks[0].id).toBe('t1')
  })

  it('upsertTask adds a new task', () => {
    useUIStore.getState().upsertTask(sampleTask)
    expect(useUIStore.getState().tasks).toHaveLength(1)
  })

  it('upsertTask updates an existing task', () => {
    useUIStore.getState().setTasks([sampleTask])
    useUIStore.getState().upsertTask({ ...sampleTask, title: 'Updated title' })
    expect(useUIStore.getState().tasks).toHaveLength(1)
    expect(useUIStore.getState().tasks[0].title).toBe('Updated title')
  })

  it('removeTask deletes by id', () => {
    useUIStore.getState().setTasks([sampleTask])
    useUIStore.getState().removeTask('t1')
    expect(useUIStore.getState().tasks).toHaveLength(0)
  })

  it('removeTask is a no-op for unknown id', () => {
    useUIStore.getState().setTasks([sampleTask])
    useUIStore.getState().removeTask('does-not-exist')
    expect(useUIStore.getState().tasks).toHaveLength(1)
  })
})

describe('UIStore — real-time safe updaters', () => {
  const task = {
    id: 'rt1',
    title: 'Real-time task',
    description: '',
    columnId: 'todo' as const,
    priority: 'medium' as const,
    labels: [],
    position: 1,
    projectId: 'p1',
    workspaceId: 'w1',
    createdAt: new Date().toISOString(),
  }

  it('applyRemoteMove updates columnId and position', () => {
    useUIStore.getState().setTasks([task])
    useUIStore.getState().applyRemoteMove('rt1', 'done', 5)
    const updated = useUIStore.getState().tasks[0]
    expect(updated.columnId).toBe('done')
    expect(updated.position).toBe(5)
  })

  it('applyRemotePatch merges partial diff', () => {
    useUIStore.getState().setTasks([task])
    useUIStore.getState().applyRemotePatch('rt1', { title: 'New title', priority: 'urgent' })
    const updated = useUIStore.getState().tasks[0]
    expect(updated.title).toBe('New title')
    expect(updated.priority).toBe('urgent')
    expect(updated.columnId).toBe('todo')
  })

  it('applyRemoteMove is a no-op for unknown id', () => {
    useUIStore.getState().setTasks([task])
    useUIStore.getState().applyRemoteMove('unknown', 'done', 0)
    expect(useUIStore.getState().tasks[0].columnId).toBe('todo')
  })
})

describe('UIStore — dark mode', () => {
  it('toggleDark flips isDark and persists to localStorage', () => {
    const initial = useUIStore.getState().isDark
    useUIStore.getState().toggleDark()
    expect(useUIStore.getState().isDark).toBe(!initial)
    expect(localStorage.getItem('theme')).toBe(!initial ? 'dark' : 'light')
  })
})

describe('UIStore — command palette', () => {
  it('opens and closes', () => {
    expect(useUIStore.getState().cmdPaletteOpen).toBe(false)
    useUIStore.getState().openCmdPalette()
    expect(useUIStore.getState().cmdPaletteOpen).toBe(true)
    useUIStore.getState().closeCmdPalette()
    expect(useUIStore.getState().cmdPaletteOpen).toBe(false)
  })
})
