# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FM5 Manager is a comprehensive 3D printing management application built with TanStack Start (full-stack React framework) and TypeScript. It manages filaments, models, brands, and material types for 3D printing workflows.

**Tech Stack:**
- **Framework**: TanStack Start (React full-stack framework)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4 with React Aria Components
- **Forms**: TanStack React Form with Zod validation
- **Routing**: TanStack Router with file-based routing
- **State Management**: TanStack React Query
- **Tables**: TanStack React Table
- **UI Components**: React Aria Components + Tailwind Variants
- **Icons**: Heroicons/React and Lucide React
- **Authentication**: Better Auth (recently removed)

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev              # Starts Docker DB + migrates + runs dev server
npm run dev:clean        # Fresh start: reset DB + run dev server

# Build for production
npm run build

# Run unit tests with Vitest
npm run test
npm run test:ui          # Run tests with UI
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage

# Run E2E tests with Playwright
npm run test:e2e
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:debug   # Run E2E tests in debug mode

# Run all tests
npm run test:all

# Database operations (Docker-based local PostgreSQL)
npm run db:start         # Start PostgreSQL in Docker
npm run db:stop          # Stop Docker database
npm run db:restart       # Restart Docker database
npm run db:wait          # Wait for database to be ready
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with initial data
npm run db:reset         # Full reset: stop, remove volumes, start, migrate, seed
npm run db:studio        # Open Prisma Studio

# Environment management
npm run env:local        # Switch to local development environment
npm run env:staging      # Switch to staging environment  
npm run env:production   # Switch to production environment

# Docker utilities
npm run docker:logs      # View PostgreSQL container logs
```

## Architecture & Code Organization

### Routing Structure
- Uses TanStack Router with file-based routing
- Routes defined in `src/routes/` directory
- API routes in `src/routes/api/` for server-side functionality
- Route tree auto-generated in `src/routeTree.gen.ts`
- Root layout in `src/routes/__root.tsx` with global styles, Header, and React Query provider

### Database & API Architecture
- **Database**: PostgreSQL with Prisma ORM
- **Local Development**: Docker Compose with PostgreSQL 18 container
- **Schema**: Defined in `prisma/schema.prisma` with models for Filament, Model, Brand, MaterialType, ModelCategory
- **API Routes**: Server-side routes using TanStack Start's `createServerFileRoute`
- **Validation**: Zod schemas for request validation
- **Data Fetching**: React Query hooks for client-side state management

### Environment Configuration
- **Local Development**: Docker PostgreSQL (`npm run dev`)
- **Staging**: Supabase PostgreSQL (staging branch → staging database)
- **Production**: Supabase PostgreSQL (master branch → production database)
- **Environment Files**: `.env.local`, `.env.staging`, `.env.production`
- **Switch Environments**: Use `npm run env:local|staging|production`
- **Deployment**: Netlify with branch-based deployments

### Component Structure
- **Layout Components**: `src/components/layout/` - Header and navigation
- **Feature Components**: `src/components/` - FilamentsTable, dialogs, forms
- **Color Components**: `src/components/color/` - ColorLabel for color display
- **Utilities**: `src/lib/` - Types, API hooks, utils, monitoring, and logger

### Data Models
Core entities managed by the application:
- **Filament**: 3D printing material with color, brand, material type, cost, diameter
- **Model**: 3D models categorized by type, can use specific filaments
- **Brand**: Filament manufacturers
- **MaterialType**: Types of 3D printing materials (PLA, ABS, PETG, etc.)
- **ModelCategory**: Categories for organizing 3D models

### Import Path Aliases
- `@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts)
- Use absolute imports for better maintainability

### Current Features
- **Filament Management**: List, create, edit filaments with color swatches
- **Model Management**: Organize 3D models by category
- **Inventory Tracking**: View products and inventory
- **Data Visualization**: Tables with React Aria Components
- **Form Handling**: TanStack React Form with Zod validation
- **Color Input**: Custom hex color input component

## Code Style Patterns

### API Route Implementation
- Use `createServerFileRoute` for server-side routes in `src/routes/api/`
- Implement HTTP methods (GET, POST, PUT, DELETE) with `.methods()` 
- Always validate request data with Zod schemas
- Include related data in Prisma queries using `include` for proper relationships
- Handle errors gracefully and return appropriate HTTP status codes
- Use `Response.json()` for consistent API responses

### Database Patterns
- Use Prisma Client for all database operations
- Always include related data when querying (e.g., `Material`, `Brand`, `Models`)
- Use transactions for operations that affect multiple tables
- Implement proper error handling for database operations

### Form Implementation
- Use TanStack React Form for form state management
- Implement validation with Zod schemas (shared between client and server)
- Use React Query mutations for form submissions
- Handle async operations with proper loading and error states

### Component Architecture
- Use React Aria Components for accessible UI elements
- Implement proper TypeScript interfaces for component props
- Use Tailwind Variants for consistent component styling
- Export components as default exports with clear prop interfaces

### Data Fetching Patterns
- Use React Query hooks for server state management
- Implement custom hooks in `src/lib/api-hooks.ts` for reusable queries
- Use proper query keys for cache invalidation
- Handle loading, error, and success states consistently

### Color Management
- Store colors as hex strings in the database
- Use ColorSwatch component from React Aria Components for display
- Implement proper color validation in forms

## Development Notes

### Infrastructure
- Server runs on port 3000 by default
- Local PostgreSQL runs on port 5432 via Docker
- Docker Compose manages local database lifecycle
- Hot reload enabled through Vite
- Database automatically starts with `npm run dev`

### Configuration
- TypeScript strict mode with null checks enabled
- ES modules configuration (`"type": "module"` in package.json)
- Auto-import resolution for `@/` paths via vite-tsconfig-paths
- Environment-specific `.env` files for different deployment targets

### Database Management
- Database schema changes require Prisma migrations (`npm run db:migrate`)
- Use `npm run db:reset` for clean slate during development
- Prisma Studio available via `npm run db:studio` for database inspection
- Docker volumes persist data between container restarts
- MSW (Mock Service Worker) available for testing API interactions

### Best Practices
- Always use `npm run dev` which handles database startup automatically
- Use environment switching commands (`npm run env:*`) for different deployment contexts
- Monitor Docker logs with `npm run docker:logs` if database issues occur

## Deployment

### Netlify Production Setup

The application is configured for deployment on Netlify with branch-based environments:
- **Production**: `master` branch → production Supabase database
- **Staging**: `staging` branch → staging Supabase database

#### Prerequisites
1. Netlify account with GitHub integration
2. Supabase projects for production and staging environments
3. Environment variables configured in both `.env.production` and `.env.staging`

#### Netlify Site Configuration

##### Step 1: Create Two Netlify Sites

**Production Site:**
1. Go to Netlify dashboard → "Add new site" → "Import an existing project"
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Production branch**: `master`
4. Deploy site

**Staging Site (Optional - Alternative to branch deploys):**
1. Create another site following the same steps
2. Set **Production branch** to `staging`
3. Configure different custom domain (e.g., `staging.yourdomain.com`)

##### Step 2: Configure Environment Variables

**Important**: In Netlify, environment variables are set directly in the dashboard, not via `.env` files. The build process uses these Netlify environment variables directly.

**For Production Site:**
In Netlify Dashboard → Site Settings → Build & Deploy → Environment Variables, add these variables with values from your local `.env.production` file:

```bash
# Database Configuration (from your .env.production)
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@YOUR_HOST.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@YOUR_HOST.supabase.com:5432/postgres"

# Authentication
BETTER_AUTH_URL="https://yourdomain.com"
BETTER_AUTH_SECRET="your-secure-production-secret"

# AWS S3 Configuration  
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-2"
AWS_S3_BUCKET_NAME="your-prod-bucket-name"
AWS_S3_BASE_URL="https://your-cdn-domain.com"

# Project Configuration
PROJECT_NAME="fm5-manager"
NODE_ENV="production"
```

**For Staging Site/Context:**
In Netlify Dashboard → Site Settings → Build & Deploy → Environment Variables, add these variables with values from your local `.env.staging` file:

```bash
# Database Configuration (from your .env.staging)
DATABASE_URL="postgresql://postgres.YOUR_STAGING_ID:YOUR_STAGING_PASSWORD@YOUR_STAGING_HOST.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.YOUR_STAGING_ID:YOUR_STAGING_PASSWORD@YOUR_STAGING_HOST.supabase.com:5432/postgres"

# Authentication
BETTER_AUTH_URL="https://staging.yourdomain.com"
BETTER_AUTH_SECRET="your-secure-staging-secret"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-staging-aws-secret"
AWS_REGION="us-east-2"  
AWS_S3_BUCKET_NAME="your-staging-bucket-name"
AWS_S3_BASE_URL="https://your-staging-cdn-domain.com"

# Project Configuration
PROJECT_NAME="fm5-manager"
NODE_ENV="staging"
```

##### Step 3: Branch Deploy Configuration (Alternative to separate staging site)

For a single site with branch deploys:

1. In Netlify Dashboard → Site Settings → Build & Deploy → Branches
2. Enable branch deploys for `staging` branch
3. Configure branch-specific environment variables:
   - Go to Build & Deploy → Environment Variables
   - Click "Advanced" and select deploy contexts
   - Set variables with context `branch:staging`

##### Step 4: Custom Domains (Optional)

**Production:**
1. Site Settings → Domain management → Add custom domain
2. Configure your domain's DNS to point to Netlify
3. Enable HTTPS (automatic with Let's Encrypt)

**Staging:**
1. Configure subdomain (e.g., `staging.yourdomain.com`)
2. Point DNS to staging site or configure branch deploy subdomain

#### Deployment Workflow

**Production Deployment:**
1. Push changes to `master` branch
2. Netlify automatically builds and deploys to production
3. Uses production environment variables and database

**Staging Deployment:**
1. Push changes to `staging` branch  
2. Netlify automatically builds and deploys to staging
3. Uses staging environment variables and database

**Testing Deployment:**
1. Create feature branch from `staging`
2. Push changes trigger branch deploy
3. Review deployment at temporary URL before merging

#### Configuration Files

The project includes:
- **`netlify.toml`**: Netlify configuration with context-specific environment variables and headers
- **`public/_redirects`**: Route configuration for TanStack Start API routes and SPA routing
- **`vite.config.ts`**: Configured with `target: 'netlify'` and SPA mode enabled for Netlify deployment

**Note**: The Netlify build process uses `npm ci && npm run build` (not the local `npm run env:*` scripts) because environment variables are provided by Netlify's environment configuration. The `npm ci` ensures all dependencies including devDependencies are properly installed.

**SPA Mode**: The application is configured with SPA mode enabled for Netlify deployment to avoid server-side rendering issues. Server functions and API routes still work through the `/_serverFn/*` and `/api/*` paths.

#### Database Migrations

**Important**: Run database migrations manually when needed:

```bash
# For production (after deploying schema changes)
npm run env:production
npx prisma migrate deploy

# For staging
npm run env:staging  
npx prisma migrate deploy
```

#### Monitoring & Troubleshooting

**Common Issues:**
1. **Build failures**: Check environment variables are set correctly in Netlify
2. **Database connection errors**: Verify Supabase connection strings and IP allowlisting
3. **API routes not working**: Ensure `_redirects` file is in `public/` directory
4. **Environment variable not found**: Check context-specific configuration in Netlify
5. **Secrets scanning errors**: The project includes `SECRETS_SCAN_OMIT_PATHS` in `netlify.toml` to exclude documentation files from secrets scanning

**Useful Netlify CLI Commands:**
```bash
# Link local project to Netlify site
netlify link

# Test build locally with production context
netlify build --context production

# Deploy directly (bypass Git)
netlify deploy --prod

# Check environment variables
netlify env:list --context production
```