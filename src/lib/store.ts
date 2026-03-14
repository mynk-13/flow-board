import { create } from 'zustand'
import type { Task, ColumnId } from './types'
import type { PresenceUser, CursorData } from './socket'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  activeProjectId: string | null
  setActiveProject: (id: string | null) => void

  taskDetailId: string | null
  openTaskDetail: (id: string) => void
  closeTaskDetail: () => void

  filterPriority: string | null
  setFilterPriority: (p: string | null) => void

  filterLabel: string | null
  setFilterLabel: (l: string | null) => void

  filterSearch: string
  setFilterSearch: (s: string) => void

  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  upsertTask: (task: Task) => void
  removeTask: (id: string) => void

  /**
   * Safe remote-move: always reads current state from the store,
   * never from a stale closure. Use this in socket event handlers.
   */
  applyRemoteMove: (taskId: string, columnId: ColumnId, position: number) => void

  /**
   * Safe remote-patch: same stale-closure protection as applyRemoteMove.
   */
  applyRemotePatch: (taskId: string, diff: Partial<Task>) => void

  /** Real-time: who is currently viewing the same board */
  presence: PresenceUser[]
  setPresence: (users: PresenceUser[]) => void

  /** Real-time: remote cursor positions */
  cursors: CursorData[]
  setCursors: (cursors: CursorData[]) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),

  taskDetailId: null,
  openTaskDetail: (id) => set({ taskDetailId: id }),
  closeTaskDetail: () => set({ taskDetailId: null }),

  filterPriority: null,
  setFilterPriority: (p) => set({ filterPriority: p }),

  filterLabel: null,
  setFilterLabel: (l) => set({ filterLabel: l }),

  filterSearch: '',
  setFilterSearch: (s) => set({ filterSearch: s }),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  upsertTask: (task) =>
    set((s) => ({
      tasks: s.tasks.some((t) => t.id === task.id)
        ? s.tasks.map((t) => (t.id === task.id ? task : t))
        : [...s.tasks, task],
    })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  // Uses Zustand's functional `set` so it always reads the live tasks array,
  // never a closure-captured stale copy.
  applyRemoteMove: (taskId, columnId, position) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, columnId, position } : t
      ),
    })),

  applyRemotePatch: (taskId, diff) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...diff } : t)),
    })),

  presence: [],
  setPresence: (users) => set({ presence: users }),

  cursors: [],
  setCursors: (cursors) => set({ cursors }),
}))
