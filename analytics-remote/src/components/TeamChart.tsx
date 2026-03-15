import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import type { Task, Project } from '../types'
import { COLUMN_LABELS, COLUMN_COLORS } from '../types'
import type { Theme } from '../theme'

const COLUMNS = ['backlog', 'todo', 'inprogress', 'inreview', 'done'] as const

interface Props {
  tasks: Task[]
  projects: Project[]
  userId: string
  theme: Theme
}

export function TeamChart({ tasks, projects, userId, theme }: Props) {
  const memberMap = new Map<string, string>()
  memberMap.set(userId, 'Me')
  for (const project of projects) {
    for (const [uid, info] of Object.entries(project.members ?? {})) {
      if (!memberMap.has(uid)) {
        memberMap.set(uid, info.email.split('@')[0])
      }
    }
  }

  const assigneeIds = new Set(tasks.map((t) => t.assigneeId ?? 'unassigned'))
  const data = [...assigneeIds].map((uid) => {
    const row: Record<string, string | number> = {
      name: uid === 'unassigned' ? 'Unassigned' : (memberMap.get(uid) ?? uid.slice(0, 8)),
    }
    const assigneeTasks = tasks.filter((t) => (t.assigneeId ?? 'unassigned') === uid)
    for (const col of COLUMNS) {
      row[col] = assigneeTasks.filter((t) => t.columnId === col).length
    }
    row._total = assigneeTasks.length
    return row
  }).filter((r) => (r._total as number) > 0)
    .sort((a, b) => (b._total as number) - (a._total as number))
    .slice(0, 8)

  if (data.length === 0) {
    return <EmptyState message="No tasks with assignees yet" theme={theme} />
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.gridLine} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: theme.textMuted }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={96}
          tick={{ fontSize: 12, fill: theme.textSecondary }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: `1px solid ${theme.tooltipBorder}`,
            background: theme.tooltipBg,
            color: theme.tooltipText,
            fontSize: 12,
          }}
          cursor={{ fill: theme.cursorFill }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8, color: theme.textSecondary }} />
        {COLUMNS.map((col) => (
          <Bar
            key={col}
            dataKey={col}
            name={COLUMN_LABELS[col]}
            stackId="a"
            fill={COLUMN_COLORS[col]}
            radius={col === 'done' ? [0, 4, 4, 0] : [0, 0, 0, 0]}
            maxBarSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyState({ message, theme }: { message: string; theme: Theme }) {
  return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, fontSize: 13 }}>
      {message}
    </div>
  )
}
