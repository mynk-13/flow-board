import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ArrowLeft, Search, Flag, Tag, Wifi, WifiOff, Share2, Check } from 'lucide-react'
import { FilterDropdown } from '@/shared/FilterDropdown'
import type { DropdownOption } from '@/shared/FilterDropdown'
import { getLabelDef } from '@/lib/labels'
import { BoardColumn } from '@/features/board/BoardColumn'
import { PresenceBar } from '@/features/board/PresenceBar'
import { CursorOverlay } from '@/features/board/CursorOverlay'
import { ShareModal } from '@/features/board/ShareModal'
import { TaskCard } from '@/features/tasks/TaskCard'
import { TaskDetailModal } from '@/features/tasks/TaskDetailModal'
import {
  getTasks, createTask, moveTask, getColumnTasks, getNextPosition, getProject,
} from '@/lib/firestore'
import { useUIStore } from '@/lib/store'
import { COLUMN_IDS } from '@/lib/types'
import type { ColumnId, Priority, Task, ProjectRole, OutletCtx, Project } from '@/lib/types'
import { useOutletContext } from 'react-router-dom'
import { getSocket, connectSocket } from '@/lib/socket'
import type { PresenceUser, CursorData, TaskMovedPayload, TaskCreatedPayload, TaskUpdatedPayload, TaskDeletedPayload } from '@/lib/socket'
import { useAuth } from '@/features/auth'

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: 'urgent', label: 'Urgent',      dotColor: '#ef4444' },
  { value: 'high',   label: 'High',        dotColor: '#f97316' },
  { value: 'medium', label: 'Medium',      dotColor: '#eab308' },
  { value: 'low',    label: 'Low',         dotColor: '#3b82f6' },
  { value: 'none',   label: 'No priority', dotColor: '#cbd5e1' },
]

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { workspace, ownedProjects, sharedProjects, setOwnedProjects, setSharedProjects } = useOutletContext<OutletCtx>()
  const { user } = useAuth()

  // Find project from either owned or shared list
  const allProjects = [...ownedProjects, ...sharedProjects]
  const [project, setProject] = useState<Project | null>(
    allProjects.find((p) => p.id === projectId) ?? null
  )

  // Determine role
  const myRole: ProjectRole =
    project?.workspaceId === user?.uid
      ? 'admin'
      : (project?.members?.[user?.uid ?? '']?.role ?? 'reader')

  const canEdit = myRole === 'admin' || myRole === 'writer'
  const isAdmin = myRole === 'admin'

  const {
    tasks, setTasks, upsertTask, removeTask, taskDetailId,
    filterSearch, setFilterSearch,
    filterPriority, setFilterPriority,
    filterLabel, setFilterLabel,
    setPresence, setCursors, applyRemoteMove, applyRemotePatch,
  } = useUIStore()

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  const lastCursorEmit = useRef(0)

  // Derive unique labels from all tasks in this board for the label filter
  const labelOptions: DropdownOption[] = useMemo(() => {
    const set = new Set<string>()
    tasks.filter((t) => t.projectId === projectId).forEach((t) => t.labels.forEach((l) => set.add(l)))
    return [...set].sort().map((l) => {
      const def = getLabelDef(l)
      return { value: l, label: def.label, dotColor: def.dot }
    })
  }, [tasks, projectId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ─── Load tasks + project fallback ──────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    getTasks(projectId).then((fetched) => {
      setTasks(fetched)
      setLoading(false)
    })
    // If project not in sidebar lists (deep-link), fetch from Firestore
    if (!allProjects.find((p) => p.id === projectId)) {
      getProject(projectId).then((p) => { if (p) setProject(p) })
    } else {
      setProject(allProjects.find((p) => p.id === projectId) ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, setTasks])

  // Keep local project in sync when sidebar lists change
  useEffect(() => {
    const found = allProjects.find((p) => p.id === projectId)
    if (found) setProject(found)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedProjects, sharedProjects, projectId])

  // ─── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId || !user) return
    const socket = getSocket()
    connectSocket()

    function onConnect() {
      setSocketConnected(true)
      socket.emit('board:join', {
        boardId: projectId,
        userId: user!.uid,
        email: user!.email ?? 'Anonymous',
      })
    }
    function onDisconnect() { setSocketConnected(false) }
    function onPresenceUpdated({ users }: { users: PresenceUser[] }) { setPresence(users) }
    function onCursorsUpdated({ cursors }: { cursors: CursorData[] }) { setCursors(cursors) }
    function onCursorsSnapshot({ cursors }: { cursors: CursorData[] }) { setCursors(cursors) }
    function onTaskMoved({ taskId, columnId, position }: TaskMovedPayload) {
      applyRemoteMove(taskId, columnId as ColumnId, position)
    }
    function onTaskCreated({ task }: TaskCreatedPayload) { upsertTask(task as Task) }
    function onTaskUpdated({ taskId, diff }: TaskUpdatedPayload) {
      applyRemotePatch(taskId, diff as Partial<Task>)
    }
    function onTaskDeleted({ taskId }: TaskDeletedPayload) { removeTask(taskId) }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('presence:updated', onPresenceUpdated)
    socket.on('cursors:updated', onCursorsUpdated)
    socket.on('cursors:snapshot', onCursorsSnapshot)
    socket.on('task:moved', onTaskMoved)
    socket.on('task:created', onTaskCreated)
    socket.on('task:updated', onTaskUpdated)
    socket.on('task:deleted', onTaskDeleted)
    if (socket.connected) onConnect()

    return () => {
      socket.emit('board:leave', { boardId: projectId, userId: user!.uid })
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('presence:updated', onPresenceUpdated)
      socket.off('cursors:updated', onCursorsUpdated)
      socket.off('cursors:snapshot', onCursorsSnapshot)
      socket.off('task:moved', onTaskMoved)
      socket.off('task:created', onTaskCreated)
      socket.off('task:updated', onTaskUpdated)
      socket.off('task:deleted', onTaskDeleted)
      setPresence([])
      setCursors([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user])

  // ─── Cursor tracking — only admin/writer participate ────────────────────────
  useEffect(() => {
    if (!projectId || !user || !canEdit) return
    const socket = getSocket()
    const myColor =
      useUIStore.getState().presence.find((u) => u.userId === user.uid)?.color ?? '#6366f1'

    function onMouseMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastCursorEmit.current < 40) return
      lastCursorEmit.current = now
      if (!socket.connected) return
      socket.emit('cursor:move', {
        boardId: projectId,
        userId: user!.uid,
        email: user!.email ?? 'Anonymous',
        color: myColor,
        x: e.clientX,
        y: e.clientY,
        lastSeen: now,
      })
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [projectId, user, canEdit])

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (t.projectId !== projectId) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterLabel && !t.labels.includes(filterLabel)) return false
    if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase())) return false
    return true
  })

  // ─── Task creation (admin + writer only) ─────────────────────────────────────
  const handleAddTask = useCallback(
    async (columnId: ColumnId, title: string) => {
      if (!projectId || !workspace || !user || !canEdit) return
      const position = getNextPosition(tasks, columnId)
      const newTask = await createTask(projectId, workspace.id, columnId, title, position)
      upsertTask(newTask)
      const socket = getSocket()
      if (socket.connected) {
        socket.emit('task:create', { boardId: projectId, task: newTask, createdBy: user.uid })
      }
    },
    [projectId, workspace, user, canEdit, tasks, upsertTask]
  )

  // ─── Drag and Drop (admin + writer only) ────────────────────────────────────
  function onDragStart({ active }: DragStartEvent) {
    if (!canEdit) return
    setActiveTaskId(active.id as string)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!canEdit || !over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return
    const overIsColumn = COLUMN_IDS.includes(overId as ColumnId)
    const overTask = tasks.find((t) => t.id === overId)
    const targetColumnId = overIsColumn ? (overId as ColumnId) : overTask?.columnId
    if (!targetColumnId || activeTask.columnId === targetColumnId) return
    setTasks(tasks.map((t) => t.id === activeId ? { ...t, columnId: targetColumnId } : t))
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTaskId(null)
    if (!canEdit || !over) return
    const activeId = active.id as string
    const overId = over.id as string
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return
    const overIsColumn = COLUMN_IDS.includes(overId as ColumnId)
    const targetColumnId = overIsColumn
      ? (overId as ColumnId)
      : tasks.find((t) => t.id === overId)?.columnId ?? activeTask.columnId
    const colTasks = getColumnTasks(tasks, targetColumnId)
    let newPosition = activeTask.position
    if (!overIsColumn) {
      const oldIndex = colTasks.findIndex((t) => t.id === activeId)
      const newIndex = colTasks.findIndex((t) => t.id === overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(colTasks, oldIndex, newIndex)
        reordered.forEach((t, i) => { if (t.id === activeId) newPosition = (i + 1) * 1000 })
        setTasks([
          ...tasks.filter((t) => t.columnId !== targetColumnId),
          ...reordered.map((t, i) => ({ ...t, position: (i + 1) * 1000 })),
        ])
      }
    } else {
      newPosition = getNextPosition(tasks.filter((t) => t.id !== activeId), targetColumnId)
      setTasks(tasks.map((t) => t.id === activeId ? { ...t, columnId: targetColumnId, position: newPosition } : t))
    }
    await moveTask(activeId, targetColumnId, newPosition)
    const socket = getSocket()
    if (socket.connected && user) {
      socket.emit('task:move', {
        boardId: projectId,
        taskId: activeId,
        columnId: targetColumnId,
        position: newPosition,
        movedBy: user.uid,
      })
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleProjectUpdated(updated: Project) {
    setProject(updated)
    // Sync back to AppLayout state
    if (updated.workspaceId === user?.uid) {
      setOwnedProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    } else {
      setSharedProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    }
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 text-sm">
        Loading board…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <Link to="/" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-sm font-semibold text-slate-800">
          {project?.name ?? 'Board'}
        </h1>

        {/* Role badge — shown for all roles */}
        {project && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isAdmin
              ? 'bg-purple-100 text-purple-700'
              : myRole === 'writer'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {myRole}
          </span>
        )}

        {/* Real-time indicators */}
        <div className="flex items-center gap-2 ml-1">
          {socketConnected ? (
            <span title="Real-time connected" className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
              <Wifi size={12} /> Live
            </span>
          ) : (
            <span title="Reconnecting…" className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <WifiOff size={12} /> Offline
            </span>
          )}
          {user && <PresenceBar myUserId={user.uid} />}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Share / copy link */}
          {isAdmin && project ? (
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              <Share2 size={12} /> Share
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Share2 size={12} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search tasks…"
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-3 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          {/* Priority filter */}
          <FilterDropdown
            value={filterPriority}
            onChange={setFilterPriority}
            options={PRIORITY_OPTIONS}
            placeholder="Priority"
            icon={<Flag size={12} />}
          />

          {/* Label / tag filter — only shown when tasks have labels */}
          {labelOptions.length > 0 && (
            <FilterDropdown
              value={filterLabel}
              onChange={setFilterLabel}
              options={labelOptions}
              placeholder="Label"
              icon={<Tag size={12} />}
              activeDotColor={filterLabel ? getLabelDef(filterLabel).dot : '#6366f1'}
            />
          )}
        </div>
      </div>

      {/* Reader notice */}
      {myRole === 'reader' && (
        <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2 text-xs text-amber-700">
          <Eye size={12} />
          You have read-only access to this board. Contact the admin to request edit permissions.
        </div>
      )}

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-4 px-5 py-5 w-max">
            {COLUMN_IDS.map((colId) => (
              <BoardColumn
                key={colId}
                columnId={colId}
                tasks={getColumnTasks(filteredTasks, colId)}
                onAddTask={handleAddTask}
                activeTaskId={activeTaskId}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging canEdit={canEdit} />}
        </DragOverlay>
      </DndContext>

      {/* Task detail modal */}
      {taskDetailId && (
        <TaskDetailModal
          tasks={tasks}
          projectId={projectId ?? ''}
          myRole={myRole}
        />
      )}

      {/* Share modal */}
      {showShare && project && user && (
        <ShareModal
          project={project}
          ownerUid={user.uid}
          ownerEmail={user.email ?? ''}
          onClose={() => setShowShare(false)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}

      {/* Live cursors — only visible to admin and writers */}
      {user && canEdit && <CursorOverlay myUserId={user.uid} myRole={myRole} />}
    </div>
  )
}
