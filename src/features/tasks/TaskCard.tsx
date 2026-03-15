import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  AlertCircle,
  ChevronUp,
  Minus,
  ChevronDown,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { getLabelDef } from '@/lib/labels'
import type { Task, Priority } from '@/lib/types'

/** Solid colour for the left priority strip */
const PRIORITY_STRIP: Record<Priority, string> = {
  urgent: '#ef4444',
  high:   '#f97316',
  medium: '#eab308',
  low:    '#3b82f6',
  none:   '#e2e8f0',
}

/** Text + badge colours for the priority pill */
const PRIORITY_BADGE: Record<Priority, string> = {
  urgent: 'bg-red-50 text-red-600 border border-red-200',
  high:   'bg-orange-50 text-orange-600 border border-orange-200',
  medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  low:    'bg-blue-50 text-blue-600 border border-blue-200',
  none:   '',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high:   'High',
  medium: 'Medium',
  low:    'Low',
  none:   '',
}

const PRIORITY_ICON: Record<Priority, React.ReactNode> = {
  urgent: <AlertCircle size={10} />,
  high:   <ChevronUp   size={10} />,
  medium: <Minus       size={10} />,
  low:    <ChevronDown size={10} />,
  none:   null,
}

/** Format a date string as "14 Mar 25" */
function formatDue(iso: string): string {
  const d = new Date(iso)
  const day   = d.getDate().toString().padStart(2, '0')
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year  = d.getFullYear().toString().slice(-2)
  return `${day} ${month} ${year}`
}

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  canEdit?: boolean
}

export function TaskCard({ task, isDragging, canEdit = true }: TaskCardProps) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    disabled: !canEdit,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => openTaskDetail(task.id)}
      className={`group relative flex rounded-xl border overflow-hidden cursor-pointer select-none transition-all ${
        isDragging
          ? 'shadow-xl border-indigo-300 dark:border-indigo-600 opacity-90 rotate-1 scale-105 bg-white dark:bg-slate-800'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700'
      }`}
    >
      {/* ── Priority colour strip ── */}
      <div
        className="w-[5%] min-w-1 max-w-4 shrink-0"
        style={{ backgroundColor: PRIORITY_STRIP[task.priority] }}
      />

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 px-3 py-3 pr-6">
        {/* Title row + priority badge */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 flex-1 min-w-0">
            {task.title}
          </p>

          {task.priority !== 'none' && (
            <span
              className={`shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGE[task.priority]}`}
            >
              {PRIORITY_ICON[task.priority]}
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {formatDue(task.dueDate)}
          </p>
        )}

        {/* Labels row */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {task.labels.map((label) => {
              const def = getLabelDef(label)
              return (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: def.bg, color: def.fg }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: def.dot }}
                  />
                  {def.label}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Drag handle ── */}
      {canEdit && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
          className="absolute top-2 right-1.5 rounded p-0.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={13} />
        </button>
      )}
    </div>
  )
}
