import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { reactStartCookies } from 'better-auth/react-start'
import { jwt } from 'better-auth/plugins'
import { prisma } from './db'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Will enable this later
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
      jwks: {
        keyPairConfig: {
          alg: 'RS256',
        },
      },
    }),
    reactStartCookies(), // Must be last plugin for TanStack Start
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
