// Test setup file for vitest
import { afterEach, beforeAll, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Set test environment variables
beforeAll(() => {
  // Use local PostgreSQL for testing instead of Xata
  process.env.DATABASE_URL = 'postgresql://printmgmt_user:dev_password@localhost:5432/printmgmt_dev'
  process.env.NODE_ENV = 'test'
  process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret'
  process.env.BETTER_AUTH_URL = 'http://localhost:3000'
})

// Extend vitest expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
