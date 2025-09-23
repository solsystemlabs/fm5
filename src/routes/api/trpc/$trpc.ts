import { json } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'

// For now, create a simple API endpoint that can be enhanced later
// This is a placeholder until the full tRPC setup is working

export const Route = createFileRoute('/api/trpc/$trpc')({
  beforeLoad: () => {
    throw new Response('tRPC endpoint not yet implemented', { status: 501 })
  },
})