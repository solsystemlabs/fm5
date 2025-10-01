/**
 * tRPC Client Configuration
 *
 * Exports the tRPC React Query client for use in frontend components.
 */

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../lib/routers/_app'

export const trpc = createTRPCReact<AppRouter>()
