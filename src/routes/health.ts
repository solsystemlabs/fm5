import { createServerFileRoute } from '@tanstack/react-start/server'
import { getHealthStatusCode, performHealthCheck } from '../../lib/health-check'

export const ServerRoute = createServerFileRoute('/health').methods({
  GET: async () => {
    const healthResult = await performHealthCheck()

    return new Response(JSON.stringify(healthResult), {
      status: getHealthStatusCode(healthResult.status),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  },
})