import { useUIStore } from '@/lib/store'

interface PresenceBarProps {
  myUserId: string
}

export function PresenceBar({ myUserId }: PresenceBarProps) {
  const presence = useUIStore((s) => s.presence)
  const others = presence.filter((u) => u.userId !== myUserId)

  if (!others.length) return null

  return (
    <div className="flex items-center gap-1" title="Active collaborators">
      {others.slice(0, 6).map((user) => (
        <div
          key={user.userId}
          title={user.email}
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white shadow-sm transition-transform hover:scale-110"
          style={{ backgroundColor: user.color }}
        >
          {user.email[0]?.toUpperCase() ?? '?'}
        </div>
      ))}
      {others.length > 6 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 ring-2 ring-white shadow-sm">
          +{others.length - 6}
        </div>
      )}
      <span className="ml-1 text-xs text-slate-400">
        {others.length} online
      </span>
    </div>
  )
}
