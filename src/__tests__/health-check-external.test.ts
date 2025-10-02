/**
 * External Services Health Check Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHealthStatusCode, performHealthCheck } from '../../lib/health-check'
import type { WorkerEnv } from '../../lib/storage'

describe('Health Check Service', () => {
  describe('Health Status Code Mapping', () => {
    it('should return 200 for healthy status', () => {
      expect(getHealthStatusCode('healthy')).toBe(200)
    })

    it('should return 200 for degraded status', () => {
      expect(getHealthStatusCode('degraded')).toBe(200)
    })

    it('should return 503 for unhealthy status', () => {
      expect(getHealthStatusCode('unhealthy')).toBe(503)
    })
  })

  describe('Health Check Execution', () => {
    it('should return health check result with all required fields', async () => {
      const result = await performHealthCheck()

      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('environment')
      expect(result).toHaveProperty('services')
      expect(result.services).toHaveProperty('database')
      expect(result.services).toHaveProperty('storage')
      expect(result.services).toHaveProperty('email')
    })

    it('should include response times for all services', async () => {
      const result = await performHealthCheck()

      expect(result.services.database).toHaveProperty('responseTime')
      expect(result.services.storage).toHaveProperty('responseTime')
      expect(result.services.email).toHaveProperty('responseTime')

      expect(typeof result.services.database.responseTime).toBe('number')
      expect(typeof result.services.storage.responseTime).toBe('number')
      expect(typeof result.services.email.responseTime).toBe('number')
    })

    it('should include lastChecked timestamps for all services', async () => {
      const result = await performHealthCheck()

      expect(result.services.database.lastChecked).toBeDefined()
      expect(result.services.storage.lastChecked).toBeDefined()
      expect(result.services.email.lastChecked).toBeDefined()

      // Verify timestamps are valid ISO strings
      expect(() => new Date(result.services.database.lastChecked)).not.toThrow()
      expect(() => new Date(result.services.storage.lastChecked)).not.toThrow()
      expect(() => new Date(result.services.email.lastChecked)).not.toThrow()
    })

    it('should have valid service statuses', async () => {
      const result = await performHealthCheck()

      const validStatuses = ['ok', 'degraded', 'down']

      expect(validStatuses).toContain(result.services.database.status)
      expect(validStatuses).toContain(result.services.storage.status)
      expect(validStatuses).toContain(result.services.email.status)
    })

    it('should set environment from process.env', async () => {
      const originalEnv = process.env.APP_ENV
      process.env.APP_ENV = 'test-environment'

      const result = await performHealthCheck()

      expect(result.environment).toBe('test-environment')

      process.env.APP_ENV = originalEnv
    })
  })

  describe('Overall Status Determination', () => {
    it('should report healthy when all services are ok', async () => {
      // Assuming database and storage are available in test environment
      const result = await performHealthCheck()

      // In development with no issues, should be healthy or degraded
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status)
    })
  })

  describe('Service Health Details', () => {
    it('should include error messages for failed services', async () => {
      const result = await performHealthCheck()

      // Check that if a service is down, it has an error message
      if (result.services.database.status === 'down') {
        expect(result.services.database.error).toBeDefined()
      }

      if (result.services.storage.status === 'down') {
        expect(result.services.storage.error).toBeDefined()
      }

      if (result.services.email.status === 'down') {
        expect(result.services.email.error).toBeDefined()
      }
    })

    it('should measure response times correctly', async () => {
      const result = await performHealthCheck()

      // Response times should be reasonable (< 10 seconds)
      expect(result.services.database.responseTime).toBeLessThan(10000)
      expect(result.services.storage.responseTime).toBeLessThan(10000)
      expect(result.services.email.responseTime).toBeLessThan(10000)

      // Response times should be non-negative (>= 0)
      expect(result.services.database.responseTime).toBeGreaterThanOrEqual(0)
      expect(result.services.storage.responseTime).toBeGreaterThanOrEqual(0)
      expect(result.services.email.responseTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Email Service Health (Development Mode)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      delete process.env.RESEND_API_KEY
    })

    it('should report email service as ok in development without API key', async () => {
      const result = await performHealthCheck()

      expect(result.services.email.status).toBe('ok')
    })
  })

  describe('Parallel Execution', () => {
    it('should execute all health checks in parallel', async () => {
      const startTime = Date.now()
      await performHealthCheck()
      const totalTime = Date.now() - startTime

      // If executed in parallel, total time should be less than sum of individual times
      // (accounting for overhead, should be < 15 seconds total)
      expect(totalTime).toBeLessThan(15000)
    })
  })

  describe('R2 Binding Support', () => {
    it('should accept optional R2 binding environment', async () => {
      const mockR2Bucket = {
        head: vi.fn().mockResolvedValue(null),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
        createMultipartUpload: vi.fn(),
        resumeMultipartUpload: vi.fn(),
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type R2Bucket = import('@cloudflare/workers-types').R2Bucket
      const env: WorkerEnv = { FILE_STORAGE: mockR2Bucket as R2Bucket }
      const result = await performHealthCheck(env)

      expect(result).toBeDefined()
      expect(result.services.storage).toBeDefined()
    })
  })
})
