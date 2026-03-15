import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import type { Task } from '../types'
import type { Theme } from '../theme'

interface Props {
  tasks: Task[]
  theme: Theme
}

function getWeekLabel(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CompletionChart({ tasks, theme }: Props) {
  const doneTasks = tasks.filter((t) => t.columnId === 'done')

  if (doneTasks.length === 0) {
    return <EmptyState message="No completed tasks yet" theme={theme} />
  }

  const weekMap = new Map<string, { label: string; ts: number; count: number }>()

  for (const task of doneTasks) {
    const date = new Date(task.updatedAt)
    const day = date.getDay()
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - day)
    weekStart.setHours(0, 0, 0, 0)
    const key = weekStart.toISOString().slice(0, 10)
    const existing = weekMap.get(key)
    if (existing) {
      existing.count++
    } else {
      weekMap.set(key, { label: getWeekLabel(weekStart.getTime()), ts: weekStart.getTime(), count: 1 })
    }
  }

  const data = [...weekMap.values()]
    .sort((a, b) => a.ts - b.ts)
    .slice(-12)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridLine} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: theme.textMuted }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12, fill: theme.textMuted }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(v: number) => [`${v} tasks`, 'Completed']}
          contentStyle={{
            borderRadius: 10,
            border: `1px solid ${theme.tooltipBorder}`,
            background: theme.tooltipBg,
            fontSize: 12,
          }}
          itemStyle={{ color: theme.tooltipText }}
          labelStyle={{ color: theme.textSecondary, fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Completed"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#completionGrad)"
          dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#6366f1' }}
        />
      </AreaChart>
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
