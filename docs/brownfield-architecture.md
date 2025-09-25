# FM5 Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the FM5 (Filament Manager v5) 3D Printing Business Management Platform codebase, including technical implementation, patterns, and real-world constraints. It serves as a comprehensive reference for AI agents working on enhancements and development tasks.

### Document Scope

Comprehensive documentation of entire system focused on current implementation state, with emphasis on authentication framework development (Story 0.5) and ongoing architecture patterns.

### Change Log

| Date       | Version | Description                 | Author       |
| ---------- | ------- | --------------------------- | ------------ |
| 2025-09-23 | 1.0     | Initial brownfield analysis | Winston (🏗️) |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/routes/__root.tsx` - Root component with providers and layout
- **tRPC Configuration**: `lib/trpc.ts` - tRPC setup with authentication middleware placeholders
- **Database Client**: `lib/db.ts` - Prisma client with development optimizations
- **Schema Definitions**: `lib/schemas.ts` - Complete Zod schemas matching Prisma models
- **Database Schema**: `prisma/schema.prisma` - Full database structure with user isolation
- **API Routes**: `lib/routers/_app.ts` - Main tRPC router aggregation
- **Package Configuration**: `package.json` - Modern TanStack ecosystem dependencies

### Authentication Implementation Focus (Story 0.5)

Based on current development priorities, these files are central to authentication implementation:

- **`lib/trpc.ts`**: Contains authentication middleware structure ready for JWT implementation
- **`lib/routers/auth.ts`**: Placeholder authentication procedures awaiting implementation
- **`src/routes/__root.tsx`**: Needs authentication provider wrapper integration
- **`lib/schemas.ts`**: User schema already defined and consistent with auth requirements

## High Level Architecture

### Technical Summary

FM5 is a modern full-stack TypeScript application built for 3D printing business management. The architecture emphasizes type safety, user data isolation, and developer experience through the TanStack ecosystem.

**Core Principles**:

- End-to-end type safety from database to frontend
- User data isolation through multi-tenant database design
- Modern React patterns with server-side rendering capabilities
- tRPC for type-safe API development
- Comprehensive testing with Vitest and React Testing Library

### Actual Tech Stack (from package.json analysis)

| Category      | Technology            | Version    | Notes                             |
| ------------- | --------------------- | ---------- | --------------------------------- |
| Runtime       | Node.js               | ES Modules | Native ES module support          |
| Frontend      | React                 | 19.0.0     | Latest with server components     |
| Framework     | TanStack Start        | 1.131.7    | Full-stack React framework        |
| API           | tRPC                  | 11.5.1     | End-to-end type-safe API          |
| Database      | PostgreSQL + Prisma   | 6.16.2     | ORM with type-safe client         |
| Validation    | Zod                   | 4.1.11     | Runtime schema validation         |
| Routing       | TanStack Router       | 1.130.2    | File-based type-safe routing      |
| State         | TanStack Query        | 5.89.0     | Server state management           |
| Forms         | TanStack Form         | 1.23.0     | Type-safe form handling           |
| UI Components | React Aria Components | 1.12.2     | Accessible component foundation   |
| Styling       | Tailwind CSS          | 4.0.6      | Utility-first CSS framework       |
| Build Tool    | Vite                  | 6.3.5      | Fast build and development        |
| Testing       | Vitest                | 3.0.5      | Fast unit and integration testing |
| TypeScript    | TypeScript            | 5.7.2      | Strict mode enabled               |

### Repository Structure Reality Check

- **Type**: Monorepo structure with clear separation of concerns
- **Package Manager**: npm with package-lock.json
- **Build System**: Vite with Nitro for universal deployment
- **Notable**: Modern ES modules throughout, no legacy CommonJS

## Source Tree and Module Organization

### Project Structure (Actual)

```text
fm5/
├── .bmad-core/                    # BMAD™ Core agent system (workflow automation)
├── .nitro/                        # Nitro build system types and cache
├── .output/                       # Production build output
├── docs/                          # Comprehensive project documentation
│   ├── prd/                       # Product Requirements (sharded)
│   ├── architecture/              # Technical architecture docs
│   ├── stories/                   # Development stories (0.1-0.6)
│   └── qa/                        # Quality assurance reports
├── lib/                           # Core application libraries
│   ├── trpc.ts                    # tRPC config (auth middleware placeholder)
│   ├── schemas.ts                 # Zod schemas matching Prisma (185 lines)
│   ├── db.ts                      # Prisma client with dev optimizations
│   └── routers/                   # tRPC API route definitions
├── prisma/                        # Database schema and migrations
│   └── schema.prisma              # Complete user-isolated schema (211 lines)
├── src/                           # Main application source
│   ├── routes/                    # File-based TanStack routing
│   ├── components/                # React components (UI, layout, providers)
│   ├── hooks/                     # Custom React hooks for data management
│   ├── __tests__/                 # Comprehensive test suite
│   └── [other source files]
├── package.json                   # Modern dependencies, TanStack ecosystem
└── [config files]                # ESLint, TypeScript, Vite configuration
```

### Key Modules and Their Purpose

- **Authentication System**: `lib/trpc.ts` + `lib/routers/auth.ts` - JWT middleware ready for implementation
- **Database Layer**: `lib/db.ts` + `prisma/schema.prisma` - User-isolated multi-tenant design
- **API Layer**: `lib/routers/` - tRPC procedures with protected/public patterns
- **Schema Validation**: `lib/schemas.ts` - Zod schemas exactly matching Prisma models
- **Frontend Framework**: `src/routes/__root.tsx` - Root component with provider integration
- **Testing Infrastructure**: `src/__tests__/` - Vitest setup with comprehensive coverage

## Data Models and APIs

### Database Architecture (PostgreSQL + Prisma)

The database implements strict user isolation with comprehensive indexing:

**Key Design Patterns**:

- All main tables include `userId` foreign key for multi-tenant isolation
- JSONB fields for flexible metadata (e.g., `bambuMetadata` in variants)
- Comprehensive indexing for performance (user-based, status-based, time-based)
- Row Level Security architecture ready for implementation

**Core Tables**:

- **users**: Authentication and profile with JSONB preferences
- **models**: 3D model metadata with category classification
- **model_variants**: Sliced files with complete Bambu Studio metadata
- **filaments**: Material specifications with cost tracking and demand counts
- **filament_inventory**: Physical spool tracking with low stock alerts
- **filament_requirements**: Links variants to required filaments (AMS slots)
- **print_jobs**: Queue management with status tracking and estimates

**Reference Schema Files**:

- **Complete Schema**: `prisma/schema.prisma` (211 lines with enums, indexes, relationships)
- **Zod Validation**: `lib/schemas.ts` (185 lines with runtime validation)

### API Architecture (tRPC)

**Current State**: tRPC infrastructure is established with authentication middleware placeholders ready for JWT integration.

**Router Structure** (in `lib/routers/`):

- **`_app.ts`**: Main router aggregation
- **`auth.ts`**: Authentication procedures (placeholder - needs JWT implementation)
- **`filaments.ts`**: Filament management with user isolation
- **`models.ts`**: 3D model CRUD operations
- **`variants.ts`**: Model variant management with Bambu metadata
- **`queue.ts`**: Print job queue management

**Authentication Middleware** (in `lib/trpc.ts`):

```typescript
// CURRENT STATE: Placeholder ready for JWT implementation
const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User must be authenticated',
    })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
```

**Type Safety**: Complete end-to-end type safety with Zod schema validation and TypeScript inference.

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Authentication Implementation Gap**:
   - **Location**: `lib/trpc.ts` lines 14-19, `lib/routers/auth.ts`
   - **Issue**: JWT validation is placeholder code, no real authentication provider integration
   - **Impact**: All protected procedures currently non-functional
   - **Solution**: Story 0.5 addresses this with Clerk/Auth0 integration

2. **Database Mock in tRPC**:
   - **Location**: `lib/trpc.ts` line 6
   - **Issue**: `const db = {} as any` - mock database reference
   - **Impact**: tRPC context doesn't have real database access
   - **Solution**: Replace with actual Prisma client import

3. **Missing Environment Validation**:
   - **Issue**: No runtime validation of required environment variables
   - **Impact**: Potential runtime failures in production
   - **Solution**: Add Zod-based environment validation

### Known Limitations and Workarounds

- **Development Database**: Uses global Prisma instance pattern for development (acceptable for current stage)
- **Test Coverage**: Comprehensive test structure exists but needs expansion for authentication flows
- **Error Handling**: Basic tRPC error handling in place, needs expansion for production scenarios

## Integration Points and External Dependencies

### External Services (Planned)

| Service       | Purpose                  | Integration Status    | Key Files                            |
| ------------- | ------------------------ | --------------------- | ------------------------------------ |
| Auth Provider | JWT authentication       | To Be Implemented     | `lib/trpc.ts`, `lib/routers/auth.ts` |
| File Storage  | STL/3MF file storage     | Future Implementation | TBD                                  |
| Print Service | 3D printer communication | Future Implementation | TBD                                  |

### Internal Integration Points

- **Frontend ↔ Backend**: tRPC with React Query for type-safe data fetching
- **Database ↔ API**: Prisma ORM with Zod validation alignment
- **Authentication ↔ Authorization**: Middleware-based protection with user context injection
- **Testing ↔ Application**: Vitest with comprehensive test utilities and mocks

## Development and Deployment

### Local Development Setup (Actual Working Steps)

1. **Prerequisites**: Node.js with ES module support, PostgreSQL database
2. **Installation**: `npm install` (installs all TanStack ecosystem dependencies)
3. **Database Setup**: Configure `DATABASE_URL` environment variable
4. **Prisma Setup**: `npx prisma generate && npx prisma migrate dev`
5. **Development Server**: `npm run dev` (starts on port 3000 with HMR)

### Build and Deployment Process

- **Development**: `npm run dev` - Vite dev server with instant HMR
- **Build**: `npm run build` - Nitro universal build system
- **Production**: `npm run start` - Serves from `.output/server/index.mjs`
- **Testing**: `npm run test` - Vitest with jsdom for component testing
- **Quality**: `npm run check` - ESLint + Prettier formatting

### Environment Configuration

**Required Variables**:

```env
DATABASE_URL=postgresql://...
NODE_ENV=development|production|test
JWT_SECRET=<to-be-configured>  # For Story 0.5 implementation
```

## Testing Reality

### Current Test Coverage

- **Test Framework**: Vitest 3.0.5 with jsdom for React components
- **Test Location**: `src/__tests__/` with comprehensive setup
- **Existing Tests**:
  - Setup validation tests
  - Build verification tests
  - tRPC procedure validation tests
  - Component smoke tests
- **Coverage**: Basic infrastructure testing, needs expansion for authentication flows

### Test Execution

```bash
npm test                    # Run all tests with Vitest
```

### Testing Patterns

- **Setup**: `src/__tests__/setup.ts` - Test environment configuration
- **Utilities**: React Testing Library for component testing
- **Mocking**: Built-in Vitest mocking capabilities
- **Integration**: tRPC procedure testing with mock contexts

## Authentication Framework Implementation (Story 0.5 Focus)

### Current Authentication State

**Infrastructure Ready**:

- tRPC authentication middleware structure exists (`requireAuth` pattern)
- Protected procedure pattern established (`protectedProcedure`)
- User context type definitions in place
- Database users table ready with proper fields

**Missing Implementation**:

- JWT validation logic in `lib/trpc.ts`
- Authentication provider integration (Clerk/Auth0)
- Authentication UI components
- Session management with Redis
- Role-based access control implementation

### Files That Will Need Modification for Authentication

Based on Story 0.5 requirements and current analysis:

**Core Authentication Files**:

- **`lib/trpc.ts`**: Implement JWT validation in `requireAuth` middleware
- **`lib/routers/auth.ts`**: Implement authentication procedures (`me`, `updateProfile`)
- **`lib/db.ts`**: May need session management integration

**Frontend Integration**:

- **`src/routes/__root.tsx`**: Add authentication provider wrapper
- **`src/components/providers/`**: New authentication context provider
- **`src/components/auth/`**: New directory for login/signup components
- **`src/hooks/useAuth.ts`**: New authentication state management hook

**Configuration**:

- **Environment variables**: JWT secrets and provider configuration
- **Prisma schema**: May need authentication provider field additions

### Authentication Integration Considerations

- **User Isolation**: Authentication must enforce `userId` context for all database operations
- **Session Management**: Integration with Redis for development (as specified in Story 0.5)
- **UI Integration**: React Aria components for accessible authentication forms
- **Testing**: Comprehensive authentication flow testing required

## Performance Characteristics

### Runtime Performance

- **Database**: Prisma connection pooling with optimized queries
- **Frontend**: React 19 with improved rendering performance
- **API**: tRPC with efficient serialization (SuperJSON)
- **Build**: Vite with tree-shaking and code splitting

### Development Performance

- **HMR**: Sub-second updates with Vite
- **Type Checking**: Incremental TypeScript compilation
- **Testing**: Fast test execution with Vitest
- **Linting**: Cached ESLint for rapid feedback

## Security Implementation

### Current Security Measures

- **Type Safety**: Prevents common runtime errors
- **Input Validation**: Zod schemas validate all tRPC inputs
- **User Isolation**: Database schema designed for multi-tenant isolation
- **SQL Injection Prevention**: Prisma query builder

### Security Gaps (To Be Addressed)

- **Authentication**: No real authentication implementation yet
- **Authorization**: Role-based access control not implemented
- **Session Security**: JWT handling and session management missing
- **Environment Security**: No runtime environment validation

## Monitoring and Observability

### Current Monitoring

- **Development**: TanStack devtools for React Query and Router
- **Database**: Prisma query logging in development
- **Build**: Vite build analysis and performance metrics

### Production Monitoring (Planned)

- Application performance monitoring integration
- Error tracking and reporting
- Database query performance monitoring
- Authentication and security event logging

## Appendix - Useful Commands and Scripts

### Development Commands

```bash
# Core development workflow
npm run dev         # Start development server with HMR (port 3000)
npm run build       # Production build with Nitro
npm run start       # Production server from .output/
npm run test        # Run Vitest test suite
npm run check       # ESLint + Prettier formatting

# Database operations
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create and apply migrations
npx prisma studio      # Database GUI (optional)

# Quality assurance
npm run lint        # ESLint checking only
npm run format      # Prettier formatting only
```

### Debugging and Troubleshooting

- **Development Issues**: Check Vite console for build errors
- **Database Issues**: Verify `DATABASE_URL` and PostgreSQL connection
- **Type Errors**: Run `npx tsc --noEmit` for TypeScript checking
- **Test Failures**: Use `npm run test -- --reporter=verbose` for detailed output
- **tRPC Issues**: Enable query logging in Prisma client for database debugging

### Authentication Development (Story 0.5)

When implementing authentication:

1. **Environment Setup**: Configure JWT secrets and auth provider credentials
2. **Database Migration**: May need additional fields for auth provider integration
3. **Middleware Implementation**: Replace placeholder JWT validation in `lib/trpc.ts`
4. **Frontend Integration**: Add authentication provider to root component
5. **Testing**: Implement authentication flow testing with mock providers

## Summary

The FM5 codebase represents a well-architected modern full-stack application with excellent foundations for the authentication framework implementation in Story 0.5. Key strengths include:

- **Type Safety**: Complete end-to-end type safety from database to frontend
- **Modern Architecture**: TanStack ecosystem providing excellent developer experience
- **Database Design**: User-isolated multi-tenant architecture ready for production
- **Testing Foundation**: Comprehensive test setup ready for authentication testing
- **Documentation**: Excellent project documentation and story-driven development

**Ready for Authentication Implementation**: The authentication infrastructure is well-prepared with middleware patterns, user schema, and integration points clearly defined. Story 0.5 can proceed with confidence based on this solid foundation.

**Development Focus**: The authentication framework implementation (JWT validation, provider integration, UI components, and testing) represents the next critical milestone for the platform's evolution toward a production-ready 3D printing management system.
