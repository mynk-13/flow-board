import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Sidebar } from './Sidebar'
import {
  getOrCreateWorkspace,
  getOwnedProjects,
  getSharedProjects,
  createProject,
} from '@/lib/firestore'
import { useUIStore } from '@/lib/store'
import type { Workspace, Project, OutletCtx } from '@/lib/types'

export function AppLayout() {
  const { user } = useAuth()
  const setActiveProject = useUIStore((s) => s.setActiveProject)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([])
  const [sharedProjects, setSharedProjects] = useState<Project[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return
    getOrCreateWorkspace(user.uid, user.email ?? 'user').then((ws) => {
      setWorkspace(ws)
      // Load both owned and shared projects in parallel
      Promise.all([
        getOwnedProjects(user.uid),
        getSharedProjects(user.uid),
      ]).then(([owned, shared]) => {
        setOwnedProjects(owned)
        setSharedProjects(shared)
      })
    })
  }, [user])

  async function handleCreateProject() {
    if (!workspace || !newName.trim() || !user) return
    setCreating(true)
    const project = await createProject(workspace.id, user.email ?? '', newName.trim())
    setOwnedProjects((prev) => [...prev, project])
    setActiveProject(project.id)
    setNewName('')
    setShowCreate(false)
    setCreating(false)
  }

  const outletCtx: OutletCtx = {
    workspace,
    ownedProjects,
    sharedProjects,
    setOwnedProjects,
    setSharedProjects,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        myUserId={user?.uid ?? ''}
        onCreateProject={() => setShowCreate(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
          <span className="text-sm font-medium text-slate-500">
            {workspace?.name ?? 'Workspace'}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 uppercase">
              {user?.email?.[0] ?? 'U'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={outletCtx} />
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-800 mb-4">New Project</h2>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              placeholder="Project name"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newName.trim() || creating}
                onClick={handleCreateProject}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
