import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import type { Task } from '../types'

const PALETTE = [
  '#6366f1', '#a78bfa', '#34d399', '#60a5fa', '#f97316',
  '#f43f5e', '#eab308', '#14b8a6', '#8b5cf6', '#06b6d4',
]

interface Props {
  tasks: Task[]
}

export function LabelChart({ tasks }: Props) {
  const freq: Record<string, number> = {}
  for (const task of tasks) {
    for (const label of task.labels) {
      freq[label] = (freq[label] ?? 0) + 1
    }
  }

  const data = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))

  if (data.length === 0) {
    return <EmptyState message="No labels assigned to tasks yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 38)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 48, bottom: 0, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={88}
          tick={{ fontSize: 12, fill: '#475569' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v: number) => [`${v} tasks`, 'Usage']}
          contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 12 }}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="right" style={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
      {message}
    </div>
  )
}
