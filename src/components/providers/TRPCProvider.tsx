import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api, createTRPCClient } from '../../../lib/api'

interface TRPCProviderProps {
  children: React.ReactNode
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  // Create stable instances using useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimize for better UX with suspense
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Enhanced error boundary integration
            throwOnError: (error: any) => {
              // Let error boundaries handle server errors
              return error?.data?.httpStatus >= 500
            },
          },
          mutations: {
            // Enhanced error handling for mutations
            throwOnError: (error: any) => {
              // Let error boundaries handle unexpected errors
              return error?.data?.httpStatus >= 500
            },
          },
        },
      }),
  )

  const [trpcClient] = useState(() => createTRPCClient())

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  )
}
