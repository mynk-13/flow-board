export interface Theme {
  bg: string
  card: string
  cardBorder: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  gridLine: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  cursorFill: string
  pillInactive: string
  pillInactiveText: string
}

export const lightTheme: Theme = {
  bg:               '#f8fafc',
  card:             '#ffffff',
  cardBorder:       '#f1f5f9',
  textPrimary:      '#0f172a',
  textSecondary:    '#475569',
  textMuted:        '#94a3b8',
  gridLine:         '#f1f5f9',
  tooltipBg:        '#ffffff',
  tooltipBorder:    '#e2e8f0',
  tooltipText:      '#1e293b',
  cursorFill:       '#f8fafc',
  pillInactive:     '#f1f5f9',
  pillInactiveText: '#64748b',
}

export const darkTheme: Theme = {
  bg:               '#020617',
  card:             '#1e293b',
  cardBorder:       '#334155',
  textPrimary:      '#f1f5f9',
  textSecondary:    '#94a3b8',
  textMuted:        '#64748b',
  gridLine:         '#1e293b',
  tooltipBg:        '#0f172a',
  tooltipBorder:    '#334155',
  tooltipText:      '#e2e8f0',
  cursorFill:       '#1e293b',
  pillInactive:     '#1e293b',
  pillInactiveText: '#94a3b8',
}
