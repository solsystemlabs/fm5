import { createServerFileRoute } from '@tanstack/react-start/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/router';
import { createTRPCContext } from '@/lib/trpc/init';

export const ServerRoute = createServerFileRoute('/api/trpc/$').methods({
  GET: async ({ request }) => {
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: createTRPCContext,
    });
  },
  
  POST: async ({ request }) => {
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: createTRPCContext,
    });
  },
});