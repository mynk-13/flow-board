import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Plus } from 'lucide-react'
import { TaskCard } from '@/features/tasks/TaskCard'
import type { Task, ColumnId } from '@/lib/types'
import { COLUMN_LABELS } from '@/lib/types'

// Virtual scrolling activates when a column has more than this many tasks.
// Below the threshold, standard rendering is used to preserve dnd-kit drag-and-drop.
const VIRTUAL_THRESHOLD = 15

const COLUMN_BADGE: Record<ColumnId, string> = {
  backlog:    'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  todo:       'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  inprogress: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  inreview:   'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  done:       'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
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
  const scrollRef = useRef<HTMLDivElement>(null)

  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  // Virtual scrolling for large lists. Disabled during drag so dnd-kit can
  // measure all items and calculate drop positions correctly.
  const isDragging = activeTaskId !== null
  const useVirtual = tasks.length > VIRTUAL_THRESHOLD && !isDragging

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 96,
    overscan: 4,
  })

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  function submitNewTask() {
    if (newTitle.trim()) onAddTask(columnId, newTitle.trim())
    setNewTitle('')
    setAdding(false)
  }

  const dropZoneCls = isOver
    ? 'bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-200 dark:ring-indigo-800'
    : 'bg-slate-100/70 dark:bg-slate-800/40'

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLUMN_BADGE[columnId]}`}>
          {COLUMN_LABELS[columnId]}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{tasks.length}</span>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col rounded-xl transition-colors ${dropZoneCls}`}
      >
        {/* Scrollable area with virtual support */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {useVirtual ? (
              // Virtual rendering: only visible items are in the DOM
              <div
                style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
              >
                {virtualizer.getVirtualItems().map((vItem) => {
                  const task = tasks[vItem.index]
                  return (
                    <div
                      key={task.id}
                      data-index={vItem.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${vItem.start}px)`,
                        paddingBottom: 8,
                      }}
                    >
                      <TaskCard
                        task={task}
                        isDragging={activeTaskId === task.id}
                        canEdit={false}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              // Standard rendering (< VIRTUAL_THRESHOLD tasks) — full dnd-kit support
              <div className="flex flex-col gap-2 min-h-20">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={activeTaskId === task.id}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </div>

        {/* Inline add — hidden for readers */}
        {canEdit && (
          <div className="p-2 pt-0">
            {adding ? (
              <div className="rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 p-2.5 shadow-sm">
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
                  className="w-full resize-none rounded-lg bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
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
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800/80 hover:text-slate-600 dark:hover:text-slate-300 hover:shadow-sm transition-all"
              >
                <Plus size={13} />
                Add task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
