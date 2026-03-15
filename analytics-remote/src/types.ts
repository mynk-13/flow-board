export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type ColumnId = 'backlog' | 'todo' | 'inprogress' | 'inreview' | 'done'
export type ProjectRole = 'admin' | 'writer' | 'reader'

export interface Task {
  id: string
  title: string
  description: string
  columnId: ColumnId
  priority: Priority
  projectId: string
  workspaceId: string
  position: number
  labels: string[]
  dueDate: string | null
  assigneeId: string | null
  createdAt: number
  updatedAt: number
}

export interface ProjectMemberInfo {
  email: string
  role: ProjectRole
}

export interface Project {
  id: string
  name: string
  workspaceId: string
  createdAt: number
  members: Record<string, ProjectMemberInfo>
  memberIds: string[]
}

export const COLUMN_LABELS: Record<ColumnId, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  inprogress: 'In Progress',
  inreview: 'In Review',
  done: 'Done',
}

export const COLUMN_COLORS: Record<ColumnId, string> = {
  backlog: '#94a3b8',
  todo:    '#60a5fa',
  inprogress: '#a78bfa',
  inreview:   '#fb923c',
  done:       '#34d399',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ef4444',
  high:   '#f97316',
  medium: '#eab308',
  low:    '#3b82f6',
  none:   '#cbd5e1',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high:   'High',
  medium: 'Medium',
  low:    'Low',
  none:   'None',
}
