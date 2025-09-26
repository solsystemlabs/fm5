// Test-specific BetterAuth configuration
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { reactStartCookies } from 'better-auth/react-start'
import { jwt } from 'better-auth/plugins'
import { testPrisma } from './test-db'

export const testAuth = betterAuth({
  database: prismaAdapter(testPrisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'owner',
      },
      businessName: {
        type: 'string',
        required: false,
      },
      businessDescription: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    jwt({
      jwks: process.env.BETTER_AUTH_JWT_JWKS,
    }),
    reactStartCookies(),
  ],
  secret: process.env.BETTER_AUTH_SECRET || 'test-secret',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
})