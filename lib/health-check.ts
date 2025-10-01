/**
 * Health Check Service
 *
 * Monitors health of all external services using proper health check mechanisms:
 * - Database (Prisma): SELECT 1 query
 * - Storage (MinIO): /minio/health/live endpoint
 * - Storage (R2): HeadBucket S3 API call
 * - Email (Resend): GET /domains API endpoint
 */

import { db } from './db'

export type ServiceStatus = 'ok' | 'degraded' | 'down'

export interface ServiceHealth {
  status: ServiceStatus
  responseTime?: number
  lastChecked: string
  error?: string
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  environment: string
  services: {
    database: ServiceHealth
    storage: ServiceHealth
    email: ServiceHealth
  }
}

/**
 * Checks database connectivity using Prisma's recommended method
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    // Prisma recommended: lightweight SELECT 1 query
    await db.$queryRaw`SELECT 1`

    return {
      status: 'ok',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message,
    }
  }
}

/**
 * Checks MinIO storage service using health check endpoint
 */
async function checkMinIO(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    const minioUrl = process.env.MINIO_ENDPOINT || 'http://localhost:9000'

    // MinIO built-in health endpoint (no auth required)
    const response = await fetch(`${minioUrl}/minio/health/live`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (response.ok) {
      return {
        status: 'ok',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      }
    } else {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message,
    }
  }
}

/**
 * Checks R2 storage service using S3 HeadBucket API
 */
async function checkR2(env?: { FILE_STORAGE?: R2Bucket }): Promise<ServiceHealth> {
  const startTime = Date.now()

  // In Cloudflare Workers, we can use the R2 binding directly
  if (env?.FILE_STORAGE) {
    try {
      // Use head() to check bucket connectivity without uploading
      await env.FILE_STORAGE.head('health-check-probe')

      return {
        status: 'ok',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      }
    } catch (error: any) {
      // NotFound is ok - means bucket is accessible
      if (error.message?.includes('NotFound') || error.code === 10039) {
        return {
          status: 'ok',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
        }
      }

      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error.message,
      }
    }
  }

  // For local dev without R2 binding, check MinIO instead
  return checkMinIO()
}

/**
 * Checks email service using Resend API
 */
async function checkResend(): Promise<ServiceHealth> {
  const startTime = Date.now()
  const apiKey = process.env.RESEND_API_KEY
  const isDevelopment = process.env.NODE_ENV === 'development'

  // In development, console adapter always works
  if (isDevelopment && !apiKey) {
    return {
      status: 'ok',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    }
  }

  // If no API key in non-dev environment, it's degraded
  if (!apiKey) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: 'No API key configured',
    }
  }

  try {
    // Check Resend API connectivity using /domains endpoint
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (response.ok) {
      return {
        status: 'ok',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: 'Invalid API key or unauthorized',
      }
    } else {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message,
    }
  }
}

/**
 * Determines overall system health based on service statuses
 */
function determineOverallStatus(services: {
  database: ServiceHealth
  storage: ServiceHealth
  email: ServiceHealth
}): 'healthy' | 'degraded' | 'unhealthy' {
  // If any critical service (database, storage) is down, system is unhealthy
  if (services.database.status === 'down' || services.storage.status === 'down') {
    return 'unhealthy'
  }

  // If email is down (non-critical), system is degraded
  if (services.email.status === 'down') {
    return 'degraded'
  }

  // If any service is degraded, system is degraded
  if (
    services.database.status === 'degraded' ||
    services.storage.status === 'degraded' ||
    services.email.status === 'degraded'
  ) {
    return 'degraded'
  }

  return 'healthy'
}

/**
 * Performs a complete health check of all services
 */
export async function performHealthCheck(env?: { FILE_STORAGE?: R2Bucket }): Promise<HealthCheckResult> {
  const [database, storage, email] = await Promise.all([
    checkDatabase(),
    checkR2(env),
    checkResend(),
  ])

  const services = { database, storage, email }
  const status = determineOverallStatus(services)

  return {
    status,
    timestamp: new Date().toISOString(),
    environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    services,
  }
}

/**
 * Returns HTTP status code based on health status
 */
export function getHealthStatusCode(status: 'healthy' | 'degraded' | 'unhealthy'): number {
  switch (status) {
    case 'healthy':
      return 200
    case 'degraded':
      return 200 // Still operational, but with issues
    case 'unhealthy':
      return 503 // Service unavailable
  }
}
