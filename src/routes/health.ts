import { createServerFileRoute } from '@tanstack/react-start/server'

export const ServerRoute = createServerFileRoute('/health').methods({
  GET: () => {
    const healthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.APP_ENV || 'development',
      services: {
        database: 'ok',
        storage: 'ok',
      },
      version: '1.0.0',
    }

    return new Response(JSON.stringify(healthResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  },
})