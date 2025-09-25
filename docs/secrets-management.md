# FM5 Secrets Management Guide

This guide explains how to manage environment-specific secrets for the FM5 application across local development, staging, and production environments.

## Overview

The FM5 project uses a three-tier environment setup:

- **Local Development** (`.env`, `.env.local`) - For local development only
- **Staging** (`.env.staging`) - For staging/testing deployments
- **Production** (`.env.production`) - For production deployments

## Environment Files

### `.env` (Local Development)
- Contains local development database connections and services
- Uses local Docker services (PostgreSQL, Redis, MinIO)
- Safe default secrets for development
- **Committed to git** as it contains no sensitive production data

### `.env.local` (Local Development Override)
- Optional override file for local development
- **Not committed to git**
- Use this for personal local configuration overrides

### `.env.staging`
- Contains staging-specific secrets and configurations
- Real secrets for the staging environment
- **Committed to git** (these are staging secrets, not production)
- Automatically pushed to Cloudflare Workers staging environment

### `.env.production`
- Contains production secrets and configurations
- Real production secrets
- **Committed to git** (team needs access to deploy)
- Automatically pushed to Cloudflare Workers production environment

## Secret Management Script

The `./scripts/manage-secrets.sh` script automates secret management for Cloudflare Workers environments.

### Usage

```bash
./scripts/manage-secrets.sh <action> <environment> [secret_name]
```

**Actions:**
- `push` - Push secrets from `.env.<environment>` to Cloudflare Workers
- `pull` - Display current secrets in Cloudflare Workers (no values shown)
- `list` - List all secrets in the environment
- `delete` - Delete a specific secret from the environment

**Environments:**
- `staging` - Uses `.env.staging` file
- `production` - Uses `.env.production` file

### Examples

```bash
# Push all staging secrets to Cloudflare Workers
./scripts/manage-secrets.sh push staging

# Push all production secrets to Cloudflare Workers
./scripts/manage-secrets.sh push production

# List current secrets in staging
./scripts/manage-secrets.sh list staging

# Delete a specific secret from staging
./scripts/manage-secrets.sh delete staging JWT_SECRET
```

## NPM Scripts

For convenience, the following npm scripts are available:

```bash
# Secret management
npm run secrets:push:staging       # Push staging secrets
npm run secrets:push:production    # Push production secrets
npm run secrets:list:staging       # List staging secrets
npm run secrets:list:production    # List production secrets

# Deployment (includes secret push)
npm run deploy:staging             # Build and deploy to staging
npm run deploy:production          # Build and deploy to production
```

## Managed Secrets

The following secrets are automatically managed by the script:

### Application Secrets
- `JWT_SECRET` - JSON Web Token signing secret
- `BETTER_AUTH_SECRET` - Better Auth library secret
- `BETTER_AUTH_URL` - Base URL for auth callbacks

### Database & Storage
- `XATA_API_KEY` - Xata database API key
- `XATA_DATABASE_URL` - Xata database connection URL

### External Services
- `RESEND_API_KEY` - Email service API key

## Workflow

### Setting up a new environment

1. **Update environment file:**
   ```bash
   # Edit the appropriate file
   vim .env.staging  # or .env.production
   ```

2. **Push secrets to Cloudflare:**
   ```bash
   npm run secrets:push:staging
   # or
   npm run secrets:push:production
   ```

3. **Deploy application:**
   ```bash
   npm run deploy:staging
   # or
   npm run deploy:production
   ```

### Updating secrets

1. **Update the environment file:**
   ```bash
   vim .env.staging  # Update the secret value
   ```

2. **Push updated secrets:**
   ```bash
   npm run secrets:push:staging
   ```

3. **Redeploy to pick up new secrets:**
   ```bash
   npm run deploy:staging
   ```

### Rotating secrets

1. **Generate new secret values:**
   ```bash
   # Generate new JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update environment file with new values**

3. **Push new secrets:**
   ```bash
   npm run secrets:push:staging
   npm run secrets:push:production
   ```

4. **Deploy updated applications**

## Security Best Practices

1. **Environment Separation**: Never use production secrets in staging or development
2. **Secret Rotation**: Regularly rotate secrets, especially after team member changes
3. **Access Control**: Limit who can access production environment files
4. **Monitoring**: Monitor secret usage and access in Cloudflare Dashboard
5. **Backup**: Keep secure backups of environment files outside the repository

## Troubleshooting

### Script fails to push secrets
1. Ensure wrangler is authenticated: `wrangler whoami`
2. Check you have access to the Cloudflare account
3. Verify environment file exists and has correct format

### Secrets not taking effect
1. Confirm secrets were pushed: `npm run secrets:list:staging`
2. Redeploy the application: `npm run deploy:staging`
3. Check Cloudflare Workers logs for errors

### Missing secrets in environment
1. Add missing secrets to appropriate `.env.<environment>` file
2. Update the `secrets` array in `manage-secrets.sh` if needed
3. Push updated secrets

## File Structure

```
fm5/
├── .env                    # Local development (committed)
├── .env.local             # Local overrides (not committed)
├── .env.staging           # Staging secrets (committed)
├── .env.production        # Production secrets (committed)
├── scripts/
│   └── manage-secrets.sh  # Secret management script
└── docs/
    └── secrets-management.md  # This documentation
```

---

*Last Updated: 2025-09-25*
*For questions or issues, refer to the main project documentation or contact the development team.*