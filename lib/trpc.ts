import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'
import { db } from './db'

// Create context for tRPC
export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts

  // Get user from authentication (placeholder for now)
  // In production, extract JWT token and validate user
  const getUser = async () => {
    // TODO: Implement JWT validation
    // const token = req.headers.get('authorization')?.replace('Bearer ', '')
    // Validate token and return user
    return null
  }

  const user = await getUser()

  return {
    db,
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
      user: ctx.user,
    },
  })
})

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(requireAuth)