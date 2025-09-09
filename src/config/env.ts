/**
 * Environment configuration
 * Centralizes all environment variable handling with type safety
 */

export const env = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Cloudflare
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || '',
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',

  // AWS S3
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN || '',
} as const

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isStaging = env.NODE_ENV === 'staging'

/**
 * Validates that required environment variables are set
 */
export function validateEnv() {
  const requiredVars = ['DATABASE_URL']

  const missing = requiredVars.filter(
    (varName) => !env[varName as keyof typeof env],
  )

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    )
  }
}

/**
 * Get environment-specific configuration
 */
export function getConfig() {
  return {
    app: {
      url: env.APP_URL,
      env: env.NODE_ENV,
    },
    database: {
      url: env.DATABASE_URL,
    },
    cloudflare: {
      apiToken: env.CLOUDFLARE_API_TOKEN,
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
    },
    storage: {
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      bucketName: env.S3_BUCKET_NAME,
    },
    monitoring: {
      sentryDsn: env.SENTRY_DSN,
    },
  }
}
