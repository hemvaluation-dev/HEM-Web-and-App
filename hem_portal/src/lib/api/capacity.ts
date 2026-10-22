import { ApiError } from './errors'

export type Workload = 'report'
const limits = { report: 2 }
const active = { report: 0 }

/** Bounds expensive work within one process. Deployment-wide quotas belong at ingress. */
export async function withCapacity<T>(workload: Workload, operation: () => Promise<T>): Promise<T> {
  if (active[workload] >= limits[workload]) throw new ApiError(429, 'BUSY', 'The service is busy. Please retry shortly.')
  active[workload]++
  try { return await operation() }
  finally { active[workload]-- }
}
