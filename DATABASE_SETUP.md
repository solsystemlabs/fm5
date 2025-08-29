# Database Setup Guide

This project now uses Docker for local development and supports multiple deployment environments.

## Quick Start

```bash
# Start development with local database (recommended)
npm run dev

# For a completely fresh start
npm run dev:clean
```

The `npm run dev` command will:
1. Start PostgreSQL in Docker
2. Wait for the database to be ready
3. Run any pending migrations
4. Start the development server

## Environment Management

### Local Development (Default)
```bash
npm run env:local    # Switch to local Docker database
npm run dev         # Start development
```

### Staging Environment
```bash
npm run env:staging  # Switch to Supabase (staging)
npm run dev         # Start development with staging DB
```

### Production Environment
```bash
npm run env:production  # Switch to production config
npm run build          # Build for production
```

## Database Commands

```bash
# Database lifecycle
npm run db:start     # Start PostgreSQL container
npm run db:stop      # Stop PostgreSQL container  
npm run db:restart   # Restart PostgreSQL container

# Database operations
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Populate with initial data
npm run db:reset     # Complete reset: stop, clean, start, migrate, seed
npm run db:studio    # Open Prisma Studio

# Utilities
npm run docker:logs  # View PostgreSQL container logs
```

## Docker Configuration

The local database runs in a Docker container with:
- **Image**: PostgreSQL 18
- **Database**: `fm5_dev`
- **User**: `fm5_user`
- **Password**: `fm5_password`
- **Port**: `5432`
- **Data Persistence**: Docker volume `postgres_data`

## Environment Files

| File | Purpose | Database |
|------|---------|----------|
| `.env` | Active configuration | Switches based on environment |
| `.env.local` | Local development | Docker PostgreSQL |
| `.env.staging` | Staging deployment | Supabase |
| `.env.production` | Production deployment | TBD |

## Troubleshooting

### Database Won't Start
```bash
# Check if port 5432 is in use
lsof -i :5432

# View detailed logs
npm run docker:logs

# Force restart
npm run db:restart
```

### Migration Issues
```bash
# Reset everything and try again
npm run db:reset

# Or manually reset
npm run db:stop
docker compose down -v
npm run dev
```

### Prisma Client Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset and regenerate
npm run db:reset
```

## Migration from Supabase

If you were previously using Supabase directly:

1. Your data remains in Supabase (now used for staging)
2. Local development now uses Docker PostgreSQL
3. Run `npm run dev:clean` for a fresh local setup
4. Use `npm run env:staging` to work with Supabase data when needed

## Production Deployment

When ready for production:

1. Update `.env.production` with your production database URL
2. Configure your deployment platform (Netlify, Vercel, etc.)
3. Use `npm run env:production` to switch environments
4. Deploy with your platform's build command

The staging environment continues to use Supabase for testing deployment builds.