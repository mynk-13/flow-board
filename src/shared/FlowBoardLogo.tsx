interface Props {
  size?: number
  className?: string
}

/**
 * FlowBoard brand mark — a bold "F" letterform on an indigo→violet gradient square.
 * The vertical spine + two crossbars read as both the letter and a simplified board layout.
 */
export function FlowBoardLogo({ size = 28, className = '' }: Props) {
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
        <linearGradient id="fbg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="32" height="32" rx="8" fill="url(#fbg)" />

      {/* Vertical spine of "F" */}
      <rect x="7"  y="7"  width="4.5" height="18" rx="2.25" fill="white" fillOpacity="0.95" />

      {/* Top crossbar */}
      <rect x="13" y="7"  width="12"  height="4.5" rx="2.25" fill="white" fillOpacity="0.95" />

      {/* Middle crossbar — slightly shorter, classic F proportion */}
      <rect x="13" y="14" width="9"   height="3.5" rx="1.75" fill="white" fillOpacity="0.80" />
    </svg>
  )
}
