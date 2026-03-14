/** Central definition of every tag — used in TaskCard, LabelPicker, and FilterDropdown */

export interface LabelDef {
  value: string
  label: string
  /** Pill background color */
  bg: string
  /** Pill text color */
  fg: string
  /** Small dot color (for filter dropdowns) */
  dot: string
}

export const PRESET_LABELS: LabelDef[] = [
  { value: 'bug',         label: 'Bug',         bg: '#fef2f2', fg: '#991b1b', dot: '#ef4444' },
  { value: 'feature',     label: 'Feature',     bg: '#eff6ff', fg: '#1e40af', dot: '#3b82f6' },
  { value: 'infra',       label: 'Infra',       bg: '#fff7ed', fg: '#9a3412', dot: '#f97316' },
  { value: 'design',      label: 'Design',      bg: '#fdf4ff', fg: '#6b21a8', dot: '#a855f7' },
  { value: 'docs',        label: 'Docs',        bg: '#f0fdf4', fg: '#14532d', dot: '#22c55e' },
  { value: 'security',    label: 'Security',    bg: '#fff1f2', fg: '#881337', dot: '#f43f5e' },
  { value: 'performance', label: 'Performance', bg: '#fffbeb', fg: '#92400e', dot: '#f59e0b' },
  { value: 'testing',     label: 'Testing',     bg: '#ecfdf5', fg: '#064e3b', dot: '#10b981' },
  { value: 'chore',       label: 'Chore',       bg: '#f8fafc', fg: '#475569', dot: '#94a3b8' },
  { value: 'hotfix',      label: 'Hotfix',      bg: '#fff0f0', fg: '#7f1d1d', dot: '#dc2626' },
  { value: 'research',    label: 'Research',    bg: '#f5f3ff', fg: '#4c1d95', dot: '#8b5cf6' },
  { value: 'refactor',    label: 'Refactor',    bg: '#eef2ff', fg: '#3730a3', dot: '#6366f1' },
]

const LABEL_MAP = new Map(PRESET_LABELS.map((l) => [l.value.toLowerCase(), l]))

/** Returns colors for a label value. Falls back to a neutral grey for custom/unknown labels. */
export function getLabelDef(value: string): LabelDef {
  return (
    LABEL_MAP.get(value.toLowerCase()) ?? {
      value,
      label: value,
      bg: '#f1f5f9',
      fg: '#475569',
      dot: '#94a3b8',
    }
  )
}
