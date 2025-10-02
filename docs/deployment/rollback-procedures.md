# Rollback and Recovery Procedures

## Overview

This document outlines the procedures for rolling back failed deployments and recovering from deployment issues in the FM5 application deployed on Cloudflare Workers.

## Quick Rollback Commands

### Staging Environment

```bash
# List recent deployments
wrangler deployments list --name fm5-staging

# Rollback to previous deployment
wrangler rollback --name fm5-staging [DEPLOYMENT_ID]

# Emergency rollback to latest stable
wrangler rollback --name fm5-staging --message "Emergency rollback from staging issue"
```

### Production Environment

```bash
# List recent deployments
wrangler deployments list --name fm5-production

# Rollback to previous deployment
wrangler rollback --name fm5-production [DEPLOYMENT_ID]

# Emergency rollback to latest stable
wrangler rollback --name fm5-production --message "Emergency rollback from production incident"
```

## Rollback Scenarios

### Scenario 1: Failed Health Checks

**Symptoms**: Health check endpoint returns 503 or fails entirely

**Recovery Steps**:

1. Identify the failing service:

   ```bash
   curl https://fm5-production.solsystemlabs.com/health
   ```

2. Check service status in health response:
   - Database down → Check Xata connectivity
   - Storage down → Check R2 bucket permissions
   - Email degraded → Non-critical, can proceed with caution

3. If critical services are down, rollback immediately:

   ```bash
   wrangler rollback --name fm5-production --message "Failed health checks"
   ```

4. Investigate root cause:
   - Check Wrangler logs: `wrangler tail --name fm5-production`
   - Verify environment variables are set correctly
   - Test database connectivity from local environment

### Scenario 2: Build Failures

**Symptoms**: GitHub Actions build step fails

**Recovery Steps**:

1. **No rollback needed** - failed builds never reach production

2. Fix the build issue:
   - Review build logs in GitHub Actions
   - Test build locally: `npm run build`
   - Fix TypeScript errors, missing dependencies, etc.

3. Commit fix and trigger new deployment

### Scenario 3: Runtime Errors After Deployment

**Symptoms**: Application returns 500 errors, JavaScript errors in logs

**Recovery Steps**:

1. Check error logs:

   ```bash
   wrangler tail --name fm5-production --format json
   ```

2. Identify error patterns:
   - Missing environment variables
   - API incompatibilities
   - Database schema mismatches
   - tRPC procedure errors

3. Rollback to previous stable version:

   ```bash
   # Get the deployment ID from before the problematic deployment
   wrangler deployments list --name fm5-production

   # Rollback to that deployment
   wrangler rollback --name fm5-production [STABLE_DEPLOYMENT_ID]
   ```

4. Fix issues in development environment and redeploy

### Scenario 4: Database Migration Issues

**Symptoms**: Database queries failing, schema mismatch errors

**Recovery Steps**:

1. **DO NOT** rollback code immediately - this can cause schema/code mismatch

2. Identify migration issue:
   - Check Prisma migration logs
   - Verify Xata database schema matches expected schema

3. Options:
   - **Option A**: Roll forward with migration fix

     ```bash
     # Fix migration locally
     npx prisma migrate dev

     # Deploy migration to production
     npx prisma migrate deploy

     # Redeploy application
     npm run deploy:production
     ```

   - **Option B**: Rollback database AND code

     ```bash
     # Rollback code first
     wrangler rollback --name fm5-production [PREVIOUS_DEPLOYMENT_ID]

     # Rollback database migration
     # (Manual process - restore from Xata backup)
     ```

4. Always test migrations in staging first

### Scenario 5: Environment Variable Issues

**Symptoms**: Authentication failures, missing configuration errors

**Recovery Steps**:

1. Verify environment variables are set:

   ```bash
   # List secrets (staging)
   wrangler secret list --name fm5-staging

   # List secrets (production)
   wrangler secret list --name fm5-production
   ```

2. Update missing or incorrect secrets:

   ```bash
   # Using the secrets management script
   npm run secrets:push:production

   # Or manually
   echo "your-secret-value" | wrangler secret put JWT_SECRET --name fm5-production
   ```

3. No rollback needed - Workers will pick up new secrets automatically

4. Verify fix with health check:
   ```bash
   curl https://fm5-production.solsystemlabs.com/health
   ```

## Recovery Procedures

### Database Recovery

**Backup Restoration**:

1. Access Xata dashboard
2. Navigate to the `fm5-production` database
3. Select "Backups" tab
4. Choose backup point before incident
5. Restore backup to current branch

**Point-in-Time Recovery**:

Xata provides point-in-time recovery for databases:

```bash
# Use Xata CLI to restore to specific timestamp
xata db restore fm5:main --to-timestamp "2025-10-02T10:00:00Z"
```

### R2 Storage Recovery

**File Restoration**:

1. Access Cloudflare dashboard
2. Navigate to R2 buckets
3. Check bucket versioning (if enabled)
4. Restore previous version of affected files

### Complete System Recovery

**Full Recovery Process**:

1. **Rollback Application Code**:

   ```bash
   wrangler rollback --name fm5-production [LAST_KNOWN_GOOD_DEPLOYMENT_ID]
   ```

2. **Verify Database State**:

   ```bash
   # Test database connectivity
   npx prisma db pull
   ```

3. **Check R2 Bucket Access**:

   ```bash
   # Test R2 connectivity via health endpoint
   curl https://fm5-production.solsystemlabs.com/health
   ```

4. **Validate All Services**:

   ```bash
   # Run comprehensive health check
   curl -s https://fm5-production.solsystemlabs.com/health | jq
   ```

5. **Monitor for 15 Minutes**:
   ```bash
   # Watch logs for errors
   wrangler tail --name fm5-production
   ```

## Rollback Testing

### Staging Rollback Test

**Purpose**: Validate rollback procedures work correctly

**Steps**:

1. Deploy known working version to staging:

   ```bash
   npm run deploy:staging
   ```

2. Note the deployment ID:

   ```bash
   wrangler deployments list --name fm5-staging
   ```

3. Deploy a test version with intentional issue:

   ```bash
   # Make breaking change
   # Deploy to staging
   npm run deploy:staging
   ```

4. Verify issue exists:

   ```bash
   curl https://fm5-staging.solsystemlabs.com/health
   ```

5. Perform rollback:

   ```bash
   wrangler rollback --name fm5-staging [GOOD_DEPLOYMENT_ID]
   ```

6. Verify rollback success:
   ```bash
   curl https://fm5-staging.solsystemlabs.com/health
   ```

### Production Rollback Simulation

**Purpose**: Practice production rollback without affecting production

**Steps**:

1. Use staging environment for simulation
2. Follow exact production rollback procedures
3. Document any issues or improvements needed
4. Update this document with learnings

## Monitoring During Rollback

### Key Metrics to Watch

1. **Health Check Status**:

   ```bash
   watch -n 5 'curl -s https://fm5-production.solsystemlabs.com/health | jq'
   ```

2. **Error Rate**:
   - Monitor Cloudflare Analytics dashboard
   - Check for spike in 5xx errors

3. **Response Time**:
   - Monitor p50, p95, p99 latencies
   - Compare to baseline metrics

4. **Database Connections**:
   - Check Xata dashboard for connection count
   - Verify no connection pool exhaustion

### Rollback Success Criteria

Rollback is successful when:

- [ ] Health check returns 200 OK
- [ ] All services report "ok" status
- [ ] Error rate < 1% for 5 minutes
- [ ] Response time within normal range
- [ ] No database connection errors
- [ ] R2 storage accessible
- [ ] Email service operational (or gracefully degraded)

## Post-Incident Procedures

### After Successful Rollback

1. **Document Incident**:
   - Create incident report in `.ai/incidents/`
   - Include timeline, root cause, resolution steps

2. **Fix Root Cause**:
   - Implement fix in development
   - Add tests to prevent recurrence
   - Deploy to staging first

3. **Update Runbooks**:
   - Update this document if procedures changed
   - Share learnings with team

4. **Schedule Post-Mortem**:
   - Review incident with team
   - Identify process improvements
   - Update deployment checklist if needed

### Incident Report Template

```markdown
# Incident Report: [YYYY-MM-DD] [Brief Description]

## Summary

[One paragraph summary of incident]

## Timeline

- HH:MM - Deployment initiated
- HH:MM - Issue detected
- HH:MM - Rollback initiated
- HH:MM - Service restored

## Root Cause

[Detailed explanation of what went wrong]

## Resolution

[How the issue was resolved]

## Prevention

[Steps to prevent similar incidents]

## Action Items

- [ ] Fix root cause
- [ ] Add monitoring/alerts
- [ ] Update documentation
- [ ] Add tests
```

## Emergency Contacts

**Cloudflare Support**:

- Dashboard: https://dash.cloudflare.com
- Support: https://support.cloudflare.com

**Xata Support**:

- Dashboard: https://app.xata.io
- Docs: https://xata.io/docs

**GitHub Actions**:

- Status: https://www.githubstatus.com
- Support: https://support.github.com

## Additional Resources

- [GitHub Actions Workflows](../../.github/workflows/)
- [Wrangler Configuration](../../wrangler.toml)
- [Environment Variables Documentation](../../.env.example)
- [Health Check Implementation](../../lib/health-check.ts)
