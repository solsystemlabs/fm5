# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-07-project-initialization/spec.md

## Schema Changes

### Initial Database Setup

- **Prisma Configuration Files** - Create `prisma/schema.prisma` with PostgreSQL provider configuration
- **Environment Connection Strings** - Configure database URLs for local Docker, Supabase staging, and Supabase production
- **Migration System Initialization** - Set up Prisma migration infrastructure with versioning
- **Client Generation Setup** - Configure automatic Prisma client generation and regeneration

## Schema Specifications

### Prisma Schema Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Initial placeholder model for migration system initialization
model System {
  id        Int      @id @default(autoincrement())
  version   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Database Connection Strings

```env
# Local Development (Docker)
DATABASE_URL="postgresql://postgres:password@localhost:5432/fm5_dev"

# Staging (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Production (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
```

### Migration Commands

```bash
# Initialize migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy
```

## Rationale

### Initial System Model

The placeholder `System` model serves as a foundation for the migration system and ensures the database schema generation works correctly. This model will be removed or evolved in subsequent specs when actual business models are defined.

### Environment-Based Configuration

Using environment variables for database URLs allows seamless switching between local development (Docker), staging (Supabase), and production (Supabase) environments without code changes.

### Migration Versioning

Prisma's migration system provides atomic schema changes with proper versioning, ensuring consistent database states across all environments and enabling safe rollbacks if needed.
