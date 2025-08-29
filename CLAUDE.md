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
- **Staging**: Supabase PostgreSQL (for Netlify deployment)
- **Production**: TBD (configurable via environment files)
- **Environment Files**: `.env.local`, `.env.staging`, `.env.production`
- **Switch Environments**: Use `npm run env:local|staging|production`

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