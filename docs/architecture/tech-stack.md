# FM5 Technology Stack

## Overview

FM5 (Filament Manager v5) is built on a modern, type-safe full-stack architecture designed for performance, developer experience, and scalability. This document details the complete technology stack and the rationale behind each technology choice.

## Core Architecture Philosophy

- **Type Safety First**: End-to-end type safety from database to frontend
- **Modern React**: Leveraging React 19 and the TanStack ecosystem
- **Performance Optimized**: Built for fast development and production performance
- **Developer Experience**: Hot reloading, excellent debugging, and modern tooling
- **User Data Isolation**: Multi-tenant architecture with strict user data separation

## Frontend Technology Stack

### React Ecosystem

#### React 19.0.0

- **Purpose**: Core UI library with latest features
- **Key Features**:
  - Server Components support
  - Enhanced concurrent features
  - Improved hydration performance
  - Built-in optimizations for modern browsers

#### TanStack Router 1.130.2

- **Purpose**: Type-safe file-based routing
- **Key Features**:
  - File-based route generation
  - Type-safe navigation
  - Route loaders for data fetching
  - Built-in code splitting
- **Configuration**: Routes in `src/routes/` with auto-generated route tree

```typescript
// Example route definition
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/models',
  loader: async () => {
    // Type-safe data loading
  },
  component: ModelsPage,
})
```

#### TanStack Query 5.89.0

- **Purpose**: Server state management and caching
- **Integration**: Seamlessly integrated with tRPC
- **Features**:
  - Automatic background refetching
  - Optimistic updates
  - Offline support
  - Devtools integration

#### TanStack Form 1.23.0

- **Purpose**: Type-safe form handling
- **Features**:
  - Schema validation integration
  - Field-level validation
  - Optimized re-renders
  - Accessibility support

#### React Aria Components 1.12.2

- **Purpose**: Accessible UI components
- **Rationale**: Ensures WCAG compliance out of the box
- **Integration**: Foundation for custom component library

### Styling and UI

#### Tailwind CSS 4.0.6

- **Purpose**: Utility-first CSS framework
- **Configuration**: Custom design system integration
- **Benefits**:
  - Rapid UI development
  - Consistent design system
  - Excellent tree-shaking
  - JIT compilation for performance

```typescript
// Tailwind integration with Vite
import '@tailwindcss/vite'
```

#### Styling Architecture

- **Global Styles**: `src/styles.css` for base styles
- **Component Styles**: Tailwind classes with consistent patterns
- **Theme System**: Custom CSS variables for brand colors

### Development and Build Tools

#### Vite 6.3.5

- **Purpose**: Build tool and development server
- **Features**:
  - Lightning-fast HMR
  - Optimized production builds
  - Plugin ecosystem
  - Native ES modules

```typescript
// Vite configuration
export default {
  plugins: [react(), '@tanstack/router-plugin', '@tailwindcss/vite'],
  server: {
    port: 3000,
  },
}
```

#### TypeScript 5.7.2

- **Purpose**: Type safety and developer experience
- **Configuration**: Strict mode enabled
- **Integration**: Full stack type safety with tRPC

## Backend Technology Stack

### Runtime and Framework

#### Node.js (ES Modules)

- **Type**: `"module"` in package.json
- **Features**: Native ES module support for modern JavaScript

#### TanStack Start 1.131.7

- **Purpose**: Full-stack React framework
- **Features**:
  - Server-side rendering
  - API routes
  - File-based routing
  - Production optimizations

### API Layer

#### tRPC 11.5.1

- **Purpose**: End-to-end type-safe API
- **Components**:
  - `@trpc/server`: Server-side procedures
  - `@trpc/client`: Type-safe client
  - `@trpc/react-query`: React integration
  - `@trpc/next`: TanStack integration

```typescript
// tRPC router example
export const appRouter = createTRPCRouter({
  filaments: filamentsRouter,
  models: modelsRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
```

#### SuperJSON 2.2.2

- **Purpose**: JSON serialization with type preservation
- **Features**:
  - Date object preservation
  - undefined handling
  - BigInt support
  - Custom transformers

### Database Stack

#### PostgreSQL

- **Purpose**: Primary database
- **Features**:
  - JSONB for flexible metadata storage
  - Full-text search capabilities
  - Row Level Security for user isolation
  - Advanced indexing and performance

#### Prisma 6.16.2

- **Purpose**: Database ORM and migration tool
- **Components**:
  - `prisma`: CLI tool for migrations
  - `@prisma/client`: Type-safe database client

```typescript
// Prisma client configuration
export const prisma = new PrismaClient({
  log: ['query'], // Development logging
})
```

#### Database Schema Features

- **User Isolation**: All tables include `userId` foreign key
- **JSONB Fields**: Flexible metadata storage (e.g., `bambuMetadata`)
- **Enums**: Type-safe status and category fields
- **Indexes**: Optimized for common query patterns

### Schema Validation

#### Zod 4.1.11

- **Purpose**: Runtime schema validation
- **Integration**:
  - tRPC input/output validation
  - Form validation
  - Environment variable validation
  - Database schema matching

```typescript
// Schema definition matching Prisma model
export const FilamentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  brand: z.string(),
  materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  // ... other fields
})

export type Filament = z.infer<typeof FilamentSchema>
```

#### ArkType 2.1.22

- **Purpose**: Alternative type validation system
- **Status**: Present in dependencies, may be used for specific validation cases
- **Note**: Project primarily uses Zod for consistency

## Testing Infrastructure

### Testing Framework

#### Vitest 3.0.5

- **Purpose**: Fast unit and integration testing
- **Features**:
  - Native ES modules support
  - TypeScript support
  - Mock capabilities
  - Coverage reporting

#### React Testing Library 16.2.0

- **Purpose**: Component testing utilities
- **Philosophy**: Testing from user perspective
- **Integration**: Works seamlessly with Vitest

#### jsdom 26.0.0

- **Purpose**: DOM simulation for testing
- **Usage**: Enables React component testing in Node.js environment

```typescript
// Test configuration
export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
}
```

### Testing Strategy

- **Unit Tests**: Pure functions, hooks, utilities
- **Integration Tests**: tRPC procedures, database operations
- **Component Tests**: UI components with React Testing Library
- **Smoke Tests**: Build verification and basic functionality

## Development Tools

### Code Quality

#### ESLint

- **Configuration**: `@tanstack/eslint-config`
- **Purpose**: Code linting and consistency
- **Integration**: Automated fixing with Prettier

#### Prettier 3.5.3

- **Purpose**: Code formatting
- **Configuration**: Standard settings with minor customizations
- **Integration**: ESLint integration for conflict resolution

### Development Experience

#### TanStack Devtools

- **Components**:
  - React Query Devtools
  - Router Devtools
- **Features**:
  - Query inspection
  - Route debugging
  - Performance monitoring

```typescript
// Devtools integration
<TanstackDevtools
  config={{ position: 'bottom-left' }}
  plugins={[
    {
      name: 'Tanstack Router',
      render: <TanStackRouterDevtoolsPanel />,
    },
  ]}
/>
```

#### Hot Module Replacement

- **Vite HMR**: Instant feedback during development
- **React Fast Refresh**: Preserves component state during updates

## Deployment and Build

### Build System

#### Nitro

- **Purpose**: Universal deployment
- **Features**:
  - Multiple deployment targets
  - Edge runtime support
  - Automatic optimizations
  - Static site generation

#### Build Outputs

- **`.output/`**: Production build artifacts
- **`public/`**: Static assets
- **Server**: Universal server bundle

### Environment Configuration

#### Environment Variables

```typescript
// Required environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=development|production|test
```

#### Development vs Production

- **Development**:
  - Prisma query logging enabled
  - Devtools enabled
  - Hot reloading
- **Production**:
  - Optimized bundles
  - Error reporting
  - Performance monitoring

## Package Management

### Dependency Strategy

- **Main Dependencies**: Production runtime requirements
- **Dev Dependencies**: Development and build tools only
- **Peer Dependencies**: Handled automatically by package managers

### Version Management

- **Semantic Versioning**: All packages use semver
- **Lock Files**: `package-lock.json` for deterministic builds
- **Regular Updates**: Frequent updates to latest stable versions

### Key Dependency Categories

#### Core Runtime (Production)

```json
{
  "react": "^19.0.0",
  "@tanstack/react-start": "^1.131.7",
  "@trpc/server": "^11.5.1",
  "@prisma/client": "^6.16.2",
  "zod": "^4.1.11"
}
```

#### Development Tools

```json
{
  "typescript": "^5.7.2",
  "vite": "^6.3.5",
  "vitest": "^3.0.5",
  "@types/node": "^24.5.2",
  "prettier": "^3.5.3"
}
```

## Performance Characteristics

### Bundle Size Optimization

- **Tree Shaking**: Vite eliminates unused code
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Dynamic imports for large components

### Runtime Performance

- **React 19**: Improved rendering performance
- **TanStack Query**: Intelligent caching and background updates
- **Prisma**: Optimized database queries with connection pooling

### Development Performance

- **Vite**: Sub-second cold starts and instant HMR
- **TypeScript**: Incremental compilation
- **ESLint**: Fast linting with caching

## Security Considerations

### Type Safety

- **End-to-End**: From database to frontend
- **Runtime Validation**: Zod schemas prevent invalid data
- **SQL Injection Prevention**: Prisma query builder

### Authentication and Authorization

- **JWT Tokens**: Secure user authentication (to be implemented)
- **User Isolation**: Database-level user data separation
- **tRPC Middleware**: Authentication enforcement

### Data Protection

- **Environment Variables**: Sensitive configuration externalized
- **CORS**: Proper cross-origin request handling
- **Input Validation**: All user inputs validated with Zod

## Migration and Upgrade Strategy

### Database Migrations

- **Prisma Migrate**: Schema versioning and deployment
- **Rollback Support**: Safe schema changes
- **Data Migrations**: Custom scripts for data transformations

### Package Updates

- **Regular Updates**: Monthly dependency reviews
- **Breaking Changes**: Careful evaluation and testing
- **LTS Strategy**: Preference for stable, supported versions

## Future Technology Considerations

### Planned Additions

- **Authentication Provider**: Clerk or Auth0 integration
- **File Processing**: STL/3MF file handling capabilities
- **Background Jobs**: Queue system for print job management
- **Monitoring**: Application performance monitoring

### Potential Upgrades

- **React Server Components**: Enhanced SSR capabilities
- **Edge Runtime**: Global deployment optimization
- **Streaming**: Real-time updates for print job status

## Development Commands

### Available Scripts

```bash
npm run dev       # Development server with HMR
npm run build     # Production build
npm run start     # Production server
npm run test      # Run test suite
npm run lint      # ESLint checking
npm run format    # Prettier formatting
npm run check     # Format + lint fix
```

### Development Workflow

1. **Setup**: `npm install` - Install dependencies
2. **Development**: `npm run dev` - Start development server
3. **Testing**: `npm run test` - Run tests during development
4. **Quality**: `npm run check` - Format and lint before commit
5. **Build**: `npm run build` - Prepare for production

## Summary

The FM5 technology stack represents a modern, type-safe, and performance-oriented approach to full-stack development. Key strengths include:

- **Developer Experience**: Excellent tooling and fast development cycles
- **Type Safety**: End-to-end type safety prevents runtime errors
- **Performance**: Modern build tools and runtime optimizations
- **Scalability**: User isolation and efficient database patterns
- **Maintainability**: Consistent patterns and excellent documentation

This stack enables rapid development while maintaining high code quality and excellent user experience.
