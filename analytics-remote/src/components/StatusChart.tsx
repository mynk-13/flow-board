import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Task } from '../types'
import { COLUMN_LABELS, COLUMN_COLORS } from '../types'

interface Props {
  tasks: Task[]
}

export function StatusChart({ tasks }: Props) {
  const counts = Object.entries(COLUMN_LABELS).map(([id, label]) => ({
    name: label,
    value: tasks.filter((t) => t.columnId === id).length,
    color: COLUMN_COLORS[id as keyof typeof COLUMN_COLORS],
  })).filter((d) => d.value > 0)

  if (counts.length === 0) {
    return <EmptyState message="No tasks yet" />
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
          contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
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
