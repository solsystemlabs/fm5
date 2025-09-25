import { PrismaClient } from '@prisma/client/edge'

// Global variable to store the Prisma instance in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Environment detection
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development'

  // Determine database URL based on environment
  let databaseUrl: string

  if (appEnv === 'production') {
    // Production uses main branch
    databaseUrl = process.env.DATABASE_URL || process.env.XATA_PRODUCTION_URL!
  } else if (appEnv === 'staging') {
    // Staging uses staging branch
    databaseUrl = process.env.DATABASE_URL || process.env.XATA_STAGING_URL!
  } else {
    // Development uses local PostgreSQL or development branch
    databaseUrl = process.env.DATABASE_URL || process.env.XATA_DEVELOPMENT_URL!
  }

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL or XATA_DATABASE_URL environment variable is required',
    )
  }

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
