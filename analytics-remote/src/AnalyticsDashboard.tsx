import { useState } from 'react'
import type { Task, Project } from './types'
import { OverviewCards }   from './components/OverviewCards'
import { StatusChart }     from './components/StatusChart'
import { PriorityChart }   from './components/PriorityChart'
import { LabelChart }      from './components/LabelChart'
import { CompletionChart } from './components/CompletionChart'
import { TeamChart }       from './components/TeamChart'
import { lightTheme, darkTheme } from './theme'

export interface AnalyticsDashboardProps {
  tasks: Task[]
  projects: Project[]
  userId: string
  isDark?: boolean
}

/* ── Project filter pill ───────────────────────────────────────── */
function ProjectFilter({
  projects,
  selectedId,
  onSelect,
  pillInactive,
  pillInactiveText,
}: {
  projects: Project[]
  selectedId: string
  onSelect: (id: string) => void
  pillInactive: string
  pillInactiveText: string
}) {
  const pill = (id: string, label: string) => (
    <button
      key={id}
      onClick={() => onSelect(id)}
      style={{
        padding: '5px 14px',
        borderRadius: 99,
        border: 'none',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: selectedId === id ? '#6366f1' : pillInactive,
        color:      selectedId === id ? '#ffffff'  : pillInactiveText,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
      {pill('all', 'All Projects')}
      {projects.map((p) => pill(p.id, p.name))}
    </div>
  )
}

/* ── Main dashboard ─────────────────────────────────────────────── */
export default function AnalyticsDashboard({ tasks, projects, userId, isDark = false }: AnalyticsDashboardProps) {
  const [selectedProject, setSelectedProject] = useState('all')
  const theme = isDark ? darkTheme : lightTheme

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter((t) => t.projectId === selectedProject)

  const filteredProjects = selectedProject === 'all'
    ? projects
    : projects.filter((p) => p.id === selectedProject)

  const card: React.CSSProperties = {
    background: theme.card,
    borderRadius: 20,
    border: `1px solid ${theme.cardBorder}`,
    padding: '24px',
    boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 20,
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        background: theme.bg,
        minHeight: '100%',
        padding: '32px 32px 48px',
        color: theme.textPrimary,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.textPrimary, marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: theme.textSecondary }}>
          Overview of tasks and team activity across your projects.
        </p>
      </div>

      {/* Project filter */}
      <ProjectFilter
        projects={projects}
        selectedId={selectedProject}
        onSelect={setSelectedProject}
        pillInactive={theme.pillInactive}
        pillInactiveText={theme.pillInactiveText}
      />

      {/* Overview metric cards */}
      <div style={{ marginBottom: 24 }}>
        <OverviewCards tasks={filteredTasks} projects={filteredProjects} theme={theme} />
      </div>

      {/* Charts grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}
      >
        <div style={card}>
          <p style={sectionTitle}>Task Status Breakdown</p>
          <StatusChart tasks={filteredTasks} theme={theme} />
        </div>

        <div style={card}>
          <p style={sectionTitle}>Priority Distribution</p>
          <PriorityChart tasks={filteredTasks} theme={theme} />
        </div>

        <div style={{ ...card, gridColumn: '1 / -1' }}>
          <p style={sectionTitle}>Completions Over Time</p>
          <p style={{ fontSize: 12, color: theme.textMuted, marginTop: -14, marginBottom: 16 }}>
            Tasks moved to Done, grouped by week
          </p>
          <CompletionChart tasks={filteredTasks} theme={theme} />
        </div>

        <div style={card}>
          <p style={sectionTitle}>Label Usage (Top 10)</p>
          <LabelChart tasks={filteredTasks} theme={theme} />
        </div>

        <div style={card}>
          <p style={sectionTitle}>Team Activity by Assignee</p>
          <TeamChart tasks={filteredTasks} projects={filteredProjects} userId={userId} theme={theme} />
        </div>
      </div>

      {/* Footer badge */}
      <p style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: theme.textMuted }}>
        Powered by{' '}
        <span style={{ fontWeight: 700, color: '#a5b4fc' }}>FlowBoard Analytics</span>
        {' '}· Module Federation remote
      </p>
    </div>
  )
}
