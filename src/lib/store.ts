import { create } from 'zustand'
import type { Task, ColumnId } from './types'
import type { PresenceUser, CursorData } from './socket'

// ─── Dark mode helpers ────────────────────────────────────────────────────────
function detectInitialDark(): boolean {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('theme')
  if (saved) return saved === 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', dark)
}

const initialDark = detectInitialDark()
applyTheme(initialDark)

// ─── Store interface ──────────────────────────────────────────────────────────
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

  applyRemoteMove: (taskId: string, columnId: ColumnId, position: number) => void
  applyRemotePatch: (taskId: string, diff: Partial<Task>) => void

  presence: PresenceUser[]
  setPresence: (users: PresenceUser[]) => void

  cursors: CursorData[]
  setCursors: (cursors: CursorData[]) => void

  /** Dark mode — persisted to localStorage, respects system preference on first load */
  isDark: boolean
  toggleDark: () => void

  /** Command palette visibility */
  cmdPaletteOpen: boolean
  openCmdPalette: () => void
  closeCmdPalette: () => void
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

  isDark: initialDark,
  toggleDark: () =>
    set((s) => {
      const newDark = !s.isDark
      applyTheme(newDark)
      localStorage.setItem('theme', newDark ? 'dark' : 'light')
      return { isDark: newDark }
    }),

  cmdPaletteOpen: false,
  openCmdPalette: () => set({ cmdPaletteOpen: true }),
  closeCmdPalette: () => set({ cmdPaletteOpen: false }),
}))
