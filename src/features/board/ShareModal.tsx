import { useState } from 'react'
import { X, Plus, Trash2, Loader2, Crown, Pencil, Eye } from 'lucide-react'
import { getUserByEmail, shareProject, updateMemberRole, removeMember } from '@/lib/firestore'
import type { Project, ProjectRole } from '@/lib/types'
import { SelectDropdown } from '@/shared/SelectDropdown'
import type { SelectOption } from '@/shared/SelectDropdown'

interface PendingInvite {
  uid: string
  email: string
  role: ProjectRole
}

interface ShareModalProps {
  project: Project
  ownerUid: string
  ownerEmail: string
  onClose: () => void
  onProjectUpdated: (updated: Project) => void
}

const ROLE_OPTIONS: SelectOption[] = [
  {
    value: 'admin',
    label: 'Admin',
    icon: <Crown size={12} />,
    description: 'Full access, can share & manage members',
  },
  {
    value: 'writer',
    label: 'Writer',
    icon: <Pencil size={12} />,
    description: 'Can create, edit, and move tasks',
  },
  {
    value: 'reader',
    label: 'Reader',
    icon: <Eye size={12} />,
    description: 'View only, cannot make changes',
  },
]

const ROLE_BADGE: Record<ProjectRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  writer: 'bg-blue-100 text-blue-700',
  reader: 'bg-slate-100 text-slate-600',
}

export function ShareModal({ project, ownerUid, ownerEmail, onClose, onProjectUpdated }: ShareModalProps) {
  // Safely get members map — old projects may not have it yet
  const membersMap = project.members ?? {}
  const [emailInput, setEmailInput] = useState('')
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('writer')
  const [pending, setPending] = useState<PendingInvite[]>([])
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  // Existing non-owner members
  const existingMembers = Object.entries(membersMap)
    .filter(([uid]) => uid !== ownerUid)
    .map(([uid, info]) => ({ uid, ...info }))

  async function handleAdd() {
    const email = emailInput.trim().toLowerCase()
    if (!email) return
    if (pending.some((p) => p.email === email) || existingMembers.some((m) => m.email === email)) {
      setLookupError('This person is already added.')
      return
    }
    if (email === (membersMap[ownerUid]?.email ?? ownerEmail).toLowerCase()) {
      setLookupError("That's the project owner.")
      return
    }
    setLookingUp(true)
    setLookupError(null)
    const found = await getUserByEmail(email)
    setLookingUp(false)
    if (!found) {
      setLookupError('No FlowBoard account found with that email. They must sign up first.')
      return
    }
    setPending((prev) => [...prev, { uid: found.uid, email: found.email, role: selectedRole }])
    setEmailInput('')
  }

  async function handleShare() {
    if (!pending.length) { onClose(); return }
    setSharing(true)
    await shareProject(project.id, ownerUid, ownerEmail, pending)

    // Build updated project locally so parent doesn't need to re-fetch
    const updatedMembers: Project['members'] = {
      ...membersMap,
      [ownerUid]: { email: ownerEmail, role: 'admin' }, // ensure owner is always in map
    }
    const updatedMemberIds = [...(project.memberIds ?? [])]
    for (const inv of pending) {
      updatedMembers[inv.uid] = { email: inv.email, role: inv.role }
      if (!updatedMemberIds.includes(inv.uid)) updatedMemberIds.push(inv.uid)
    }
    onProjectUpdated({ ...project, members: updatedMembers, memberIds: updatedMemberIds })
    setSharing(false)
    onClose()
  }

  async function handleRoleChange(uid: string, role: ProjectRole) {
    await updateMemberRole(project.id, uid, role)
    const updatedMembers = { ...membersMap, [uid]: { ...membersMap[uid], role } }
    onProjectUpdated({ ...project, members: updatedMembers })
  }

  async function handleRemove(uid: string) {
    await removeMember(project.id, uid)
    const updatedMembers = { ...membersMap }
    delete updatedMembers[uid]
    const updatedMemberIds = (project.memberIds ?? []).filter((id) => id !== uid)
    onProjectUpdated({ ...project, members: updatedMembers, memberIds: updatedMemberIds })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700/60 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Share "{project.name}"</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Invite people to collaborate</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Add person row */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setLookupError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Email address"
                className="flex-1 h-9 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <SelectDropdown
                value={selectedRole}
                onChange={(v) => setSelectedRole(v as ProjectRole)}
                options={ROLE_OPTIONS}
                triggerClassName="h-9 rounded-xl px-3"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!emailInput.trim() || lookingUp}
                className="flex items-center gap-1.5 h-9 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {lookingUp ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Add
              </button>
            </div>
            {lookupError && (
              <p className="text-xs text-red-500">{lookupError}</p>
            )}
            <p className="text-[11px] text-slate-400">
              {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.description}
            </p>
          </div>

          {/* Pending invites */}
          {pending.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Pending ({pending.length})
              </p>
              {pending.map((inv) => (
                <div key={inv.uid} className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {inv.email[0].toUpperCase()}
                  </span>
                  <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{inv.email}</span>
                  <SelectDropdown
                    value={inv.role}
                    onChange={(v) =>
                      setPending((prev) =>
                        prev.map((p) => p.uid === inv.uid ? { ...p, role: v as ProjectRole } : p)
                      )
                    }
                    options={ROLE_OPTIONS}
                  />
                  <button
                    type="button"
                    onClick={() => setPending((prev) => prev.filter((p) => p.uid !== inv.uid))}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing members */}
          {existingMembers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Current members
              </p>
              {/* Owner row */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {(membersMap[ownerUid]?.email ?? ownerEmail ?? 'O')[0].toUpperCase()}
                </span>
                <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">
                  {membersMap[ownerUid]?.email ?? ownerEmail ?? 'Owner'}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_BADGE.admin}`}>
                  <Crown size={10} /> Admin
                </span>
              </div>

              {existingMembers.map((m) => (
                <div key={m.uid} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {m.email[0].toUpperCase()}
                  </span>
                  <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{m.email}</span>
                  <SelectDropdown
                    value={m.role}
                    onChange={(v) => handleRoleChange(m.uid, v as ProjectRole)}
                    options={ROLE_OPTIONS}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(m.uid)}
                    title="Remove member"
                    className="rounded-lg p-1 text-slate-300 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-700/60 px-6 py-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {sharing && <Loader2 size={13} className="animate-spin" />}
            {pending.length > 0 ? `Share with ${pending.length} person${pending.length > 1 ? 's' : ''}` : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
