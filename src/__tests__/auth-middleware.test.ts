import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TRPCError } from '@trpc/server'
import { createTRPCContext } from '~/lib/trpc'
import { appRouter } from '~/lib/routers/_app'
import { prisma } from '~/lib/db'

// Mock request helper
const createMockRequest = (headers: Record<string, string> = {}) => {
  const mockHeaders = new Headers(headers)
  return new Request('http://localhost:3000/api/trpc', {
    method: 'GET',
    headers: mockHeaders,
  })
}

describe('tRPC Authentication Middleware', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Context Creation', () => {
    it('should create context with null user for unauthenticated request', async () => {
      const mockRequest = createMockRequest()

      const context = await createTRPCContext({
        req: mockRequest,
        resHeaders: new Headers(),
        info: {} as any,
      })

      expect(context.user).toBeNull()
      expect(context.db).toBeDefined()
      expect(context.req).toBeDefined()
    })
  })

  describe('Protected Procedures', () => {
    it('should reject unauthenticated user from protected procedures', async () => {
      const mockRequest = createMockRequest()

      const context = await createTRPCContext({
        req: mockRequest,
        resHeaders: new Headers(),
        info: {} as any,
      })

      const caller = appRouter.createCaller(context)

      // Test that protected auth procedures throw error for unauthenticated user
      await expect(caller.auth.me()).rejects.toThrow(TRPCError)
      await expect(caller.auth.me()).rejects.toThrow('Authentication required')

      await expect(caller.auth.session()).rejects.toThrow(TRPCError)
      await expect(caller.auth.session()).rejects.toThrow(
        'Authentication required',
      )
    })
  })

  describe('Middleware Logic', () => {
    it('should properly validate required authentication', async () => {
      const mockRequest = createMockRequest()
      const context = await createTRPCContext({
        req: mockRequest,
        resHeaders: new Headers(),
        info: {} as any,
      })

      // Verify that context has no user
      expect(context.user).toBeNull()

      // Verify that middleware correctly rejects requests
      const caller = appRouter.createCaller(context)
      await expect(caller.auth.me()).rejects.toThrowError(
        'Authentication required',
      )
    })
  })

  describe('Database Integration', () => {
    it('should provide database context to all procedures', async () => {
      const mockRequest = createMockRequest()
      const context = await createTRPCContext({
        req: mockRequest,
        resHeaders: new Headers(),
        info: {} as any,
      })

      expect(context.db).toBeDefined()
      expect(typeof context.db.user.findUnique).toBe('function')
      expect(typeof context.db.session.findFirst).toBe('function')
    })
  })
})
