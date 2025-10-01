/**
 * Dev Health Dashboard
 *
 * Real-time health monitoring dashboard for all external services.
 * Environment-gated for development/staging only.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { trpc } from '../../lib/api'

export const Route = createFileRoute('/dev/health')({
  component: DevHealthPage,
  beforeLoad: () => {
    // Environment gating: prevent access in production
    if (import.meta.env.PROD && process.env.NODE_ENV === 'production') {
      throw new Error('Dev tools not available in production')
    }
  },
})

function DevHealthPage() {
  const healthQuery = trpc.dev.getServiceHealth.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  useEffect(() => {
    // Initial fetch
    healthQuery.refetch()
  }, [])

  if (healthQuery.isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Environment Health Dashboard</h1>
        <p>Loading health status...</p>
      </div>
    )
  }

  if (healthQuery.error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Environment Health Dashboard</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-800">Error loading health status: {healthQuery.error.message}</p>
        </div>
      </div>
    )
  }

  const health = healthQuery.data

  if (!health) {
    return null
  }

  const overallStatusColor = {
    healthy: 'bg-green-100 border-green-300 text-green-800',
    degraded: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    unhealthy: 'bg-red-100 border-red-300 text-red-800',
  }[health.status]

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Environment Health Dashboard</h1>
        <button
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isFetching}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {healthQuery.isFetching ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {/* Overall Status Card */}
      <div className={`border p-6 rounded-lg mb-8 ${overallStatusColor}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">System Status</h2>
            <p className="text-sm opacity-75">Environment: {health.environment}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold capitalize">{health.status}</div>
            <div className="text-sm opacity-75">
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Service Status Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <ServiceStatusCard
          name="Database"
          service={health.services.database}
          icon="🗄️"
          description="PostgreSQL connection via Prisma"
        />
        <ServiceStatusCard
          name="Storage"
          service={health.services.storage}
          icon="📦"
          description={
            health.environment === 'production'
              ? 'Cloudflare R2'
              : 'MinIO (local development)'
          }
        />
        <ServiceStatusCard
          name="Email"
          service={health.services.email}
          icon="📧"
          description={
            health.environment === 'production'
              ? 'Resend API'
              : 'Console (development mode)'
          }
        />
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Dashboard auto-refreshes every 30 seconds</p>
      </div>
    </div>
  )
}

interface ServiceStatusCardProps {
  name: string
  service: {
    status: 'ok' | 'degraded' | 'down'
    responseTime?: number
    lastChecked: string
    error?: string
  }
  icon: string
  description: string
}

function ServiceStatusCard({ name, service, icon, description }: ServiceStatusCardProps) {
  const statusColor = {
    ok: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  }[service.status]

  const statusText = {
    ok: 'Operational',
    degraded: 'Degraded',
    down: 'Down',
  }[service.status]

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium">{statusText}</span>
        </div>

        {service.responseTime !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Response Time:</span>
            <span className="font-medium">{service.responseTime}ms</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Checked:</span>
          <span className="font-medium">
            {new Date(service.lastChecked).toLocaleTimeString()}
          </span>
        </div>

        {service.error && (
          <div className="mt-3 bg-red-50 border border-red-200 p-2 rounded">
            <p className="text-xs text-red-800">
              <strong>Error:</strong> {service.error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
