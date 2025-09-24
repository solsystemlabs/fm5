import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { auth } from './auth'
import { prisma } from './db'
import type { User } from './auth'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

// Create context for tRPC
export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts

  // Get user from BetterAuth session
  const getUser = async (): Promise<User | null> => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      })
      return session?.user ?? null
    } catch (error) {
      // Session validation failed or no session
      return null
    }
  }

  const user = await getUser()

  return {
    db: prisma,
    user,
    req,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
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
      message:
        'Authentication required. Please sign in to access this resource.',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript now knows this is not null
    },
  })
})

// Role-based authorization middleware
const requireRole = (allowedRoles: Array<'owner' | 'operator' | 'viewer'>) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      })
    }

    // @ts-ignore - User type might not have role yet, will be fixed after schema migration
    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      })
    }

    return next({ ctx })
  })

// Protected procedures with different permission levels
export const protectedProcedure = t.procedure.use(requireAuth)
export const ownerOnlyProcedure = t.procedure
  .use(requireAuth)
  .use(requireRole(['owner']))
export const operatorProcedure = t.procedure
  .use(requireAuth)
  .use(requireRole(['owner', 'operator']))
export const viewerProcedure = t.procedure
  .use(requireAuth)
  .use(requireRole(['owner', 'operator', 'viewer']))
