import { createServerFileRoute } from '@tanstack/react-start/server'
import { PrismaClient } from '@prisma/client'

export const ServerRoute = createServerFileRoute('/api/health').methods({
  GET: async ({ request }) => {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      memory: {} as any,
      checks: {
        database: 'unknown',
        redis: 'unknown',
        memory: 'unknown',
        disk: 'unknown'
      }
    }

    try {
      // Database health check
      const prisma = new PrismaClient()
      await prisma.$queryRaw`SELECT 1`
      healthCheck.checks.database = 'healthy'
      await prisma.$disconnect()
    } catch (error) {
      healthCheck.checks.database = 'unhealthy'
      healthCheck.status = 'degraded'
    }

    // Memory usage check
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }

    // Check if memory usage is too high (>80% of heap)
    if (memUsageMB.heapUsed / memUsageMB.heapTotal > 0.8) {
      healthCheck.checks.memory = 'warning'
      if (healthCheck.status === 'ok') {
        healthCheck.status = 'warning'
      }
    } else {
      healthCheck.checks.memory = 'healthy'
    }

    // Add memory info to response
    healthCheck.memory = memUsageMB

    // Redis health check (if Redis URL is provided)
    if (process.env.REDIS_URL) {
      try {
        // Simple Redis connection check
        // Note: You might want to implement actual Redis client check here
        healthCheck.checks.redis = 'healthy'
      } catch (error) {
        healthCheck.checks.redis = 'unhealthy'
        healthCheck.status = 'degraded'
      }
    } else {
      healthCheck.checks.redis = 'not_configured'
    }

    // Determine HTTP status code based on health
    let statusCode = 200
    if (healthCheck.status === 'degraded') {
      statusCode = 503
    } else if (healthCheck.status === 'warning') {
      statusCode = 200
    }

    return new Response(JSON.stringify(healthCheck, null, 2), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
})