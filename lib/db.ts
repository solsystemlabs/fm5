import { PrismaClient } from '@prisma/client/edge'

// Global variable to store the Prisma instance in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Use Xata URL in production/staging, fallback to local DATABASE_URL
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

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
