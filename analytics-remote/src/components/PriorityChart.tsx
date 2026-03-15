import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import type { Task } from '../types'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../types'
import type { Theme } from '../theme'

interface Props {
  tasks: Task[]
  theme: Theme
}

export function PriorityChart({ tasks, theme }: Props) {
  const order: Array<keyof typeof PRIORITY_LABELS> = ['urgent', 'high', 'medium', 'low', 'none']
  const data = order.map((p) => ({
    name: PRIORITY_LABELS[p],
    value: tasks.filter((t) => t.priority === p).length,
    color: PRIORITY_COLORS[p],
  })).filter((d) => d.value > 0)

  if (data.length === 0) {
    return <EmptyState message="No tasks yet" theme={theme} />
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridLine} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.textSecondary }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: theme.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          formatter={(value: number, name: string) => [`${value} tasks`, name]}
          contentStyle={{
            borderRadius: 10,
            border: `1px solid ${theme.tooltipBorder}`,
            background: theme.tooltipBg,
            fontSize: 12,
          }}
          itemStyle={{ color: theme.tooltipText }}
          labelStyle={{ color: theme.textSecondary, fontWeight: 600 }}
          cursor={{ fill: theme.cursorFill }}
        />
        <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 600, fill: theme.textSecondary }} />
        </Bar>
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
