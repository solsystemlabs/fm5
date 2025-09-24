import { z } from 'zod'

// =============================================================================
// ZOD SCHEMA DEFINITIONS MATCHING PRISMA MODELS
// =============================================================================

// User Roles Enum
export const UserRoleEnum = z.enum(['owner', 'operator', 'viewer'])
export type UserRole = z.infer<typeof UserRoleEnum>

// User Authentication Schema (BetterAuth compatible)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  // BetterAuth fields
  emailVerified: z.boolean(),
  image: z.string().optional(),
  // Role-based access control
  role: UserRoleEnum,
  // Business profile fields
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  preferences: z.object({
    units: z.enum(['metric', 'imperial']).optional(),
    defaultFilamentBrand: z.string().optional(),
    notifications: z
      .object({
        email: z.boolean(),
        lowStock: z.boolean(),
        printComplete: z.boolean(),
        systemUpdates: z.boolean(),
      })
      .optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
})

// BetterAuth Session Schema
export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// BetterAuth Account Schema
export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  expiresAt: z.date().optional(),
  password: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Core Model Types using Zod (with user isolation)
export const ModelSchema = z.object({
  id: z.string(),
  userId: z.string(), // User isolation
  name: z.string(),
  designer: z.string(),
  description: z.string().optional(),
  imageUrls: z.array(z.string()),
  category: z.enum(['keychain', 'earring', 'decoration', 'functional']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ModelVariantSchema = z.object({
  id: z.string(),
  userId: z.string(), // User isolation
  modelId: z.string(),
  name: z.string(),
  version: z.number(),
  slicedFileUrl: z.string(),

  // Fast-access structured fields
  layerHeight: z.number(),
  nozzleTemperature: z.number(),
  bedTemperature: z.number(),
  printDurationMinutes: z.number(),

  // Complete Bambu Studio metadata (JSONB)
  bambuMetadata: z.unknown(), // JSONB field - validated separately

  // Business metrics
  costToProduceUsd: z.number(),
  successRatePercentage: z.number(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

// Filament specification (separate from inventory, user-isolated)
export const FilamentSchema = z.object({
  id: z.string(),
  userId: z.string(), // User isolation
  brand: z.string(),
  materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']),
  colorName: z.string(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // hex color validation
  costPerGramBase: z.number(),
  purchaseUrl: z.string().url().optional(),
  demandCount: z.number(), // how many variants use this filament
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Physical filament inventory (spools in stock, user-isolated)
export const FilamentInventorySchema = z.object({
  id: z.string(),
  userId: z.string(), // User isolation
  filamentId: z.string(), // reference to Filament
  batchIdentifier: z.string().optional(),
  quantityGrams: z.number(),
  actualCostPerGram: z.number(),
  lowStockThreshold: z.number(),
  purchaseDate: z.date().optional(),
  expiryDate: z.date().optional(),
  createdAt: z.date(),
  lastUpdated: z.date(),
})

// Filament requirements (link between variants and filaments)
export const FilamentRequirementSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  filamentId: z.string(),
  amsSlot: z.number(),
  usageModel: z.number(), // grams used for model
  usageWaste: z.number(), // grams wasted
  usagePurge: z.number(), // grams used for purging
  createdAt: z.date(),
})

export const PrintJobSchema = z.object({
  id: z.string(),
  userId: z.string(), // User isolation
  variantId: z.string(),
  status: z.enum(['queued', 'printing', 'completed', 'failed']),
  priority: z.number(),
  estimatedStartTime: z.date().optional(),
  estimatedCompletionTime: z.date().optional(),
  actualCompletionTime: z.date().optional(),
  failureReason: z.string().optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  createdAt: z.date(),
})

// Bambu Studio Metadata Structure
export const BambuMetadataSchema = z.object({
  // Filament Information
  filaments: z.array(
    z.object({
      type: z.string(),
      brand: z.string(),
      color: z.string(),
      colorHex: z.string(),
      amsSlot: z.number(),
      usageModel: z.number(),
      usageWaste: z.number(),
      usagePurge: z.number(),
    }),
  ),

  // Print Settings
  nozzleSize: z.number(),
  layerHeight: z.number(),

  // Brim Settings
  brimWidth: z.number(),
  brimType: z.string(),
  brimOffset: z.number(),

  // Time Calculations
  printTime: z.object({
    totalMinutes: z.number(),
    modelTime: z.number(),
    supportTime: z.number(),
    purgeTime: z.number(),
  }),

  // All other Bambu Studio parameters (600+ fields)
  // Stored as JSONB and validated separately for flexibility
  rawMetadata: z.unknown(),
})

// =============================================================================
// INFER TYPESCRIPT TYPES FROM ZOD SCHEMAS
// =============================================================================

export type User = z.infer<typeof UserSchema>
export type Model = z.infer<typeof ModelSchema>
export type ModelVariant = z.infer<typeof ModelVariantSchema>
export type Filament = z.infer<typeof FilamentSchema>
export type FilamentInventory = z.infer<typeof FilamentInventorySchema>
export type FilamentRequirement = z.infer<typeof FilamentRequirementSchema>
export type PrintJob = z.infer<typeof PrintJobSchema>
export type BambuMetadata = z.infer<typeof BambuMetadataSchema>

// =============================================================================
// EXPORT ALL SCHEMAS FOR USE WITH TRPC AND VALIDATION
// =============================================================================

export const schemas = {
  UserSchema,
  ModelSchema,
  ModelVariantSchema,
  FilamentSchema,
  FilamentInventorySchema,
  FilamentRequirementSchema,
  PrintJobSchema,
  BambuMetadataSchema,
} as const
