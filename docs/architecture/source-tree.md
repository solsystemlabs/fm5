# FM5 Source Tree Structure

## Project Overview

FM5 (Filament Manager v5) is a 3D Printing Business Management Platform built with modern TanStack ecosystem, tRPC, Prisma, and PostgreSQL. This document outlines the actual source code organization and file structure.

## Root Directory Structure

```
fm5/
├── .bmad-core/                    # BMAD™ Core agent system configuration
├── .bmad-infrastructure-devops/   # Infrastructure and DevOps tooling
├── .nitro/                        # Nitro build system generated files
├── .output/                       # Build output directory
├── docs/                          # Project documentation
├── lib/                           # Core application libraries and utilities
├── prisma/                        # Database schema and migrations
├── src/                           # Main application source code
├── package.json                   # Node.js dependencies and scripts
├── README.md                      # Basic project setup instructions
├── eslint.config.js               # ESLint configuration
└── [config files]                # Various configuration files
```

## Core Library Structure (`/lib`)

**Purpose**: Shared utilities and core application infrastructure

```
lib/
├── api.ts                         # API client configuration and utilities
├── db.ts                          # Prisma client configuration with dev optimizations
├── schemas.ts                     # Zod schemas matching Prisma models (185 lines)
├── trpc.ts                        # tRPC configuration with auth middleware (70 lines)
└── routers/                       # tRPC router definitions
    ├── _app.ts                    # Main app router aggregation
    ├── auth.ts                    # Authentication procedures (placeholder)
    ├── filaments.ts               # Filament management procedures
    ├── models.ts                  # Model management procedures
    ├── queue.ts                   # Print queue management procedures
    └── variants.ts                # Model variant procedures
```

### Key Library Files

- **`lib/db.ts`**: Prisma client with development global instance pattern
- **`lib/trpc.ts`**: tRPC setup with authentication middleware (TODO: JWT implementation)
- **`lib/schemas.ts`**: Complete Zod schema definitions matching Prisma models
- **`lib/routers/_app.ts`**: Central router aggregation point

## Main Application Source (`/src`)

**Purpose**: Application-specific code including UI components, routes, and business logic

```
src/
├── __tests__/                     # Test files and setup
│   ├── setup.ts                   # Test environment configuration
│   ├── setup-validation.test.ts   # Test setup validation
│   ├── build-verification.test.tsx # Build process verification
│   ├── trpc-validation.test.ts    # tRPC configuration testing
│   ├── trpc-procedures.test.ts    # tRPC procedure testing
│   └── components.smoke.test.tsx  # Component smoke tests
├── components/                    # Reusable UI components
│   ├── ui/                        # Base UI components and design system
│   │   └── index.ts               # UI component exports
│   ├── layout/                    # Layout components
│   │   └── Header.tsx             # Application header component
│   ├── providers/                 # React context providers
│   │   └── TRPCProvider.tsx       # tRPC query client provider
│   └── examples/                  # Example/demo components
│       └── ModernTRPCExample.tsx  # tRPC usage examples
├── hooks/                         # Custom React hooks
│   ├── useFilaments.ts            # Filament data management hooks
│   ├── useModels.ts               # Model data management hooks
│   └── usePrintQueue.ts           # Print queue management hooks
├── lib/                           # Application-specific utilities
│   ├── db.ts                      # Database utilities (duplicate of /lib/db.ts)
│   └── utils.ts                   # General utility functions
├── routes/                        # TanStack Router file-based routing
│   ├── __root.tsx                 # Root layout with providers (68 lines)
│   ├── index.tsx                  # Home page route
│   └── api/                       # API routes
│       └── trpc/                  # tRPC API endpoints
│           └── $trpc.ts           # tRPC handler for TanStack Router
├── router.tsx                     # Router configuration
├── routeTree.gen.ts               # Auto-generated route tree (TanStack Router)
└── styles.css                     # Global styles (imported in root)
```

### Key Source Files

- **`src/routes/__root.tsx`**: Root component with tRPC provider and layout structure
- **`src/components/providers/TRPCProvider.tsx`**: tRPC React Query integration
- **`src/hooks/`**: Custom hooks for data management using tRPC procedures
- **`src/__tests__/`**: Comprehensive test suite with Vitest

## Database Structure (`/prisma`)

**Purpose**: Database schema, migrations, and Prisma configuration

```
prisma/
├── schema.prisma                  # Complete database schema (211 lines)
└── migrations/                    # Database migration files (if any)
```

### Database Schema Overview

The schema includes user-isolated tables with comprehensive indexing:

- **Users**: Authentication and profile data with JSONB preferences
- **Models**: 3D model metadata with category classification
- **ModelVariants**: Sliced files with Bambu Studio metadata (JSONB)
- **Filaments**: Material specifications with cost tracking
- **FilamentInventory**: Physical spool tracking with stock management
- **FilamentRequirements**: Links variants to required filaments
- **PrintJobs**: Print queue with status tracking and estimates

## Documentation Structure (`/docs`)

**Purpose**: Project requirements, architecture, and planning documents

```
docs/
├── prd/                           # Product Requirements Document (sharded)
│   ├── index.md                   # PRD table of contents
│   ├── goals-and-background-context.md
│   ├── requirements.md            # Functional and non-functional requirements
│   ├── user-interface-design-goals.md
│   ├── user-stories.md            # Epic and story definitions
│   ├── technical-implementation.md
│   ├── post-mvp-features-deferred.md
│   └── cross-epic-dependencies-summary.md
├── architecture/                  # Technical architecture documentation
│   ├── index.md                   # Architecture overview
│   ├── trpc-api-specification-with-zod.md # tRPC API definitions
│   ├── tanstack-db-integration.md # Database integration patterns
│   ├── source-tree.md            # This document
│   ├── coding-standards.md       # Development standards and patterns
│   └── tech-stack.md            # Technology stack documentation
├── stories/                       # Individual development stories
│   ├── 0.1.project-scaffolding.md
│   ├── 0.2.docker-development-environment-setup.md
│   ├── 0.3.database-schema-and-prisma-setup.md
│   ├── 0.4.trpc-and-zod-integration.md
│   ├── 0.5.authentication-framework-setup.md
│   └── 0.6.cicd-pipeline-deployment.md
├── qa/                            # Quality assurance documentation
│   └── assessments/               # QA assessment reports
├── front-end-spec.md              # Frontend specifications
└── project-brief.md               # Initial project brief
```

## Configuration Files

### Package Management
- **`package.json`**: Dependencies including TanStack ecosystem, tRPC, Prisma, React 19
- **Development**: Vite, Vitest, ESLint, Prettier, TypeScript

### Build and Development
- **`eslint.config.js`**: ESLint configuration using TanStack config
- **Vite**: Build system with TypeScript paths and React plugin

## Key Integration Points

### Authentication Integration Points
- **`lib/trpc.ts`**: Authentication middleware (placeholder for JWT)
- **`src/routes/__root.tsx`**: Authentication provider wrapper needed
- **`lib/routers/auth.ts`**: Authentication procedures (placeholder)

### Database Integration
- **`lib/db.ts`**: Global Prisma client for development
- **`lib/schemas.ts`**: Zod schemas matching Prisma models exactly
- **User Isolation**: All main tables include `userId` for multi-tenant architecture

### Frontend Integration
- **`src/components/providers/TRPCProvider.tsx`**: React Query + tRPC integration
- **`src/hooks/`**: Custom hooks for tRPC procedure calls
- **`src/routes/api/trpc/$trpc.ts`**: TanStack Router tRPC handler

## Development Patterns

### File Naming Conventions
- **React Components**: PascalCase (e.g., `Header.tsx`, `TRPCProvider.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useFilaments.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`, `api.ts`)
- **Constants**: SCREAMING_SNAKE_CASE or camelCase depending on context

### Directory Organization
- **Components**: Organized by type (`ui/`, `layout/`, `providers/`, `examples/`)
- **Routes**: File-based routing following TanStack Router conventions
- **Tests**: Co-located with source files or in `__tests__/` directories
- **Libraries**: Shared in `/lib`, application-specific in `/src/lib`

## Build and Deployment

### Development Commands
```bash
npm run dev       # Start development server on port 3000
npm run build     # Production build
npm run test      # Run Vitest test suite
npm run lint      # ESLint checking
npm run format    # Prettier formatting
npm run check     # Format + lint fix
```

### Build Output
- **`.output/`**: Nitro build output for production deployment
- **`.nitro/`**: Nitro build system types and configuration

## Testing Structure

### Test Organization
- **`src/__tests__/setup.ts`**: Test environment configuration
- **Validation Tests**: Setup, build, and tRPC procedure validation
- **Component Tests**: React Testing Library with smoke tests
- **Framework**: Vitest with jsdom for React component testing

### Test Patterns
- Component smoke tests for UI validation
- tRPC procedure testing with mock data
- Build verification testing
- Setup validation for development environment