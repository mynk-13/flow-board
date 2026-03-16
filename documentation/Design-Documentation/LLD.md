# Low Level Design (LLD)
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Status:** Final  

---

## 1. Component Hierarchy

```
App.tsx
├── QueryClientProvider (TanStack Query)
├── AuthProvider (Firebase auth context)
│   └── Router (React Router v7)
│       ├── /login        → LoginPage
│       ├── /signup       → SignupPage
│       └── ProtectedRoute
│           └── AppLayout
│               ├── Sidebar
│               │   ├── FlowBoardLogo
│               │   ├── NavLink (Home)
│               │   ├── NavLink (Analytics)
│               │   ├── [ownedProjects] NavLink[]
│               │   ├── [sharedProjects] NavLink[] with role badge
│               │   └── CollapseToggle
│               ├── Header
│               │   ├── ThemeToggle
│               │   └── UserMenu
│               ├── CommandPalette (portal)
│               └── <Outlet>
│                   ├── /           → DashboardPage
│                   │   └── TiltCard[] (project cards)
│                   ├── /board/:id  → BoardPage
│                   │   ├── BoardTopBar (project name, role badge, Live indicator, ShareModal trigger)
│                   │   ├── FilterBar (FilterDropdown × 2, search input)
│                   │   ├── PresenceBar (cursor avatars)
│                   │   ├── CursorOverlay (portal)
│                   │   ├── DndContext (dnd-kit)
│                   │   │   └── SortableContext
│                   │   │       └── BoardColumn × 5
│                   │   │           └── TaskCard[]
│                   │   └── TaskDetailModal (portal, conditional)
│                   └── /analytics  → AnalyticsPage
│                       └── RemoteDashboard (Module Federation)
```

---

## 2. Zustand Store Design (`src/lib/store.ts`)

```typescript
interface UIStore {
  // ── Sidebar ──────────────────────────────────────────────────
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // ── Task Detail ───────────────────────────────────────────────
  taskDetailId: string | null
  openTaskDetail: (id: string) => void
  closeTaskDetail: () => void

  // ── Filters ───────────────────────────────────────────────────
  filterPriority: Priority | null
  filterLabel: string | null
  filterSearch: string
  setFilterPriority: (p: Priority | null) => void
  setFilterLabel: (l: string | null) => void
  setFilterSearch: (s: string) => void

  // ── Tasks (in-memory mirror of active board) ──────────────────
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  upsertTask: (task: Task) => void
  removeTask: (id: string) => void

  // ── Real-Time Safe Updaters (use functional set to avoid stale closure) ──
  applyRemoteMove: (id: string, columnId: ColumnId, position: number) => void
  applyRemotePatch: (id: string, diff: Partial<Task>) => void

  // ── Presence & Cursors ────────────────────────────────────────
  presence: PresenceUser[]
  cursors: CursorPosition[]
  setPresence: (users: PresenceUser[]) => void
  setCursors: (cursors: CursorPosition[]) => void

  // ── Dark Mode (localStorage persisted) ────────────────────────
  isDark: boolean
  toggleDark: () => void

  // ── Command Palette ────────────────────────────────────────────
  cmdPaletteOpen: boolean
  openCmdPalette: () => void
  closeCmdPalette: () => void
}
```

### 2.1 Stale Closure Prevention Pattern
```typescript
// ❌ WRONG — captures tasks at registration time, never updates
socket.on('task:moved', (payload) => {
  const updated = tasks.map(t => t.id === payload.id ? {...t, ...payload} : t)
  setTasks(updated)
})

// ✅ CORRECT — reads current state at event time
applyRemoteMove: (id, columnId, position) =>
  set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === id ? { ...t, columnId, position } : t
    )
  }))
```

---

## 3. Type Definitions (`src/lib/types.ts`)

```typescript
export type ColumnId = 'backlog' | 'todo' | 'inprogress' | 'inreview' | 'done'
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type ProjectRole = 'admin' | 'writer' | 'reader'

export interface Task {
  id: string
  title: string
  description: string
  columnId: ColumnId
  priority: Priority
  labels: string[]
  position: number       // float for LexoRank-like ordering
  projectId: string
  workspaceId: string
  dueDate: number | null // Unix timestamp ms
  assigneeId: string | null
  createdAt: number
  updatedAt: number
}

export interface ProjectMemberInfo {
  role: ProjectRole
  joinedAt: number
  email: string
}

export interface Project {
  id: string
  name: string
  workspaceId: string
  createdBy: string
  createdAt: number
  members: Record<string, ProjectMemberInfo>  // uid → info
  memberIds: string[]                          // for Firestore `array-contains` queries
}

export interface OutletCtx {
  ownedProjects: Project[]
  sharedProjects: Project[]
  tasks: Task[]
  loading: boolean
}
```

---

## 4. Firestore Helper Functions (`src/lib/firestore.ts`)

```typescript
// Users
saveUserProfile(uid, email, displayName)  → writes/merges to users/{uid}
getUserByEmail(email)                     → queries users where email == email

// Projects
getOwnedProjects(uid)   → query projects where createdBy == uid
getSharedProjects(uid)  → query projects where memberIds array-contains uid AND createdBy != uid
createProject(data)     → addDoc to projects collection; sets members[uid] = { role: 'admin' }
shareProject(projectId, targetUid, role)  → updateDoc: add to members map + memberIds array
updateMemberRole(projectId, uid, role)    → updateDoc: members[uid].role
removeMember(projectId, uid)              → updateDoc: delete members[uid]; remove from memberIds
deleteProject(projectId)                  → deleteDoc + delete all tasks

// Tasks
getTasks(projectId)  → query tasks where projectId == id, orderBy position asc
createTask(data)     → addDoc with generated id and position
updateTask(id, diff) → updateDoc with partial diff + updatedAt: Date.now()
deleteTask(id)       → deleteDoc
moveTask(id, columnId, position) → updateDoc: columnId + position + updatedAt
```

---

## 5. Socket.io Client Design (`src/lib/socket.ts`)

```typescript
// Singleton pattern — one connection per browser tab
let _socket: Socket | null = null

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return _socket
}

// Payload interfaces
interface TaskMovePayload   { id: string; columnId: ColumnId; position: number; projectId: string; userId: string }
interface TaskPatchPayload  { id: string; diff: Partial<Task>; projectId: string; userId: string }
interface TaskDeletePayload { id: string; projectId: string; userId: string }
interface CursorPayload     { userId: string; x: number; y: number; projectId: string }
interface PresencePayload   { userId: string; userName: string; role: ProjectRole; projectId: string }
```

---

## 6. BoardPage State Machine

```
Board page states:
                ┌──────────┐
                │  LOADING │ (skeleton columns shown)
                └────┬─────┘
                     │ project + tasks fetched
                     ▼
             ┌───────────────┐
             │  IDLE / LIVE  │ (board visible)
             └──────┬────────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
  [drag start]  [filter]   [cursor move]
       │            │            │
  optimistic    re-filter    emit event
   update UI    visible       (30fps)
       │        tasks
  emit task:move
       │
  Firestore update
       │
  Server broadcast
       │
  Other clients applyRemoteMove()
```

---

## 7. Task Card Component Design

```typescript
// Priority strip colors
const PRIORITY_STRIP: Record<Priority, string> = {
  urgent:  '#ef4444',  // red-500
  high:    '#f97316',  // orange-500
  medium:  '#eab308',  // yellow-500
  low:     '#22c55e',  // green-500
  none:    '#94a3b8',  // slate-400
}

// Priority icons (Lucide)
const PRIORITY_ICON: Record<Priority, LucideIcon> = {
  urgent:  ShieldAlert,
  high:    ArrowUp,
  medium:  Minus,
  low:     ArrowDown,
  none:    Circle,
}

// TaskCard rendering logic
function TaskCard({ task, canEdit }) {
  const { isDragging, listeners, attributes, setNodeRef, transform } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      {...(canEdit ? listeners : {})}    // Full card is draggable (not just grip icon)
      {...(canEdit ? attributes : {})}
      onClick={() => openTaskDetail(task.id)}
    >
      {/* Left priority strip — grip icon lives here, visible on hover */}
      <div style={{ backgroundColor: PRIORITY_STRIP[task.priority] }}>
        {canEdit && <GripVertical className="opacity-0 group-hover:opacity-50" />}
      </div>
      {/* Card content */}
      <div>
        {/* Title + Priority badge (justify-between) */}
        {/* Due date (if set) */}
        {/* Label chips (onClick stopPropagation) */}
      </div>
    </div>
  )
}
```

---

## 8. Authentication Provider Design

```typescript
// AuthProvider.tsx
const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await saveUserProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName)
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}

// AuthGate — shows LoadingScreen until Firebase resolves
export function AuthGate({ children }) {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />
  return children
}
```

---

## 9. Label System Design (`src/lib/labels.ts`)

```typescript
export interface LabelDef {
  value: string    // stored in Firestore task.labels[]
  label: string    // display name
  bg: string       // pill background (hex)
  fg: string       // pill text color (hex)
  dot: string      // filter dropdown dot color (hex)
}

export const PRESET_LABELS: LabelDef[] = [
  { value: 'bug',         label: 'Bug',         bg: '#fef2f2', fg: '#991b1b', dot: '#ef4444' },
  { value: 'feature',     label: 'Feature',     bg: '#eff6ff', fg: '#1e40af', dot: '#3b82f6' },
  { value: 'infra',       label: 'Infra',       bg: '#fff7ed', fg: '#9a3412', dot: '#f97316' },
  // ... 9 more preset labels
]

// O(1) lookup for known labels; graceful fallback for custom labels
const LABEL_MAP = new Map(PRESET_LABELS.map(l => [l.value.toLowerCase(), l]))

export function getLabelDef(value: string): LabelDef {
  return LABEL_MAP.get(value.toLowerCase()) ?? {
    value, label: value,
    bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8'  // neutral gray fallback
  }
}
```

---

## 10. Column Position Algorithm

Tasks are ordered by a `position: number` field using a midpoint-insertion algorithm:

```typescript
export function getNextPosition(tasks: Task[], targetIndex: number): number {
  const sorted = [...tasks].sort((a, b) => a.position - b.position)
  
  if (sorted.length === 0) return 1000
  
  const before = sorted[targetIndex - 1]?.position ?? 0
  const after  = sorted[targetIndex]?.position  ?? (sorted[sorted.length - 1].position + 1000)
  
  return (before + after) / 2
}
// Periodic rebalancing prevents float precision issues after many insertions
```
