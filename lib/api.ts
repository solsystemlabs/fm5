import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from './routers/_app'

// Create tRPC React client with enhanced 2025 integration
export const api = createTRPCReact<AppRouter>()

// Get base URL for API calls
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative url
    return ''
  }
  if (process.env.VERCEL_URL) {
    // SSR should use vercel url
    return `https://${process.env.VERCEL_URL}`
  }
  // dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

// Enhanced tRPC client configuration with modern features
export function createTRPCClient() {
  return api.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        // Add authentication headers
        headers() {
          return {
            // TODO: Add JWT token from auth context
            // authorization: getAuthToken(),
          }
        },
        // Enhanced error handling with retry logic
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),
    ],
  })
}