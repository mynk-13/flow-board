import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import type { Task } from '../types'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../types'

interface Props {
  tasks: Task[]
}

export function PriorityChart({ tasks }: Props) {
  const order: Array<keyof typeof PRIORITY_LABELS> = ['urgent', 'high', 'medium', 'low', 'none']
  const data = order.map((p) => ({
    name: PRIORITY_LABELS[p],
    value: tasks.filter((t) => t.priority === p).length,
    color: PRIORITY_COLORS[p],
  })).filter((d) => d.value > 0)

  if (data.length === 0) {
    return <EmptyState message="No tasks yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          formatter={(value: number, name: string) => [`${value} tasks`, name]}
          contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 12 }}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
      {message}
    </div>
  )
}
