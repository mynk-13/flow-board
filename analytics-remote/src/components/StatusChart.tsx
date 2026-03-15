import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Task } from '../types'
import { COLUMN_LABELS, COLUMN_COLORS } from '../types'
import type { Theme } from '../theme'

interface Props {
  tasks: Task[]
  theme: Theme
}

export function StatusChart({ tasks, theme }: Props) {
  const counts = Object.entries(COLUMN_LABELS).map(([id, label]) => ({
    name: label,
    value: tasks.filter((t) => t.columnId === id).length,
    color: COLUMN_COLORS[id as keyof typeof COLUMN_COLORS],
  })).filter((d) => d.value > 0)

  if (counts.length === 0) {
    return <EmptyState message="No tasks yet" theme={theme} />
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={counts}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {counts.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} tasks`, name]}
          contentStyle={{
            borderRadius: 10,
            border: `1px solid ${theme.tooltipBorder}`,
            background: theme.tooltipBg,
            color: theme.tooltipText,
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8, color: theme.textSecondary }}
        />
      </PieChart>
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
