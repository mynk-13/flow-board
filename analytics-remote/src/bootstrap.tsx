/**
 * Standalone dev shell — renders AnalyticsDashboard with mock data
 * so you can develop the remote without the host app running.
 */
import { createRoot } from 'react-dom/client'
import AnalyticsDashboard from './AnalyticsDashboard'
import type { Task, Project } from './types'

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'FlowBoard MVP',
    workspaceId: 'ws-1',
    createdAt: Date.now() - 30 * 86400000,
    members: {
      'user-1': { email: 'alice@example.com', role: 'admin' },
      'user-2': { email: 'bob@example.com',   role: 'writer' },
    },
    memberIds: ['user-2'],
  },
]

const now = Date.now()
const day = 86400000

const MOCK_TASKS: Task[] = [
  { id: 't1',  title: 'Setup Firebase',       columnId: 'done',       priority: 'high',   projectId: 'proj-1', workspaceId: 'ws-1', position: 0, labels: ['infra'],          dueDate: null,                  assigneeId: 'user-1', createdAt: now - 20*day, updatedAt: now - 15*day, description: '' },
  { id: 't2',  title: 'Auth flow',             columnId: 'done',       priority: 'urgent', projectId: 'proj-1', workspaceId: 'ws-1', position: 1, labels: ['feature'],        dueDate: null,                  assigneeId: 'user-1', createdAt: now - 18*day, updatedAt: now - 12*day, description: '' },
  { id: 't3',  title: 'Kanban board UI',       columnId: 'done',       priority: 'high',   projectId: 'proj-1', workspaceId: 'ws-1', position: 2, labels: ['feature', 'ui'],  dueDate: null,                  assigneeId: 'user-2', createdAt: now - 16*day, updatedAt: now - 8*day,  description: '' },
  { id: 't4',  title: 'Socket.io integration', columnId: 'inprogress', priority: 'high',   projectId: 'proj-1', workspaceId: 'ws-1', position: 3, labels: ['infra'],          dueDate: null,                  assigneeId: 'user-1', createdAt: now - 10*day, updatedAt: now - 2*day,  description: '' },
  { id: 't5',  title: 'Analytics MFE',         columnId: 'inprogress', priority: 'medium', projectId: 'proj-1', workspaceId: 'ws-1', position: 4, labels: ['feature'],        dueDate: null,                  assigneeId: 'user-2', createdAt: now - 5*day,  updatedAt: now - 1*day,  description: '' },
  { id: 't6',  title: 'Write unit tests',      columnId: 'todo',       priority: 'medium', projectId: 'proj-1', workspaceId: 'ws-1', position: 5, labels: ['testing'],        dueDate: new Date(now + 5*day).toISOString().slice(0,10), assigneeId: null, createdAt: now - 3*day, updatedAt: now - 3*day, description: '' },
  { id: 't7',  title: 'CI/CD pipeline',        columnId: 'todo',       priority: 'low',    projectId: 'proj-1', workspaceId: 'ws-1', position: 6, labels: ['infra'],          dueDate: null,                  assigneeId: null, createdAt: now - 2*day, updatedAt: now - 2*day, description: '' },
  { id: 't8',  title: 'Fix drag-and-drop bug', columnId: 'inreview',   priority: 'urgent', projectId: 'proj-1', workspaceId: 'ws-1', position: 7, labels: ['bug'],            dueDate: new Date(now - 1*day).toISOString().slice(0,10), assigneeId: 'user-1', createdAt: now - 4*day, updatedAt: now, description: '' },
  { id: 't9',  title: 'Dark mode support',     columnId: 'backlog',    priority: 'low',    projectId: 'proj-1', workspaceId: 'ws-1', position: 8, labels: ['feature', 'ui'],  dueDate: null,                  assigneeId: null, createdAt: now - 1*day, updatedAt: now - 1*day, description: '' },
  { id: 't10', title: 'Performance audit',     columnId: 'backlog',    priority: 'medium', projectId: 'proj-1', workspaceId: 'ws-1', position: 9, labels: ['infra'],          dueDate: null,                  assigneeId: 'user-2', createdAt: now, updatedAt: now, description: '' },
]

const root = createRoot(document.getElementById('root')!)
root.render(
  <AnalyticsDashboard
    tasks={MOCK_TASKS}
    projects={MOCK_PROJECTS}
    userId="user-1"
  />
)
