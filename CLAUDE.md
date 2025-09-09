# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FM5 (Filament Manager 5) is a 3D printing business management platform built with TanStack Start, React, TypeScript, and deployed to Cloudflare Workers.

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Framework**: TanStack Start with TanStack Router and Query
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Cloudflare Workers
- **Testing**: Vitest with Testing Library
- **Styling**: Tailwind CSS
- **Development**: Docker Compose for local database

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git

### Quick Setup

Run the automated setup script:

```bash
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### Manual Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env
   ```

3. Start the database:

   ```bash
   docker compose up -d postgres
   ```

4. Set up the database:

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start development server (automatically starts database):
   ```bash
   npm run dev
   ```

## Commands

### Development

- `npm run dev` - Start development server on port 3000 (automatically starts database)
- `npm run dev:db` - Start database only
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

### Code Quality

- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run check` - Format and fix linting issues

### Deployment

- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate Cloudflare types

### Database Scripts

- `./scripts/db.sh up` - Start database
- `./scripts/db.sh down` - Stop database
- `./scripts/db.sh shell` - Connect to database shell
- `./scripts/migrate.sh [env]` - Run migrations for environment

## Architecture

- **Frontend**: React components with TanStack Router for navigation
- **Backend**: TanStack Start server functions
- **Database**: PostgreSQL with Prisma schema
- **File Storage**: Configured for AWS S3 (future)
- **Deployment**: Cloudflare Workers with automatic CI/CD

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/staging/production)
- `APP_URL` - Application URL

Additional variables for production:

- Cloudflare API credentials
- Supabase database URLs
- AWS S3 credentials
- Sentry DSN for error tracking
