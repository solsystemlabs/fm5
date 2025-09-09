import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Mock environment variables for tests (only in Node.js environment)
beforeAll(() => {
  if (typeof process !== 'undefined' && process.env) {
    vi.stubEnv(
      'DATABASE_URL',
      'postgresql://test_user:test_pass@localhost:5432/test_db',
    )
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('APP_URL', 'http://localhost:3000')
  }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
