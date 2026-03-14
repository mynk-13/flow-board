import { useEffect, useState, useRef } from 'react'
import { X, Trash2, Flag, Tag, Calendar, AlignLeft } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { updateTask, deleteTask } from '@/lib/firestore'
import type { Task, Priority, ColumnId } from '@/lib/types'
import { COLUMN_LABELS, COLUMN_IDS } from '@/lib/types'
import { getSocket } from '@/lib/socket'
import { useAuth } from '@/features/auth'
import { SelectDropdown } from '@/shared/SelectDropdown'
import type { SelectOption } from '@/shared/SelectDropdown'
import { LabelPicker } from '@/shared/LabelPicker'

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'urgent', label: 'Urgent',      dotColor: '#ef4444' },
  { value: 'high',   label: 'High',        dotColor: '#f97316' },
  { value: 'medium', label: 'Medium',      dotColor: '#eab308' },
  { value: 'low',    label: 'Low',         dotColor: '#3b82f6' },
  { value: 'none',   label: 'No priority', dotColor: '#94a3b8' },
]

const STATUS_OPTIONS: SelectOption[] = COLUMN_IDS.map((id) => ({
  value: id,
  label: COLUMN_LABELS[id],
}))

const STATUS_DOT: Record<ColumnId, string> = {
  backlog:    '#94a3b8',
  todo:       '#3b82f6',
  inprogress: '#f59e0b',
  inreview:   '#a855f7',
  done:       '#10b981',
}

// Inject dot colors into status options
const STATUS_OPTIONS_WITH_DOTS: SelectOption[] = STATUS_OPTIONS.map((o) => ({
  ...o,
  dotColor: STATUS_DOT[o.value as ColumnId],
}))

interface TaskDetailModalProps {
  tasks: Task[]
  projectId: string
  myRole: import('@/lib/types').ProjectRole
}

export function TaskDetailModal({ tasks, projectId, myRole }: TaskDetailModalProps) {
  const { taskDetailId, closeTaskDetail, upsertTask, removeTask } = useUIStore()
  const { user } = useAuth()
  const canEdit = myRole === 'admin' || myRole === 'writer'
  const canDelete = myRole === 'admin' || myRole === 'writer'
  const task = tasks.find((t) => t.id === taskDetailId) ?? null

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('none')
  const [columnId, setColumnId] = useState<ColumnId>('todo')
  const [dueDate, setDueDate] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setColumnId(task.columnId)
      setDueDate(task.dueDate ?? '')
      setLabels(task.labels ?? [])
    }
  }, [task])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeTaskDetail()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeTaskDetail])

  if (!task) return null

  async function handleSave() {
    if (!task) return
    setSaving(true)
    const patch = {
      title: title.trim() || task.title,
      description,
      priority,
      columnId,
      dueDate: dueDate || null,
      labels,
    }
    await updateTask(task.id, patch)
    upsertTask({ ...task, ...patch })

    const socket = getSocket()
    if (socket.connected && user) {
      socket.emit('task:update', {
        boardId: projectId,
        taskId: task.id,
        diff: patch,
        updatedBy: user.uid,
      })
    }

    setSaving(false)
    closeTaskDetail()
  }

  async function handleDelete() {
    if (!task) return
    await deleteTask(task.id)
    removeTask(task.id)

    const socket = getSocket()
    if (socket.connected && user) {
      socket.emit('task:delete', {
        boardId: projectId,
        taskId: task.id,
        deletedBy: user.uid,
      })
    }

    closeTaskDetail()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-[2px]"
      onClick={closeTaskDetail}
    >
      <div
        className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl overflow-y-auto animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task detail</span>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={closeTaskDetail}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => canEdit && setTitle(e.target.value)}
            readOnly={!canEdit}
            className={`w-full border-0 text-xl font-semibold text-slate-800 focus:outline-none focus:ring-0 bg-transparent leading-snug
              ${!canEdit ? 'cursor-default select-text' : ''}`}
            placeholder="Task title"
          />

          {/* Meta row — Status, Priority, Due date */}
          <div className="flex flex-wrap gap-4">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Status
              </span>
              <SelectDropdown
                value={columnId}
                onChange={(v) => setColumnId(v as ColumnId)}
                options={STATUS_OPTIONS_WITH_DOTS}
                disabled={!canEdit}
              />
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Flag size={10} /> Priority
              </span>
              <SelectDropdown
                value={priority}
                onChange={(v) => setPriority(v as Priority)}
                options={PRIORITY_OPTIONS}
                disabled={!canEdit}
              />
            </div>

            {/* Due date */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Calendar size={10} /> Due date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => canEdit && setDueDate(e.target.value)}
                readOnly={!canEdit}
                className={`rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700
                  focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300
                  ${!canEdit ? 'opacity-60 cursor-default' : 'hover:border-indigo-300'}`}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Tag size={10} /> Labels
            </span>
            <LabelPicker
              selected={labels}
              onChange={setLabels}
              disabled={!canEdit}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <AlignLeft size={10} /> Description
            </span>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => canEdit && setDescription(e.target.value)}
              readOnly={!canEdit}
              placeholder={canEdit ? 'Add a description…' : 'No description'}
              className={`w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700
                placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20
                ${!canEdit ? 'opacity-60 cursor-default' : ''}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeTaskDetail}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {canEdit ? 'Discard' : 'Close'}
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
