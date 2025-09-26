import { PrismaClient } from '@prisma/client/edge'

// Global variable to store the Prisma instance in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Use DATABASE_URL from environment (Prisma standard)
  // This will be:
  // - Local PostgreSQL for development
  // - Xata PostgreSQL URL for staging/production
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required',
    )
  }

  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development'

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: appEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
