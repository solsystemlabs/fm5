import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from './routers/_app'
import superjson from 'superjson'

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
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
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
    // Enhanced query client defaults for optimal caching
    defaultOptions: {
      queries: {
        // Optimize stale time for better UX
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Enable background refetch
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Add retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry for authentication errors
          if (error?.data?.code === 'UNAUTHORIZED') return false
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        // Configure retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Add retry for mutations
        retry: (failureCount, error: any) => {
          // Don't retry authentication errors or validation errors
          if (error?.data?.code === 'UNAUTHORIZED' || error?.data?.code === 'BAD_REQUEST') {
            return false
          }
          return failureCount < 2
        },
      },
    },
  })
}