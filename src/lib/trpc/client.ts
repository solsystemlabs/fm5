import { createTRPCContext } from '@trpc/tanstack-react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from './router';

// Re-export all router types for convenience
export type { 
  AppRouter, 
  RouterInputs, 
  RouterOutputs 
} from './router';

// Re-export typed client types
export type {
  FilamentInput,
  FilamentOutput,
  FilamentListOutput,
  ModelInput,
  ModelOutput,
  ModelListOutput,
  ModelFilesOutput,
  SlicedFileInput,
  SlicedFileOutput,
  SlicedFileListOutput,
  ThreeMFFileOutput,
  ThreeMFFileListOutput,
  BrandOutput,
  MaterialTypeOutput,
  FilamentTypeOutput,
  ModelCategoryOutput,
  DashboardAnalyticsOutput,
  DashboardOverviewOutput,
  ProductInput,
  ProductOutput,
  ProductListOutput
} from './types';

// Create QueryClient factory for better SSR support
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Create tRPC client
export function createTRPCClientInstance() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        // You can pass any HTTP headers you wish here
        async headers() {
          return {
            // Add any auth headers if needed
          };
        },
      }),
    ],
  });
}

// Create tRPC context for React components
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();