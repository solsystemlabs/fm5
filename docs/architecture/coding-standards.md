# FM5 Coding Standards

## Overview

This document outlines the coding standards, patterns, and conventions used in the FM5 (Filament Manager v5) 3D Printing Business Management Platform. These standards ensure consistency, maintainability, and alignment with modern development practices.

## Language and Framework Standards

### TypeScript Standards

#### Type Definitions
```typescript
// ✅ GOOD: Use Zod schema inference for types
export type User = z.infer<typeof UserSchema>

// ✅ GOOD: Explicit return types for functions
function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

// ❌ AVOID: Manual type definitions that duplicate schema
interface UserManual {
  id: string
  email: string
  // ... duplicating what's already in Zod
}
```

#### Strict TypeScript Configuration
- Enable strict mode: `"strict": true`
- No implicit any: `"noImplicitAny": true`
- Use `unknown` instead of `any` for truly unknown types
- Prefer `const assertions` for literal types

### React and JSX Standards

#### Component Patterns
```typescript
// ✅ GOOD: Function components with TypeScript
interface HeaderProps {
  user?: User
  onLogout: () => void
}

function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      {/* Component content */}
    </header>
  )
}

// ✅ GOOD: Custom hooks pattern
function useFilaments() {
  return trpc.filaments.list.useQuery()
}
```

#### Component Organization
- **One component per file** (except for small, tightly coupled sub-components)
- **Named exports** for components (not default exports)
- **Props interfaces** co-located with component
- **JSDoc comments** for public component APIs

## Project Architecture Patterns

### tRPC Procedure Standards

#### Router Organization
```typescript
// lib/routers/filaments.ts
export const filamentsRouter = createTRPCRouter({
  // ✅ GOOD: Descriptive procedure names
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
      // Implementation with user isolation
      return await ctx.db.filament.findMany({
        where: {
          userId: ctx.user.id, // ✅ User isolation enforced
          ...(input.search && {
            OR: [
              { brand: { contains: input.search, mode: 'insensitive' } },
              { colorName: { contains: input.search, mode: 'insensitive' } }
            ]
          }),
          ...(input.materialType && { materialType: input.materialType })
        },
        take: input.limit,
        skip: input.offset,
        orderBy: { createdAt: 'desc' }
      })
    }),

  create: protectedProcedure
    .input(FilamentSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.filament.create({
        data: {
          ...input,
          userId: ctx.user.id // ✅ User isolation enforced
        }
      })
    })
})
```

#### Authentication and Authorization
```typescript
// ✅ GOOD: Protected procedures for user data
export const protectedProcedure = t.procedure.use(requireAuth)

// ✅ GOOD: User isolation in all queries
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

### Database Access Patterns

#### User Isolation (Row Level Security)
```typescript
// ✅ GOOD: Always include userId in queries
async function getModelsForUser(userId: string) {
  return prisma.model.findMany({
    where: { userId }, // User isolation
    include: {
      variants: {
        where: { userId } // Consistent isolation in relations
      }
    }
  })
}

// ❌ NEVER: Global queries without user context
async function getAllModels() {
  return prisma.model.findMany() // Security vulnerability!
}
```

#### Database Transaction Patterns
```typescript
// ✅ GOOD: Use transactions for multi-table operations
async function createModelWithVariant(data: CreateModelWithVariantInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const model = await tx.model.create({
      data: { ...data.model, userId }
    })

    const variant = await tx.modelVariant.create({
      data: { ...data.variant, modelId: model.id, userId }
    })

    return { model, variant }
  })
}
```

### Schema Validation Patterns

#### Zod Schema Organization
```typescript
// ✅ GOOD: Schemas match Prisma models exactly
export const FilamentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  brand: z.string(),
  materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  // ... other fields
})

// ✅ GOOD: Input schemas derived from main schemas
export const CreateFilamentInput = FilamentSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
})
```

## File and Directory Organization

### Naming Conventions

#### Files and Directories
```
✅ GOOD:
components/
├── ui/Button.tsx                 # PascalCase for components
├── layout/Header.tsx
└── providers/TRPCProvider.tsx

hooks/
├── useFilaments.ts              # camelCase starting with 'use'
├── useModels.ts
└── usePrintQueue.ts

lib/
├── schemas.ts                   # camelCase for utilities
├── trpc.ts
└── utils.ts

❌ AVOID:
components/button.tsx            # lowercase
hooks/filaments.ts              # missing 'use' prefix
lib/SCHEMAS.ts                  # UPPERCASE
```

#### Variable and Function Names
```typescript
// ✅ GOOD: Descriptive, camelCase
const filamentInventory = await getFilamentInventory(userId)
const printJobsInProgress = await getPrintJobsByStatus('printing')

// ✅ GOOD: Boolean prefixes
const isAuthenticated = !!user
const hasFilamentInStock = inventory.quantityGrams > 0
const canStartPrintJob = isAuthenticated && hasFilamentInStock

// ❌ AVOID: Abbreviated or unclear names
const fInv = await getFilInv(uid)
const jobs = await getJobs('printing')
```

### Import Organization
```typescript
// ✅ GOOD: Import order
// 1. External libraries
import React from 'react'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

// 2. Internal utilities and types
import { prisma } from '~/lib/db'
import { UserSchema, type User } from '~/lib/schemas'

// 3. Relative imports
import { Header } from './Header'
import { useFilaments } from '../hooks/useFilaments'
```

## Testing Standards

### Test Organization
```typescript
// src/__tests__/filaments.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestUser, cleanupTestData } from './helpers/test-utils'

describe('Filament Management', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  it('should create filament with user isolation', async () => {
    const user = await createTestUser()

    const filament = await trpc.filaments.create.mutate({
      brand: 'Test Brand',
      materialType: 'PLA',
      colorName: 'Red',
      colorHex: '#FF0000',
      costPerGramBase: 0.025
    }, { context: { user } })

    expect(filament.userId).toBe(user.id)
  })
})
```

### Test Naming
```typescript
// ✅ GOOD: Descriptive test names
it('should return only user-owned filaments when listing')
it('should throw UNAUTHORIZED when user not authenticated')
it('should update filament inventory when print job completes')

// ❌ AVOID: Generic test names
it('should work')
it('test create')
it('returns data')
```

## Error Handling Standards

### tRPC Error Patterns
```typescript
// ✅ GOOD: Specific error codes and messages
if (!userCanAccessModel(ctx.user.id, modelId)) {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'You do not have access to this model'
  })
}

if (!input.email || !isValidEmail(input.email)) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Valid email address is required'
  })
}
```

### Database Error Handling
```typescript
// ✅ GOOD: Handle Prisma errors appropriately
try {
  return await prisma.filament.create({ data: filamentData })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') { // Unique constraint violation
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A filament with these specifications already exists'
      })
    }
  }
  throw error // Re-throw unknown errors
}
```

## Security Standards

### Authentication Requirements
```typescript
// ✅ GOOD: All user data operations require authentication
export const filamentsRouter = createTRPCRouter({
  list: protectedProcedure, // ✅ Protected
  create: protectedProcedure, // ✅ Protected
  update: protectedProcedure, // ✅ Protected
  delete: protectedProcedure, // ✅ Protected
})

// ❌ NEVER: User data accessible without authentication
export const filamentsRouter = createTRPCRouter({
  list: publicProcedure, // ❌ Security vulnerability!
})
```

### Input Validation
```typescript
// ✅ GOOD: Validate all inputs with Zod
const updateFilament = protectedProcedure
  .input(z.object({
    id: z.string().uuid(),
    updates: FilamentSchema.partial().omit({ id: true, userId: true })
  }))
  .mutation(async ({ input, ctx }) => {
    // Input is validated by Zod before reaching this point
  })
```

### User Data Isolation
```typescript
// ✅ GOOD: Verify ownership before operations
async function updateFilament(filamentId: string, updates: Partial<Filament>, userId: string) {
  const existingFilament = await prisma.filament.findFirst({
    where: { id: filamentId, userId } // ✅ Verify ownership
  })

  if (!existingFilament) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Filament not found or you do not have access to it'
    })
  }

  return prisma.filament.update({
    where: { id: filamentId },
    data: updates
  })
}
```

## Performance Standards

### Database Query Optimization
```typescript
// ✅ GOOD: Use appropriate indexes and select only needed fields
const filaments = await prisma.filament.findMany({
  where: {
    userId, // ✅ Indexed field
    materialType: 'PLA' // ✅ Indexed field
  },
  select: { // ✅ Select only needed fields
    id: true,
    brand: true,
    colorName: true,
    colorHex: true,
    quantityGrams: true
  },
  take: 20, // ✅ Limit results
  orderBy: { createdAt: 'desc' } // ✅ Use indexed field for ordering
})
```

### React Performance
```typescript
// ✅ GOOD: Memoize expensive computations
const expensiveData = useMemo(() => {
  return filaments.map(f => calculateFilamentCost(f))
}, [filaments])

// ✅ GOOD: Optimize re-renders with React.memo
const FilamentCard = React.memo<FilamentCardProps>(({ filament }) => {
  return <div>{/* Component content */}</div>
})
```

## Documentation Standards

### Code Comments
```typescript
/**
 * Calculates the total cost to produce a print job including material and waste.
 *
 * @param variant - The model variant with print settings
 * @param filamentInventory - Available filament spools
 * @returns Total cost in USD including material, waste, and purge costs
 */
function calculatePrintJobCost(
  variant: ModelVariant,
  filamentInventory: FilamentInventory[]
): number {
  // Implementation details...
}
```

### API Documentation
```typescript
// tRPC procedures are self-documenting through TypeScript types
export const filamentsRouter = createTRPCRouter({
  /**
   * Get paginated list of filaments for the authenticated user.
   * Supports filtering by material type and search text.
   */
  list: protectedProcedure
    .meta({
      description: 'List user filaments with filtering and pagination'
    })
    .input(/* ... */)
    .query(/* ... */),
})
```

## Linting and Formatting

### ESLint Configuration
The project uses `@tanstack/eslint-config` with additional rules:

```javascript
// eslint.config.js
export default [
  ...tanstackConfig,
  {
    rules: {
      // Enforce consistent imports
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always'
      }],
      // Require explicit return types for exported functions
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true
      }]
    }
  }
]
```

### Prettier Configuration
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

## Deployment and Build Standards

### Environment Configuration
```typescript
// ✅ GOOD: Validate environment variables
const config = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test'])
}).parse(process.env)
```

### Build Optimization
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          trpc: ['@trpc/client', '@trpc/server', '@trpc/react-query']
        }
      }
    }
  }
}
```

## Migration and Deprecation Standards

### Database Migrations
```sql
-- migrations/001_add_filament_demand_tracking.sql
-- Add demand tracking to filaments table
ALTER TABLE filaments ADD COLUMN demand_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX idx_filaments_demand_count ON filaments(demand_count DESC);

-- Update existing records
UPDATE filaments SET demand_count = (
  SELECT COUNT(*) FROM filament_requirements WHERE filament_id = filaments.id
);
```

### Code Deprecation
```typescript
/**
 * @deprecated Use `getFilamentInventory` instead. This function will be removed in v6.
 */
function getFilamentStock(userId: string) {
  console.warn('getFilamentStock is deprecated. Use getFilamentInventory instead.')
  return getFilamentInventory(userId)
}
```

## Summary Checklist

Before submitting code, ensure:

- [ ] TypeScript strict mode passes without errors
- [ ] All user data operations are protected with authentication
- [ ] User isolation is enforced in all database queries
- [ ] Input validation uses Zod schemas
- [ ] Tests are written for new functionality
- [ ] Code follows naming conventions
- [ ] ESLint and Prettier formatting is applied
- [ ] Error handling includes appropriate error codes
- [ ] Performance considerations are addressed
- [ ] Documentation is updated for public APIs