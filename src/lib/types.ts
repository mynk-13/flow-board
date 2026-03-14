export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type ProjectRole = 'admin' | 'writer' | 'reader'

export const COLUMN_IDS = ['backlog', 'todo', 'inprogress', 'inreview', 'done'] as const
export type ColumnId = (typeof COLUMN_IDS)[number]

export const COLUMN_LABELS: Record<ColumnId, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  inprogress: 'In Progress',
  inreview: 'In Review',
  done: 'Done',
}

export interface Workspace {
  id: string
  name: string
  ownerId: string
  createdAt: number
}

export interface ProjectMemberInfo {
  email: string
  role: ProjectRole
}

export interface Project {
  id: string
  name: string
  /** uid of the owner — also used for owned-project query */
  workspaceId: string
  createdAt: number
  /** uid → { email, role } for every member including the owner */
  members: Record<string, ProjectMemberInfo>
  /** uid list of non-owner members — used for 'shared with me' query */
  memberIds: string[]
}

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

/** Shared context passed via React Router Outlet */
export interface OutletCtx {
  workspace: Workspace | null
  ownedProjects: Project[]
  sharedProjects: Project[]
  setOwnedProjects: React.Dispatch<React.SetStateAction<Project[]>>
  setSharedProjects: React.Dispatch<React.SetStateAction<Project[]>>
}
