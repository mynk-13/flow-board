import type { Task, Project } from '../types'

interface Props {
  tasks: Task[]
  projects: Project[]
}

interface CardProps {
  label: string
  value: string | number
  sub?: string
  accent: string
}

function StatCard({ label, value, sub, accent }: CardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${accent}`,
        flex: '1 1 160px',
        minWidth: 0,
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

export function OverviewCards({ tasks, projects }: Props) {
  const total      = tasks.length
  const done       = tasks.filter((t) => t.columnId === 'done').length
  const inProgress = tasks.filter((t) => t.columnId === 'inprogress').length
  const overdue    = tasks.filter((t) => {
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date() && t.columnId !== 'done'
  }).length
  const completion = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <StatCard label="Total Tasks"    value={total}       sub={`across ${projects.length} project${projects.length !== 1 ? 's' : ''}`} accent="#6366f1" />
      <StatCard label="Completed"      value={done}        sub={`${completion}% completion rate`}    accent="#34d399" />
      <StatCard label="In Progress"    value={inProgress}  sub="actively being worked on"             accent="#a78bfa" />
      <StatCard label="Overdue"        value={overdue}     sub="past due date, not done"              accent="#f97316" />
    </div>
  )
}
