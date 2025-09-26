# FM5 Infrastructure Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the complete FM5 infrastructure for deployment to Cloudflare Workers with Xata database integration.

## Prerequisites

✅ **Already Completed:**

- Cloudflare account with Workers access
- Xata account for database hosting
- GitHub repository access

## Current Status

✅ **Wrangler Setup Complete:**

- Wrangler CLI installed and authenticated (v4.40.0)
- Account verified: me@tayloreernisse.com's Account (ef911de9808d5b042132327b8fb884f1)
- R2 buckets created: `fm5-staging-files`, `fm5-production-files`
- Basic secrets configured for testing

✅ **Configuration Files Updated:**

- `vite.config.ts`: Added Cloudflare target configuration
- `wrangler.toml`: Added assets directory and environment configurations

❗ **Current Issue:** Prisma compatibility with Cloudflare Workers needs resolution

## Step-by-Step Setup Instructions

### 1. Generate Secure Secrets

Generate random 32-character strings for JWT/Auth secrets:

```bash
# Generate 4 different secrets for staging/production JWT and BetterAuth:
node -e "console.log('STAGING_JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('STAGING_BETTER_AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('PRODUCTION_JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('PRODUCTION_BETTER_AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Xata Database Setup

**Create your databases:**

1. Go to: https://app.xata.io
2. Create new database: `fm5-staging`
3. Create new database: `fm5-production`
4. Get API keys from: https://app.xata.io/settings
5. Copy database URLs from each database settings page

**Required Xata Information:**

- `STAGING_XATA_API_KEY`: Your staging Xata API key
- `STAGING_XATA_DATABASE_URL`: Your staging Xata database URL
- `PRODUCTION_XATA_API_KEY`: Your production Xata API key
- `PRODUCTION_XATA_DATABASE_URL`: Your production Xata database URL

### 3. Resend Email Service

**Get Resend API key:**

1. Go to: https://resend.com/api-keys
2. Create new API key for FM5 project
3. Copy the API key (starts with re\_...)

### 4. GitHub Repository Secrets

**Add these secrets to your GitHub repo** (`Settings` → `Secrets and variables` → `Actions`):

```bash
# Global
CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>

# Staging Environment
STAGING_JWT_SECRET=<generated-32-char-string>
STAGING_BETTER_AUTH_SECRET=<generated-32-char-string>
STAGING_XATA_API_KEY=<your-staging-xata-api-key>
STAGING_XATA_DATABASE_URL=<your-staging-xata-database-url>
STAGING_RESEND_API_KEY=<your-resend-api-key>

# Production Environment
PRODUCTION_JWT_SECRET=<generated-32-char-string>
PRODUCTION_BETTER_AUTH_SECRET=<generated-32-char-string>
PRODUCTION_XATA_API_KEY=<your-production-xata-api-key>
PRODUCTION_XATA_DATABASE_URL=<your-production-xata-database-url>
PRODUCTION_RESEND_API_KEY=<your-resend-api-key>
```

### 5. Wrangler Secrets Configuration

**Configure staging secrets:**

```bash
wrangler secret put JWT_SECRET --env staging
# Enter your STAGING_JWT_SECRET when prompted

wrangler secret put BETTER_AUTH_SECRET --env staging
# Enter your STAGING_BETTER_AUTH_SECRET when prompted

wrangler secret put XATA_API_KEY --env staging
# Enter your STAGING_XATA_API_KEY when prompted

wrangler secret put XATA_DATABASE_URL --env staging
# Enter your STAGING_XATA_DATABASE_URL when prompted

wrangler secret put RESEND_API_KEY --env staging
# Enter your STAGING_RESEND_API_KEY when prompted
```

**Configure production secrets:**

```bash
wrangler secret put JWT_SECRET --env production
wrangler secret put BETTER_AUTH_SECRET --env production
wrangler secret put XATA_API_KEY --env production
wrangler secret put XATA_DATABASE_URL --env production
wrangler secret put RESEND_API_KEY --env production
```

### 6. Configuration Files Status

**✅ vite.config.ts** - Updated with Cloudflare target:

```typescript
tanstackStart({
  target: 'cloudflare-module', // Key configuration for Cloudflare compatibility
  customViteReactPlugin: true,
}),
```

**✅ wrangler.toml** - Updated with assets and environments:

```toml
name = "fm5"
main = ".output/server/index.mjs"
compatibility_date = "2025-09-24"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".output/public"

# Staging environment configuration
[env.staging]
name = "fm5-staging"
vars = { NODE_ENV = "staging", APP_ENV = "staging" }

[[env.staging.r2_buckets]]
binding = "FILE_STORAGE"
bucket_name = "fm5-staging-files"

# Production environment configuration
[env.production]
name = "fm5-production"
vars = { NODE_ENV = "production", APP_ENV = "production" }

[[env.production.r2_buckets]]
binding = "FILE_STORAGE"
bucket_name = "fm5-production-files"
```

## ✅ Issues Resolved

### ✅ Prisma + Cloudflare Workers Compatibility - RESOLVED

**Issue:** The build process failed when trying to use Prisma with Cloudflare Workers due to WASM module loading.

**Solution Applied:**

1. **Updated Prisma imports** to use edge-compatible client:
   - Changed from `import { PrismaClient } from '@prisma/client'`
   - To `import { PrismaClient } from '@prisma/client/edge'`
   - Updated in `lib/db.ts` and `lib/db-xata.ts`

2. **Fixed React Development Mode Issue:**
   - Removed `NODE_ENV=development` from `.env` file
   - This was causing development React transforms to be bundled in production
   - Error was `Dr.jsxDEV is not a function` during server-side rendering

**Status:** ✅ **RESOLVED** - Application successfully deploys and runs on Cloudflare Workers

## Deployment Commands

```bash
# Build for Cloudflare Workers
npm run build

# Deploy to staging
wrangler deploy --env staging

# Deploy to production (after staging testing)
wrangler deploy --env production
```

## Testing Deployment

**✅ Live Deployment URLs:**

- **Staging:** `https://fm5-staging.me-ef9.workers.dev/` ✅ **WORKING**
- **Production:** `https://fm5-production.me-ef9.workers.dev/` (ready for deployment)

## Monitoring and Logs

```bash
# Stream logs from staging
wrangler tail --env staging

# Stream logs from production
wrangler tail --env production

# List deployments
wrangler deployments list --name fm5-staging
wrangler deployments list --name fm5-production
```

## Rollback Procedures

```bash
# List recent deployments
wrangler deployments list --name fm5-production

# Rollback to previous deployment
wrangler rollback --name fm5-production

# Rollback to specific deployment
wrangler rollback --name fm5-production [DEPLOYMENT_ID]
```

## Summary

**✅ Infrastructure Ready:**

- Cloudflare Workers configured
- Wrangler CLI working
- R2 buckets created
- Environment configurations set
- GitHub Actions workflow ready

**🔧 Next Action Required:**
Resolve Prisma compatibility issue with Cloudflare Workers to complete the deployment pipeline.

## Secret Management

The project now uses automated secret management with environment-specific files:

- `.env` - Local development (committed)
- `.env.staging` - Staging secrets (committed)
- `.env.production` - Production secrets (committed)

**Automated Secret Management:**

```bash
# Push secrets to environments
npm run secrets:push:staging
npm run secrets:push:production

# List current secrets
npm run secrets:list:staging
npm run secrets:list:production

# Complete deployment with secrets
npm run deploy:staging
npm run deploy:production
```

See `docs/secrets-management.md` for complete documentation.

**📋 Files Created/Modified:**

- `vite.config.ts` - Added Cloudflare target
- `wrangler.toml` - Updated with assets and environments
- `scripts/manage-secrets.sh` - Automated secret management
- `.env.staging` - Staging environment secrets
- `.env.production` - Production environment secrets
- `docs/secrets-management.md` - Secret management documentation
- `INFRASTRUCTURE_SETUP.md` - This documentation

---

_Last Updated: 2025-09-25_
_Author: James (Dev Agent)_
