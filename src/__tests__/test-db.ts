// Test-specific database client
import { PrismaClient } from '@prisma/client'

// Environment-aware database URL selection
const getDatabaseUrl = () => {
  // Use Xata test database in CI, local Docker PostgreSQL in development
  if (process.env.CI) {
    return process.env.XATA_TEST_DATABASE_URL || process.env.DATABASE_URL
  }
  return 'postgresql://printmgmt_user:dev_password@localhost:5432/printmgmt_dev'
}

// Create a test-specific Prisma client with environment-aware database URL
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'test' ? [] : ['error'],
})

// Ensure clean state before and after tests
export async function cleanupTestData() {
  try {
    // Delete in correct order to avoid foreign key constraints
    await testPrisma.session.deleteMany()
    await testPrisma.account.deleteMany()
    await testPrisma.verification.deleteMany()
    await testPrisma.user.deleteMany()
  } catch (error) {
    console.warn('Test cleanup warning:', error)
  }
}

// Force disconnect to avoid connection issues
export async function disconnectTestDb() {
  try {
    await testPrisma.$disconnect()
  } catch (error) {
    console.warn('Test disconnect warning:', error)
  }
}
