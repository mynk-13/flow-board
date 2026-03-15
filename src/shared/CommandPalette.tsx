import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, BarChart2, FolderKanban,
  Plus, LogOut, ArrowRight, X,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useAuth } from '@/features/auth'
import type { Project } from '@/lib/types'

interface CommandPaletteProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
  onCreateProject: () => void
}

interface PaletteItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  section: string
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-sm">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function CommandPalette({ ownedProjects, sharedProjects, onCreateProject }: CommandPaletteProps) {
  const { cmdPaletteOpen, closeCmdPalette } = useUIStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    closeCmdPalette()
    setQuery('')
    setActiveIdx(0)
  }, [closeCmdPalette])

  useEffect(() => {
    if (cmdPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [cmdPaletteOpen])

  const allItems: PaletteItem[] = [
    {
      id: 'home',
      label: 'Home',
      description: 'Go to dashboard',
      icon: <LayoutDashboard size={15} />,
      shortcut: '⌘1',
      action: () => { navigate('/'); close() },
      section: 'Navigate',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Open analytics dashboard',
      icon: <BarChart2 size={15} />,
      shortcut: '⌘2',
      action: () => { navigate('/analytics'); close() },
      section: 'Navigate',
    },
    ...ownedProjects.map((p) => ({
      id: `owned-${p.id}`,
      label: p.name,
      description: 'Your project',
      icon: <FolderKanban size={15} />,
      action: () => { navigate(`/board/${p.id}`); close() },
      section: 'Projects',
    })),
    ...sharedProjects.map((p) => ({
      id: `shared-${p.id}`,
      label: p.name,
      description: 'Shared with you',
      icon: <FolderKanban size={15} className="text-slate-400" />,
      action: () => { navigate(`/board/${p.id}`); close() },
      section: 'Projects',
    })),
    {
      id: 'new-project',
      label: 'Create new project',
      icon: <Plus size={15} />,
      shortcut: '⌘N',
      action: () => { onCreateProject(); close() },
      section: 'Actions',
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      icon: <LogOut size={15} />,
      action: async () => { close(); await signOut(); navigate('/login') },
      section: 'Actions',
    },
  ]

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  // Group by section (only when not searching)
  const sections = query.trim()
    ? [{ title: 'Results', items: filtered }]
    : [
        { title: 'Navigate', items: filtered.filter((i) => i.section === 'Navigate') },
        { title: 'Projects', items: filtered.filter((i) => i.section === 'Projects') },
        { title: 'Actions', items: filtered.filter((i) => i.section === 'Actions') },
      ].filter((s) => s.items.length > 0)

  const flat = sections.flatMap((s) => s.items)

  useEffect(() => setActiveIdx(0), [query])

  useEffect(() => {
    // Scroll active item into view
    const el = listRef.current?.querySelector(`[data-active="true"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      flat[activeIdx]?.action()
    } else if (e.key === 'Escape') {
      close()
    }
  }

  if (!cmdPaletteOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh]"
      aria-modal="true"
      role="dialog"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-4">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search or jump to…"
            className="flex-1 py-4 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="shrink-0 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={13} />
            </button>
          )}
          <kbd className="shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {flat.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.title}>
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const idx = flat.indexOf(item)
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-active={isActive}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left font-medium">
                        {highlight(item.label, query)}
                      </span>
                      {item.description && !query && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {item.description}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isActive && !item.shortcut && (
                        <ArrowRight size={12} className="shrink-0 text-indigo-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 px-4 py-2">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1 text-[10px]">↑</kbd>
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1 text-[10px]">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 text-[10px]">↵</kbd>
            select
          </span>
          <span className="ml-auto text-[11px] text-slate-400">
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 text-[10px]">⌘K</kbd>
            {' '}to open
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
