/**
 * TypeScript ambient declarations for Module Federation remotes.
 * These are resolved at runtime from remoteEntry.js — not bundled.
 */
declare module 'analytics_remote/AnalyticsDashboard' {
  import type { Task, Project } from '@/lib/types'

  export interface AnalyticsDashboardProps {
    tasks: Task[]
    projects: Project[]
    userId: string
  }

  const AnalyticsDashboard: React.ComponentType<AnalyticsDashboardProps>
  export default AnalyticsDashboard
}
