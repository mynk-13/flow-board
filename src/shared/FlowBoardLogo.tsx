interface Props {
  size?: number
  className?: string
}

/**
 * FlowBoard brand logo — kanban columns forming an "F" silhouette.
 * Three columns with staggered task cards represent the board concept.
 */
export function FlowBoardLogo({ size = 28, className = '' }: Props) {
  const id = 'fb-grad'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FlowBoard logo"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Rounded background */}
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />

      {/* Left spine (vertical bar of the "F") */}
      <rect x="7" y="7"  width="4" height="18" rx="2" fill="white" fillOpacity="0.95" />

      {/* Top crossbar */}
      <rect x="13" y="7"  width="12" height="4"  rx="2" fill="white" fillOpacity="0.95" />

      {/* Middle crossbar (shorter — classic "F" shape) */}
      <rect x="13" y="14" width="9"  height="3.5" rx="1.75" fill="white" fillOpacity="0.80" />

      {/* Bottom dot — represents a task card at rest */}
      <rect x="13" y="21" width="5"  height="3.5" rx="1.75" fill="white" fillOpacity="0.45" />
    </svg>
  )
}
