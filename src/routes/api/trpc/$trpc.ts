import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { appRouter } from '~/lib/routers/_app'
import { createTRPCContext } from '~/lib/trpc'

export const ServerRoute = createServerFileRoute('/api/trpc/$trpc').methods({
  GET: async ({ request }) => {
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: createTRPCContext,
    })
  },
  POST: async ({ request }) => {
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: createTRPCContext,
    })
  },
})
