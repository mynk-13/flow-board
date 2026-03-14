import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Plus,
  LogOut,
  Share2,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/lib/store'
import type { Project, ProjectRole } from '@/lib/types'

const ROLE_BADGE: Record<ProjectRole, { label: string; class: string }> = {
  admin: { label: 'admin', class: 'bg-purple-100 text-purple-600' },
  writer: { label: 'writer', class: 'bg-blue-100 text-blue-600' },
  reader: { label: 'reader', class: 'bg-slate-100 text-slate-500' },
}

interface SidebarProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
  myUserId: string
  onCreateProject: () => void
}

export function Sidebar({ ownedProjects, sharedProjects, myUserId, onCreateProject }: SidebarProps) {
  const { signOut } = useAuth()
  const { user } = useAuth()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const { projectId } = useParams()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const isActive = (id: string) => projectId === id

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        sidebarOpen ? 'w-60' : 'w-16'
      } shrink-0`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate-100 px-4">
        {sidebarOpen ? (
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-800 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">F</span>
            FlowBoard
          </Link>
        ) : (
          <Link to="/" className="flex w-full items-center justify-center">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">F</span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LayoutDashboard size={16} className="shrink-0" />
          {sidebarOpen && <span>Home</span>}
        </Link>

        {/* ── CREATED BY ME ─────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="pt-4 pb-1 px-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Created by me
              </span>
              <button
                type="button"
                onClick={onCreateProject}
                className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                title="New project"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        )}

        {ownedProjects.length === 0 && sidebarOpen && (
          <button
            type="button"
            onClick={onCreateProject}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
          >
            <Plus size={13} />
            New project
          </button>
        )}

        {ownedProjects.map((project) => (
          <Link
            key={project.id}
            to={`/board/${project.id}`}
            className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
              isActive(project.id)
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderKanban size={16} className="shrink-0" />
            {sidebarOpen && <span className="truncate flex-1">{project.name}</span>}
          </Link>
        ))}

        {/* ── SHARED WITH ME ────────────────────────────────────── */}
        {sharedProjects.length > 0 && (
          <>
            {sidebarOpen && (
              <div className="pt-4 pb-1 px-2">
                <div className="flex items-center gap-1.5">
                  <Share2 size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Shared with me
                  </span>
                </div>
              </div>
            )}

            {sharedProjects.map((project) => {
              const role = project.members?.[myUserId]?.role ?? 'reader'
              const badge = ROLE_BADGE[role]
              return (
                <Link
                  key={project.id}
                  to={`/board/${project.id}`}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                    isActive(project.id)
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FolderKanban size={16} className="shrink-0 text-slate-400" />
                  {sidebarOpen && (
                    <>
                      <span className="truncate flex-1 text-slate-600">{project.name}</span>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.class}`}>
                        {badge.label}
                      </span>
                    </>
                  )}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-slate-100 p-2 space-y-1">
        {sidebarOpen && (
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 uppercase">
              {user?.email?.[0] ?? 'U'}
            </span>
            <span className="truncate text-xs text-slate-600">{user?.email}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} className="shrink-0" />
          {sidebarOpen && <span>Sign out</span>}
        </button>
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </aside>
  )
}
