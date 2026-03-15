import { useState, useEffect, useCallback } from 'react'
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
import { ThemeToggle } from '@/shared/ThemeToggle'
import { CommandPalette } from '@/shared/CommandPalette'
import type { Workspace, Project, OutletCtx } from '@/lib/types'

export function AppLayout() {
  const { user } = useAuth()
  const { setActiveProject, tasks, openCmdPalette } = useUIStore()
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
      Promise.all([
        getOwnedProjects(user.uid),
        getSharedProjects(user.uid),
      ]).then(([owned, shared]) => {
        setOwnedProjects(owned)
        setSharedProjects(shared)
      })
    })
  }, [user])

  // Global Cmd+K / Ctrl+K listener
  const handleGlobalKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openCmdPalette()
      }
    },
    [openCmdPalette]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [handleGlobalKey])

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
    tasks,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        myUserId={user?.uid ?? ''}
        onCreateProject={() => setShowCreate(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 px-5">
          {workspace ? (
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {workspace.name}
            </span>
          ) : (
            <div className="animate-pulse h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          )}
          <div className="flex items-center gap-2">
            {/* Cmd+K hint */}
            <button
              type="button"
              onClick={openCmdPalette}
              aria-label="Open command palette"
              className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span>Search…</span>
              <kbd className="rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            {user?.email ? (
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase"
                title={user.email}
              >
                {user.email[0]}
              </span>
            ) : (
              <div className="animate-pulse h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700" />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={outletCtx} />
        </main>
      </div>

      {/* Command Palette — portal renders to document.body */}
      <CommandPalette
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={() => setShowCreate(true)}
      />

      {/* Create Project Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">
              New Project
            </h2>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              placeholder="Project name"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
