interface Props {
  size?: number
  className?: string
}

/**
 * FlowBoard brand mark — three kanban columns of descending height,
 * each containing a bright task-card pill. Reads as a board/flow at any size.
 *
 * Gradient: indigo-500 → violet-600 (top-left → bottom-right).
 */
export function FlowBoardLogo({ size = 28, className = '' }: Props) {
  // Each render gets a unique gradient id so multiple instances don't clash.
  const gid = 'fbg'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FlowBoard"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* ── Rounded background ── */}
      <rect width="32" height="32" rx="8" fill={`url(#${gid})`} />

      {/* ── Column 1 — tall (backlog) ── */}
      {/* Column track */}
      <rect x="5"   y="7"    width="6" height="18" rx="3"   fill="white" fillOpacity="0.15" />
      {/* Top card — bright */}
      <rect x="6.5" y="9"    width="3" height="5"  rx="1.5" fill="white" fillOpacity="0.95" />
      {/* Bottom card — muted */}
      <rect x="6.5" y="16.5" width="3" height="4"  rx="1.5" fill="white" fillOpacity="0.45" />

      {/* ── Column 2 — medium (in progress) ── */}
      <rect x="13"  y="10"   width="6" height="15" rx="3"   fill="white" fillOpacity="0.15" />
      {/* Card — bright accent */}
      <rect x="14.5" y="12"  width="3" height="5"  rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="14.5" y="19"  width="3" height="3"  rx="1.5" fill="white" fillOpacity="0.45" />

      {/* ── Column 3 — short (done) ── */}
      <rect x="21"  y="14"   width="6" height="11" rx="3"   fill="white" fillOpacity="0.15" />
      {/* Card — full brightness = "done" */}
      <rect x="22.5" y="16"  width="3" height="5"  rx="1.5" fill="white" fillOpacity="0.95" />
    </svg>
  )
}
