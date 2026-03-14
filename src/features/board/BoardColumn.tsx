import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { TaskCard } from '@/features/tasks/TaskCard'
import type { Task, ColumnId } from '@/lib/types'
import { COLUMN_LABELS } from '@/lib/types'

const COLUMN_BADGE: Record<ColumnId, string> = {
  backlog: 'bg-slate-200 text-slate-600',
  todo: 'bg-blue-100 text-blue-700',
  inprogress: 'bg-yellow-100 text-yellow-700',
  inreview: 'bg-purple-100 text-purple-700',
  done: 'bg-emerald-100 text-emerald-700',
}

interface BoardColumnProps {
  columnId: ColumnId
  tasks: Task[]
  onAddTask: (columnId: ColumnId, title: string) => void
  activeTaskId: string | null
  canEdit: boolean
}

export function BoardColumn({ columnId, tasks, onAddTask, activeTaskId, canEdit }: BoardColumnProps) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  function submitNewTask() {
    if (newTitle.trim()) {
      onAddTask(columnId, newTitle.trim())
    }
    setNewTitle('')
    setAdding(false)
  }

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLUMN_BADGE[columnId]}`}>
          {COLUMN_LABELS[columnId]}
        </span>
        <span className="text-xs text-slate-400">{tasks.length}</span>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-xl p-2 min-h-20 transition-colors ${
          isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-slate-100/70'
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} isDragging={activeTaskId === task.id} canEdit={canEdit} />
          ))}
        </SortableContext>

        {/* Inline add — hidden for readers */}
        {canEdit && adding ? (
          <div className="rounded-xl border border-indigo-300 bg-white p-2.5 shadow-sm">
            <textarea
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNewTask() }
                if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
              }}
              placeholder="Task title…"
              rows={2}
              className="w-full resize-none rounded-lg bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={submitNewTask}
                disabled={!newTitle.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setNewTitle('') }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : canEdit ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all"
          >
            <Plus size={13} />
            Add task
          </button>
        ) : null}
      </div>
    </div>
  )
}
