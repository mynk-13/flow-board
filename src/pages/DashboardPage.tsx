import { useOutletContext, Link } from 'react-router-dom'
import { FolderKanban, Trash2, Share2, Crown, Pencil, Eye } from 'lucide-react'
import { useState } from 'react'
import { deleteProject } from '@/lib/firestore'
import { useAuth } from '@/features/auth'
import type { OutletCtx, ProjectRole } from '@/lib/types'

const ROLE_BADGE: Record<ProjectRole, { label: string; class: string; icon: React.ReactNode }> = {
  admin: { label: 'Admin', class: 'bg-purple-100 text-purple-700', icon: <Crown size={10} /> },
  writer: { label: 'Writer', class: 'bg-blue-100 text-blue-700', icon: <Pencil size={10} /> },
  reader: { label: 'Reader', class: 'bg-slate-100 text-slate-600', icon: <Eye size={10} /> },
}

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="animate-pulse h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
        <div className="animate-pulse h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="flex items-center justify-between">
        <div className="animate-pulse h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="animate-pulse h-3 w-14 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { workspace, ownedProjects, sharedProjects, setOwnedProjects } = useOutletContext<OutletCtx>()
  const { user } = useAuth()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(projectId: string) {
    setDeletingId(projectId)
    await deleteProject(projectId)
    setOwnedProjects((prev) => prev.filter((p) => p.id !== projectId))
    setDeletingId(null)
  }

  const totalCount = ownedProjects.length + sharedProjects.length
  const isLoading = workspace === null

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        {isLoading ? (
          <>
            <div className="animate-pulse h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="animate-pulse h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {workspace.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {totalCount} project{totalCount !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <section>
            <div className="animate-pulse h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <ProjectCardSkeleton key={i} />)}
            </div>
          </section>
        </div>
      ) : totalCount === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-16 text-center">
          <FolderKanban size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No projects yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-5">
            Create your first project to start organising tasks on a Kanban board.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {ownedProjects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                Created by me
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
                  >
                    <Link to={`/board/${project.id}`} className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                          <FolderKanban size={18} />
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{project.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                        {(project.memberIds?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Share2 size={11} />
                            {project.memberIds.length} member{project.memberIds.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </Link>
                    <button
                      type="button"
                      title="Delete project"
                      disabled={deletingId === project.id}
                      onClick={() => handleDelete(project.id)}
                      className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sharedProjects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                <Share2 size={12} /> Shared with me
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedProjects.map((project) => {
                  const role = project.members?.[user?.uid ?? '']?.role ?? 'reader'
                  const badge = ROLE_BADGE[role]
                  return (
                    <Link
                      key={project.id}
                      to={`/board/${project.id}`}
                      className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          <FolderKanban size={18} />
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex-1 truncate">{project.name}</span>
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.class}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Shared on {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
