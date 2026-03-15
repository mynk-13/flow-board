import { useRef, useState, useCallback } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { FolderKanban, Trash2, Share2, Crown, Pencil, Eye, Plus } from 'lucide-react'
import { deleteProject } from '@/lib/firestore'
import { useAuth } from '@/features/auth'
import type { OutletCtx, ProjectRole } from '@/lib/types'

const ROLE_META: Record<ProjectRole, { label: string; icon: React.ReactNode; pill: string }> = {
  admin:  { label: 'Admin',  icon: <Crown  size={10} />, pill: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  writer: { label: 'Writer', icon: <Pencil size={10} />, pill: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  reader: { label: 'Reader', icon: <Eye    size={10} />, pill: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
}

// ─── 3-D tilt card with mouse-tracking glare ─────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const px = (e.clientX - left) / width   // 0→1
    const py = (e.clientY - top)  / height  // 0→1
    const rx = (py - 0.5) * -16             // tilt X axis
    const ry = (px - 0.5) *  16             // tilt Y axis

    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(16px) scale(1.03)`
    setGlare({ x: px * 100, y: py * 100, opacity: 0.22 })
  }, [])

  const onLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform =
        'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)'
    }
    setGlare((g) => ({ ...g, opacity: 0 }))
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)', transformStyle: 'preserve-3d', willChange: 'transform' }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Moving glare highlight */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 65%)`,
          transition: 'opacity 0.2s',
          zIndex: 1,
        }}
      />
      {children}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/60 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="animate-pulse h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="animate-pulse h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="animate-pulse h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="animate-pulse h-3 w-16 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="animate-pulse h-3 w-12 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
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
  const isLoading  = workspace === null

  return (
    /* Dot-grid canvas */
    <div className="relative min-h-full dot-grid bg-slate-50 dark:bg-slate-950 px-8 py-10">

      {/* Radial fade so the grid fades to the background at edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 0%, transparent 60%, var(--tw-gradient-stops, #f8fafc) 100%)',
        }}
      />

      <div className="relative z-10 max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          {isLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse h-8 w-56 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="animate-pulse h-4 w-28 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {workspace.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {totalCount} project{totalCount !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <section>
            <div className="animate-pulse h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          </section>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-400">
              <FolderKanban size={32} />
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No projects yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-xs">
              Create your first project to start organising tasks on a Kanban board.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <Plus size={12} />
              Use the sidebar to create a project
            </div>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── Created by me ── */}
            {ownedProjects.length > 0 && (
              <section>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Created by me
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ownedProjects.map((project) => (
                    <TiltCard
                      key={project.id}
                      className="group rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm shadow-md dark:shadow-slate-900/50 hover:shadow-indigo-200/40 dark:hover:shadow-indigo-900/40 hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700/60 transition-shadow duration-300"
                    >
                      <Link to={`/board/${project.id}`} className="block p-5">
                        {/* Icon + name */}
                        <div className="flex items-start gap-3 mb-4">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <FolderKanban size={20} />
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                              {project.name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Open board →
                          </span>
                          {(project.memberIds?.length ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <Share2 size={11} />
                              {project.memberIds.length}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Delete — shown on hover */}
                      <button
                        type="button"
                        title="Delete project"
                        disabled={deletingId === project.id}
                        onClick={() => handleDelete(project.id)}
                        className="absolute top-3 right-3 z-10 rounded-lg p-1.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </TiltCard>
                  ))}
                </div>
              </section>
            )}

            {/* ── Shared with me ── */}
            {sharedProjects.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <Share2 size={11} /> Shared with me
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sharedProjects.map((project) => {
                    const role = project.members?.[user?.uid ?? '']?.role ?? 'reader'
                    const meta = ROLE_META[role]
                    return (
                      <TiltCard
                        key={project.id}
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm shadow-md dark:shadow-slate-900/50 hover:shadow-violet-200/40 dark:hover:shadow-violet-900/40 hover:shadow-2xl hover:border-violet-200 dark:hover:border-violet-700/60 transition-shadow duration-300"
                      >
                        <Link to={`/board/${project.id}`} className="block p-5">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shadow-sm">
                              <FolderKanban size={20} />
                            </span>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                                {project.name}
                              </p>
                              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.pill}`}>
                                {meta.icon} {meta.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              Open board →
                            </span>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      </TiltCard>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
