import { PrismaClient } from '@prisma/client'

/**
 * Xata-compatible database configuration for production environments
 * Uses HTTP-based connection suitable for Cloudflare Workers
 */

declare global {
  var prismaXata: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.XATA_DATABASE_URL || process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      'XATA_DATABASE_URL or DATABASE_URL environment variable is required',
    )
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prismaXata = globalThis.prismaXata ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaXata = prismaXata
}
