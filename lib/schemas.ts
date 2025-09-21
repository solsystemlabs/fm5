import { type } from 'arktype'

// =============================================================================
// ARKTYPE SCHEMA DEFINITIONS MATCHING PRISMA MODELS
// =============================================================================

// User Authentication Schema
export const UserSchema = type({
  id: 'string',
  email: 'string',
  name: 'string',
  'businessName?': 'string',
  'businessDescription?': 'string',
  preferences: type({
    'units?': "'metric'|'imperial'",
    'defaultFilamentBrand?': 'string',
    'notifications?': type({
      email: 'boolean',
      lowStock: 'boolean',
      printComplete: 'boolean',
      systemUpdates: 'boolean'
    })
  }),
  createdAt: 'Date',
  updatedAt: 'Date',
  'lastLoginAt?': 'Date'
})

// Core Model Types using ArkType (with user isolation)
export const ModelSchema = type({
  id: 'string',
  userId: 'string', // User isolation
  name: 'string',
  designer: 'string',
  'description?': 'string',
  imageUrls: 'string[]',
  category: "'keychain'|'earring'|'decoration'|'functional'",
  createdAt: 'Date',
  updatedAt: 'Date'
})

export const ModelVariantSchema = type({
  id: 'string',
  userId: 'string', // User isolation
  modelId: 'string',
  name: 'string',
  version: 'number',
  slicedFileUrl: 'string',

  // Fast-access structured fields
  layerHeight: 'number',
  nozzleTemperature: 'number',
  bedTemperature: 'number',
  printDurationMinutes: 'number',

  // Complete Bambu Studio metadata (JSONB)
  bambuMetadata: 'unknown', // JSONB field - validated separately

  // Business metrics
  costToProduceUsd: 'number',
  successRatePercentage: 'number',

  createdAt: 'Date',
  updatedAt: 'Date'
})

// Filament specification (separate from inventory, user-isolated)
export const FilamentSchema = type({
  id: 'string',
  userId: 'string', // User isolation
  brand: 'string',
  materialType: "'PLA'|'PETG'|'ABS'|'TPU'",
  colorName: 'string',
  colorHex: 'string', // format validated separately
  costPerGramBase: 'number',
  'purchaseUrl?': 'string',
  demandCount: 'number', // how many variants use this filament
  createdAt: 'Date',
  updatedAt: 'Date'
})

// Physical filament inventory (spools in stock, user-isolated)
export const FilamentInventorySchema = type({
  id: 'string',
  userId: 'string', // User isolation
  filamentId: 'string', // reference to Filament
  'batchIdentifier?': 'string',
  quantityGrams: 'number',
  actualCostPerGram: 'number',
  lowStockThreshold: 'number',
  'purchaseDate?': 'Date',
  'expiryDate?': 'Date',
  createdAt: 'Date',
  lastUpdated: 'Date'
})

// Filament requirements (link between variants and filaments)
export const FilamentRequirementSchema = type({
  id: 'string',
  variantId: 'string',
  filamentId: 'string',
  amsSlot: 'number',
  usageModel: 'number',    // grams used for model
  usageWaste: 'number',    // grams wasted
  usagePurge: 'number',    // grams used for purging
  createdAt: 'Date'
})

export const PrintJobSchema = type({
  id: 'string',
  userId: 'string', // User isolation
  variantId: 'string',
  status: "'queued'|'printing'|'completed'|'failed'",
  priority: 'number',
  'estimatedStartTime?': 'Date',
  'estimatedCompletionTime?': 'Date',
  'actualCompletionTime?': 'Date',
  'failureReason?': 'string',
  'completionPercentage?': 'number>=0<=100',
  createdAt: 'Date'
})

// Bambu Studio Metadata Structure
export const BambuMetadataSchema = type({
  // Filament Information
  filaments: type({
    type: 'string',
    brand: 'string',
    color: 'string',
    colorHex: 'string',
    amsSlot: 'number',
    usageModel: 'number',
    usageWaste: 'number',
    usagePurge: 'number'
  }).array(),

  // Print Settings
  nozzleSize: 'number',
  layerHeight: 'number',

  // Brim Settings
  brimWidth: 'number',
  brimType: 'string',
  brimOffset: 'number',

  // Time Calculations
  printTime: type({
    totalMinutes: 'number',
    modelTime: 'number',
    supportTime: 'number',
    purgeTime: 'number'
  }),

  // All other Bambu Studio parameters (600+ fields)
  // Stored as JSONB and validated separately for flexibility
  rawMetadata: 'unknown'
})

// =============================================================================
// INFER TYPESCRIPT TYPES FROM ARKTYPE SCHEMAS
// =============================================================================

export type User = typeof UserSchema.infer
export type Model = typeof ModelSchema.infer
export type ModelVariant = typeof ModelVariantSchema.infer
export type Filament = typeof FilamentSchema.infer
export type FilamentInventory = typeof FilamentInventorySchema.infer
export type FilamentRequirement = typeof FilamentRequirementSchema.infer
export type PrintJob = typeof PrintJobSchema.infer
export type BambuMetadata = typeof BambuMetadataSchema.infer

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
  BambuMetadataSchema
} as const