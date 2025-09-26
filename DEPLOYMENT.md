# FM5 Deployment Guide

## Overview

FM5 uses Cloudflare Workers for deployment with automated CI/CD through GitHub Actions. This document covers deployment procedures, rollback strategies, and troubleshooting.

## Prerequisites

- Cloudflare account with Workers access
- Xata account for database hosting
- GitHub repository with appropriate secrets configured
- Wrangler CLI installed locally (`npm install -g wrangler`)

## Environment Configuration

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

**Global Secrets:**

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers:Edit permissions

**Staging Environment:**

- `STAGING_JWT_SECRET` - JWT secret for staging
- `STAGING_BETTER_AUTH_SECRET` - BetterAuth secret for staging
- `STAGING_XATA_DATABASE_URL` - Xata PostgreSQL URL for staging branch (postgresql://...)
- `STAGING_XATA_SHADOW_DATABASE_URL` - Xata PostgreSQL URL for staging shadow database
- `STAGING_RESEND_API_KEY` - Resend API key for staging emails

**Production Environment:**

- `PRODUCTION_JWT_SECRET` - JWT secret for production
- `PRODUCTION_BETTER_AUTH_SECRET` - BetterAuth secret for production
- `PRODUCTION_XATA_DATABASE_URL` - Xata PostgreSQL URL for main branch (postgresql://...)
- `PRODUCTION_XATA_SHADOW_DATABASE_URL` - Xata PostgreSQL URL for production shadow database
- `PRODUCTION_RESEND_API_KEY` - Resend API key for production emails

### Wrangler Secrets Management

```bash
# Configure staging secrets
wrangler secret put JWT_SECRET --env staging
wrangler secret put BETTER_AUTH_SECRET --env staging
wrangler secret put DATABASE_URL --env staging
wrangler secret put SHADOW_DATABASE_URL --env staging
wrangler secret put RESEND_API_KEY --env staging

# Configure production secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put BETTER_AUTH_SECRET --env production
wrangler secret put DATABASE_URL --env production
wrangler secret put SHADOW_DATABASE_URL --env production
wrangler secret put RESEND_API_KEY --env production
```

## Deployment Process

### Automatic Staging Deployment

Staging deployment happens automatically on every push to `main` branch:

1. Code is pushed to `main` branch
2. GitHub Actions runs:
   - ESLint and Prettier checks
   - TypeScript compilation
   - Unit tests
   - Security audit
   - Application build
   - Deployment to staging Worker
   - Health check validation

### Manual Production Deployment

Production deployment requires manual approval:

1. Navigate to GitHub Actions
2. Select "Deploy to Cloudflare Workers" workflow
3. Click "Run workflow"
4. Select "production" environment
5. Confirm deployment
6. Monitor deployment progress and health checks

### Local Deployment Testing

```bash
# Build the application
npm run build

# Deploy to staging locally
wrangler deploy --env staging

# Deploy to production locally (use with caution)
wrangler deploy --env production
```

## Health Checks

Both environments include health check endpoints:

- **Staging**: `https://fm5-staging.your-subdomain.workers.dev/health`
- **Production**: `https://fm5-production.your-subdomain.workers.dev/health`

Health check response:

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-09-24T12:00:00.000Z",
  "environment": "staging|production",
  "services": {
    "database": "ok|error|unknown",
    "storage": "ok|error|n/a|unknown"
  },
  "version": "1.0.0"
}
```

## Rollback Procedures

### Quick Rollback Commands

```bash
# List recent deployments
wrangler deployments list --name fm5-production

# Rollback to previous deployment
wrangler rollback --name fm5-production

# Rollback to specific deployment
wrangler rollback --name fm5-production [DEPLOYMENT_ID]

# Emergency rollback with message
wrangler rollback --name fm5-production --message "Emergency rollback - issue description"
```

### Rollback Process

1. **Identify Issue**: Monitor health checks and error logs
2. **Quick Assessment**: Determine if rollback is needed
3. **Execute Rollback**: Use appropriate wrangler command
4. **Verify Health**: Check health endpoints after rollback
5. **Investigate**: Analyze logs to determine root cause
6. **Fix and Redeploy**: Address issue and redeploy when ready

### Rollback Testing

Regularly test rollback procedures in staging:

```bash
# Deploy a test version to staging
wrangler deploy --env staging

# Immediately rollback to test procedure
wrangler rollback --name fm5-staging
```

## Monitoring and Logging

### Cloudflare Analytics

- Request metrics and error rates available in Cloudflare dashboard
- Custom analytics can be configured for specific events

### Real-time Logging

```bash
# Stream logs from staging
wrangler tail --env staging

# Stream logs from production
wrangler tail --env production

# Filter logs by specific patterns
wrangler tail --env production --grep "ERROR"
```

### Log Analysis

Key metrics to monitor:

- Health check response times
- Database connection errors
- Authentication failures
- R2 storage errors
- Memory and CPU usage

## Troubleshooting

### Common Issues

**Deployment Fails**

```bash
# Check wrangler configuration
wrangler whoami
wrangler config list

# Verify secrets are configured
wrangler secret list --env production
```

**Health Checks Failing**

```bash
# Test database connectivity
curl https://fm5-production.your-subdomain.workers.dev/health

# Check specific service logs
wrangler tail --env production --grep "Database health check"
```

**Environment Variables Missing**

```bash
# List configured secrets
wrangler secret list --env production

# Update specific secret
wrangler secret put XATA_API_KEY --env production
```

### Recovery Procedures

1. **Database Connection Issues**
   - Verify Xata API key and URL
   - Check Xata service status
   - Test connection from local environment

2. **R2 Storage Issues**
   - Verify bucket exists and permissions
   - Check R2 service status
   - Test file upload/download operations

3. **Authentication Problems**
   - Verify BetterAuth secrets
   - Check JWT configuration
   - Test login/logout flows

4. **DNS/Domain Issues**
   - Verify custom domain configuration
   - Check Cloudflare DNS settings
   - Test domain resolution

## Database Migration

When deploying with schema changes:

1. **Staging Migration**

   ```bash
   # Apply migrations to staging Xata database
   npx prisma migrate deploy --env staging
   ```

2. **Production Migration**

   ```bash
   # Apply migrations to production Xata database
   npx prisma migrate deploy --env production
   ```

3. **Rollback Strategy**
   - Keep backup of previous schema
   - Test rollback procedures in staging
   - Document breaking changes

## Performance Monitoring

### Key Metrics

- Response times (P50, P95, P99)
- Error rates by endpoint
- Database query performance
- Memory usage trends
- CPU utilization

### Optimization

- Monitor bundle size after deployments
- Review slow database queries
- Optimize R2 storage access patterns
- Cache frequently accessed data

## Security Considerations

- Rotate secrets regularly
- Monitor access logs for suspicious activity
- Keep dependencies updated
- Review security audit results
- Implement rate limiting if needed

## Support and Escalation

For deployment issues:

1. Check health endpoints
2. Review recent logs
3. Verify secret configuration
4. Test rollback procedures
5. Contact team lead if issue persists

---

**Last Updated**: 2025-09-24
**Version**: 1.0
