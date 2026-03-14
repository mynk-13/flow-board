import { useEffect, useState } from 'react'
import { useUIStore } from '@/lib/store'
import type { ProjectRole } from '@/lib/types'

const CURSOR_TIMEOUT_MS = 10_000 // hide cursor after 10 s of inactivity

interface CursorOverlayProps {
  myUserId: string
  myRole: ProjectRole
}

/** Live cursors — only rendered for admin and writer roles */
export function CursorOverlay({ myUserId, myRole }: CursorOverlayProps) {
  const cursors = useUIStore((s) => s.cursors)
  const [now, setNow] = useState(Date.now())

  // Tick every second to re-evaluate the 10-second timeout
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Readers never see cursors
  if (myRole === 'reader') return null

  const visible = cursors.filter(
    (c) =>
      c.userId !== myUserId &&
      now - (c.lastSeen ?? 0) < CURSOR_TIMEOUT_MS
  )

  if (!visible.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {visible.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-[top,left] duration-75 ease-out"
          style={{ top: cursor.y, left: cursor.x }}
        >
          {/* Cursor arrow SVG */}
          <svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            <path
              d="M1 1L7.5 19L10.5 12L17.5 9.5L1 1Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {/* Name label */}
          <div
            className="mt-0.5 ml-3 inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.email.split('@')[0]}
          </div>
        </div>
      ))}
    </div>
  )
}
