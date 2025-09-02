# FM5 Manager - Cloudflare Pages Deployment Guide

This guide covers deploying FM5 Manager to Cloudflare Pages with staging and production environments.

## Overview

- **Staging**: `fm5-staging.solsystemlabs.com` (deployed from `staging` branch)
- **Production**: `fm5.solsystemlabs.com` (deployed from `main` branch)
- **Database**: Supabase PostgreSQL (separate databases for each environment)
- **Storage**: AWS S3 with environment-specific folders (`staging/` and `prod/`)
- **CI/CD**: GitHub Actions for database migrations + Cloudflare Pages for deployments

## Prerequisites

1. **GitHub Repository** - Your code must be in a GitHub repository
2. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)
3. **Supabase Projects** - Staging and production databases already configured
4. **AWS S3 Bucket** - For file storage (can use same bucket with different prefixes)
5. **Domain DNS** - Control over `solsystemlabs.com` DNS settings

## Step-by-Step Setup

### 1. Create Cloudflare Pages Projects

#### Staging Environment
1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure:
   - **Project name**: `fm5-manager-staging`
   - **Production branch**: `staging`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

#### Production Environment  
1. Create another Pages project
2. Configure:
   - **Project name**: `fm5-manager-production`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

### 2. Configure Environment Variables

#### For Staging Project
Navigate to **Pages** → **fm5-manager-staging** → **Settings** → **Environment variables**

Add these variables for **Production** deployment:
```
BETTER_AUTH_URL=https://fm5-staging.solsystemlabs.com
BETTER_AUTH_SECRET=[generate new secret - use: openssl rand -base64 32]
DATABASE_URL=[your Supabase staging connection string with pooling]
DIRECT_URL=[your Supabase staging direct connection string]
AWS_ACCESS_KEY_ID=[your AWS access key]
AWS_SECRET_ACCESS_KEY=[your AWS secret key]
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=solsystemlabs
NODE_ENV=staging
PROJECT_NAME=fm5-manager
```

#### For Production Project
Navigate to **Pages** → **fm5-manager-production** → **Settings** → **Environment variables**

Add these variables for **Production** deployment:
```
BETTER_AUTH_URL=https://fm5.solsystemlabs.com
BETTER_AUTH_SECRET=[generate new secret - different from staging]
DATABASE_URL=[your Supabase production connection string with pooling]
DIRECT_URL=[your Supabase production direct connection string]
AWS_ACCESS_KEY_ID=[production AWS access key - create separate IAM user]
AWS_SECRET_ACCESS_KEY=[production AWS secret key]
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=[production bucket name or same bucket with prod/ prefix]
NODE_ENV=production
PROJECT_NAME=fm5-manager
```

### 3. Set Up Custom Domains

#### Staging Domain
1. In **fm5-manager-staging** project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `fm5-staging.solsystemlabs.com`
4. Follow Cloudflare's DNS instructions (add CNAME record)

#### Production Domain
1. In **fm5-manager-production** project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `fm5.solsystemlabs.com`
4. Follow Cloudflare's DNS instructions (add CNAME record)

### 4. Configure GitHub Secrets for Database Migrations

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
```
STAGING_DATABASE_URL=[Supabase staging pooled connection]
STAGING_DIRECT_URL=[Supabase staging direct connection]
PROD_DATABASE_URL=[Supabase production pooled connection]
PROD_DIRECT_URL=[Supabase production direct connection]
```

### 5. Set Up Branch Protection Rules

1. Go to GitHub repository → **Settings** → **Branches**
2. Click **Add branch protection rule**

#### For `main` branch (Production):
- **Branch name pattern**: `main`
- ✅ **Restrict pushes that create files larger than 100 MB**
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Restrict pushes to matching branches** (optional)

#### For `staging` branch:
- **Branch name pattern**: `staging`
- ✅ **Restrict pushes that create files larger than 100 MB**
- ✅ **Require status checks to pass before merging**

### 6. Create AWS Production Resources (Security Best Practice)

For production, create separate AWS resources:

1. **Create Production IAM User**:
   ```bash
   # AWS CLI commands (run locally)
   aws iam create-user --user-name fm5-production
   aws iam attach-user-policy --user-name fm5-production --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
   aws iam create-access-key --user-name fm5-production
   ```

2. **Create Production S3 Bucket** (optional - or use same bucket with `prod/` prefix):
   ```bash
   aws s3 mb s3://fm5-production-files --region us-east-2
   ```

### 7. DNS Configuration

In your domain registrar or DNS provider for `solsystemlabs.com`:

1. **Add CNAME records**:
   ```
   fm5-staging.solsystemlabs.com → [cloudflare-pages-staging-url]
   fm5.solsystemlabs.com → [cloudflare-pages-production-url]
   ```

2. **Verify SSL certificates** are automatically provisioned by Cloudflare

### 8. Deploy and Test

#### Initial Deployment
1. Push changes to `staging` branch to deploy staging
2. Push changes to `main` branch to deploy production
3. Database migrations run automatically via GitHub Actions

#### Workflow
- **Feature Development**: Create feature branch → PR to `staging`
- **Staging Testing**: Merge to `staging` → auto-deploy to staging environment
- **Production Release**: PR from `staging` → `main` → auto-deploy to production

## Environment File Structure

Your project now supports:
- **Local Development**: `.env.local` → Docker PostgreSQL
- **Staging**: `.env.staging` → Supabase staging database
- **Production**: `.env.production` → Supabase production database

Switch environments locally using:
```bash
npm run env:staging   # Switch to staging config
npm run env:production # Switch to production config
npm run env:local     # Switch back to local development
```

## Monitoring & Maintenance

### Cloudflare Analytics
- View deployment metrics in Cloudflare Pages dashboard
- Monitor Core Web Vitals and performance metrics
- Track traffic patterns and geographic distribution

### Database Monitoring
- Use Supabase dashboard for database performance
- Set up alerts for connection limits and query performance
- Monitor storage usage and backup status

### S3 Storage Monitoring
- Track storage usage and costs in AWS Console
- Set up S3 lifecycle policies for cost optimization
- Monitor access patterns and security

## Security Features

- ✅ **Separate databases** for staging and production
- ✅ **Environment-specific secrets** in Cloudflare Pages
- ✅ **Branch protection** prevents direct pushes to main
- ✅ **Database migrations** run automatically and safely
- ✅ **S3 folder isolation** between environments
- ✅ **HTTPS enforced** by Cloudflare Pages
- ✅ **Security headers** configured in wrangler.toml

## Troubleshooting

### Build Failures
1. Check Cloudflare Pages build logs in the dashboard
2. Verify all environment variables are set correctly
3. Ensure `wrangler.toml` configuration is valid

### Database Issues
1. Check GitHub Actions logs for migration errors
2. Verify database connection strings in GitHub secrets
3. Test connections manually using Supabase dashboard

### Domain Issues
1. Verify DNS records are correctly pointing to Cloudflare
2. Check SSL certificate status in Cloudflare dashboard
3. Ensure custom domains are added to correct Pages projects

## Cost Optimization

- **Cloudflare Pages**: Free tier supports most small-medium applications
- **Supabase**: Free tier includes 500MB database + 1GB bandwidth
- **AWS S3**: Pay only for storage used + requests (typically $1-10/month)

## Next Steps

After deployment:
1. Set up error tracking (consider Sentry integration)
2. Implement application monitoring (APM)
3. Set up automated testing in CI/CD pipeline
4. Consider implementing feature flags for safer deployments