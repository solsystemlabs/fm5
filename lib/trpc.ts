import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

// Mock database for now - will be replaced with actual db import later
const db = {} as any

// Create context for tRPC
export function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts

  // Get user from authentication (placeholder for now)
  // In production, extract JWT token and validate user
  const getUser = (): { id: string } | null => {
    // TODO: Implement JWT validation
    // const token = req.headers.get('authorization')?.replace('Bearer ', '')
    // Validate token and return user
    return null
  }

  const user = getUser()

  return {
    db,
    user,
    req,
  }
}

type Context = ReturnType<typeof createTRPCContext>

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error && error.cause.name === 'ZodError'
          ? error.cause
          : null,
      },
    }
  },
})

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Authentication middleware
const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User must be authenticated',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript now knows this is not null
    },
  })
})

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(requireAuth)