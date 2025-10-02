# FM5 Deployment Guide

## Overview

This guide covers the complete deployment process for the FM5 application to Cloudflare Workers with Xata PostgreSQL database and Cloudflare R2 storage.

## Prerequisites

Before deploying, ensure you have:

- [ ] Cloudflare account with Workers enabled
- [ ] Xata account with staging and production databases configured
- [ ] GitHub repository with Actions enabled
- [ ] Node.js 20+ installed locally
- [ ] Wrangler CLI installed globally: `npm install -g wrangler`
- [ ] Repository secrets configured in GitHub

## Required GitHub Secrets

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

### Common Secrets

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers write permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Staging Environment

- `JWT_SECRET` - JWT signing secret for staging
- `BETTER_AUTH_SECRET` - BetterAuth secret for staging
- `DATABASE_URL` - Xata database URL for `fm5:staging` branch
- `SHADOW_DATABASE_URL` - Xata shadow database URL for `fm5:staging_shadow`
- `RESEND_API_KEY` - Resend API key for staging emails

### Production Environment

- `PRODUCTION_JWT_SECRET` - JWT signing secret for production
- `PRODUCTION_BETTER_AUTH_SECRET` - BetterAuth secret for production
- `PRODUCTION_XATA_DATABASE_URL` - Xata database URL for `fm5:main` branch
- `PRODUCTION_XATA_SHADOW_DATABASE_URL` - Xata shadow database for `fm5:main_shadow`
- `PRODUCTION_RESEND_API_KEY` - Resend API key for production emails

### Test Environment

- `XATA_TEST_DATABASE_URL` - Xata database URL for running CI tests

## Deployment Workflows

### PR Quality Checks (Automatic)

**Trigger**: Opening or updating a pull request to `master`

**What it does**:

- Runs ESLint, TypeScript checking, Prettier formatting validation
- Executes unit and integration tests
- Runs security audit
- **All checks run in parallel** for fast feedback

**Required for**: All PRs must pass these checks before merging

**Workflow file**: `.github/workflows/pr-checks.yml`

### Staging Deployment (Automatic)

**Trigger**: Merging pull request to `master` branch

**What it does**:

1. Builds production bundle
2. Deploys to Cloudflare Workers staging environment (`fm5-staging`)
3. Runs health check against staging endpoint
4. Reports deployment success/failure

**URL**: https://fm5-staging.solsystemlabs.com

**Workflow file**: `.github/workflows/deploy-staging.yml`

### Production Deployment (Manual)

**Trigger**: Manual workflow dispatch with confirmation

**What it does**:

1. Requires typing "DEPLOY" to confirm
2. Builds production bundle
3. Deploys to Cloudflare Workers production environment (`fm5-production`)
4. Runs health check against production endpoint
5. Creates deployment tag for rollback reference

**URL**: https://fm5.solsystemlabs.com

**Workflow file**: `.github/workflows/deploy-production.yml`

**How to deploy**:

1. Go to Actions → "Deploy to Production"
2. Click "Run workflow"
3. Type "DEPLOY" in the confirmation field
4. Click "Run workflow" button

## Local Deployment Testing

### Build and Test Locally

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run linting
npm run lint

# Build production bundle
npm run build

# Test build output
npm run start
```

### Deploy to Staging from Local Machine

```bash
# Login to Wrangler (first time only)
wrangler login

# Deploy to staging
npm run deploy:staging

# Check deployment
curl https://fm5-staging.solsystemlabs.com/health
```

### Deploy to Production from Local Machine

```bash
# Deploy to production
npm run deploy:production

# Check deployment
curl https://fm5.solsystemlabs.com/health
```

## Environment Configuration

### Wrangler Configuration

The `wrangler.toml` file defines three environments:

**Development** (local):

- Name: `fm5`
- Used for local development testing with Wrangler

**Staging**:

- Name: `fm5-staging`
- R2 Bucket: `fm5-staging-files`
- Auto-deployed on merge to master

**Production**:

- Name: `fm5-production`
- R2 Bucket: `fm5-production-files`
- Manually deployed via GitHub Actions

### Managing Secrets

Use the secrets management script to set Wrangler secrets:

```bash
# Push all secrets to staging
npm run secrets:push:staging

# Push all secrets to production
npm run secrets:push:production

# List secrets in staging
npm run secrets:list:staging

# List secrets in production
npm run secrets:list:production

# Push individual secret
echo "your-secret-value" | wrangler secret put JWT_SECRET --env staging
```

## Database Migrations

### Staging Database

```bash
# Connect to staging database
DATABASE_URL="<your-xata-staging-url>" npx prisma migrate deploy

# Verify migration
DATABASE_URL="<your-xata-staging-url>" npx prisma db pull
```

### Production Database

```bash
# IMPORTANT: Always test migrations in staging first!

# Connect to production database
DATABASE_URL="<your-xata-production-url>" npx prisma migrate deploy

# Verify migration
DATABASE_URL="<your-xata-production-url>" npx prisma db pull
```

### Migration Best Practices

1. **Always test in staging first**
2. **Never** run breaking migrations without coordination
3. Use shadow database for migration testing
4. Backup database before major migrations
5. Test rollback procedures in staging

## Health Checks and Monitoring

### Health Check Endpoint

The `/health` endpoint reports status of all services:

```bash
# Check staging health
curl https://fm5-staging.solsystemlabs.com/health | jq

# Check production health
curl https://fm5.solsystemlabs.com/health | jq
```

**Expected response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T12:00:00.000Z",
  "environment": "production",
  "services": {
    "database": {
      "status": "ok",
      "responseTime": 45,
      "lastChecked": "2025-10-02T12:00:00.000Z"
    },
    "storage": {
      "status": "ok",
      "responseTime": 23,
      "lastChecked": "2025-10-02T12:00:00.000Z"
    },
    "email": {
      "status": "ok",
      "responseTime": 89,
      "lastChecked": "2025-10-02T12:00:00.000Z"
    }
  }
}
```

### Monitoring Dashboards

**Cloudflare Analytics**:

- Access: https://dash.cloudflare.com → Workers → fm5-production
- Metrics: Request count, error rate, CPU time, invocations

**Xata Dashboard**:

- Access: https://app.xata.io
- Metrics: Query performance, connection count, storage usage

**GitHub Actions**:

- Access: Repository → Actions
- Metrics: Build times, test results, deployment history

### Real-Time Logs

```bash
# Watch production logs
wrangler tail --name fm5-production

# Watch staging logs
wrangler tail --name fm5-staging

# Filter logs by status code
wrangler tail --name fm5-production --status error

# Output as JSON for processing
wrangler tail --name fm5-production --format json
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] PR approved and merged to master
- [ ] Staging deployment successful
- [ ] Health checks passing in staging
- [ ] Manual testing completed in staging
- [ ] Database migrations tested in staging
- [ ] No active incidents or outages

### During Deployment

- [ ] Initiate production deployment workflow
- [ ] Monitor deployment progress in GitHub Actions
- [ ] Watch for any error messages
- [ ] Verify health check passes

### Post-Deployment

- [ ] Health check returns 200 OK
- [ ] All services report "ok" status
- [ ] Manual smoke tests pass
- [ ] Monitor error rates for 15 minutes
- [ ] Check Cloudflare Analytics for anomalies
- [ ] Verify key user flows work correctly

## Troubleshooting

### Deployment Fails to Build

**Symptoms**: GitHub Actions build step fails

**Solutions**:

1. Check build logs in Actions tab
2. Run `npm run build` locally to reproduce
3. Fix TypeScript errors or dependency issues
4. Commit fix and retry

### Deployment Succeeds but Health Check Fails

**Symptoms**: Health check returns 503 or times out

**Solutions**:

1. Check which service is failing:
   ```bash
   curl https://fm5-production.solsystemlabs.com/health
   ```
2. Common issues:
   - Database: Verify `DATABASE_URL` secret is set
   - Storage: Check R2 bucket exists and Worker has binding
   - Email: Verify `RESEND_API_KEY` is valid
3. Check Worker logs:
   ```bash
   wrangler tail --name fm5-production
   ```

### Environment Variables Not Set

**Symptoms**: Authentication errors, "undefined" in logs

**Solutions**:

1. List current secrets:
   ```bash
   wrangler secret list --name fm5-production
   ```
2. Push missing secrets:
   ```bash
   npm run secrets:push:production
   ```
3. Verify in logs that secrets are accessible

### Database Connection Issues

**Symptoms**: "Connection refused" or timeout errors

**Solutions**:

1. Verify Xata database URL is correct
2. Check Xata database status in dashboard
3. Test connection from local environment:
   ```bash
   DATABASE_URL="<your-url>" npx prisma db pull
   ```
4. Ensure IP allowlist includes Cloudflare Workers (if applicable)

## Rollback Procedures

If a deployment causes issues, follow the rollback procedures documented in:

**[Rollback Procedures Documentation](./rollback-procedures.md)**

Quick rollback command:

```bash
# List recent deployments
wrangler deployments list --name fm5-production

# Rollback to previous deployment
wrangler rollback --name fm5-production [DEPLOYMENT_ID]
```

## Additional Resources

- [Wrangler Configuration](../../wrangler.toml)
- [GitHub Actions Workflows](../../.github/workflows/)
- [Environment Variables Example](../../.env.example)
- [Rollback Procedures](./rollback-procedures.md)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Xata Documentation](https://xata.io/docs)
