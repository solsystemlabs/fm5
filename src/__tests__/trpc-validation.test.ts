import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { UserSchema, ModelSchema, FilamentSchema, PrintJobSchema } from '../../lib/schemas'

describe('tRPC and Zod Schema Validation', () => {
  describe('Schema Type Safety', () => {
    it('should validate UserSchema correctly', () => {
      const validUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          units: 'metric' as const,
          notifications: {
            email: true,
            lowStock: false,
            printComplete: true,
            systemUpdates: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = UserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email in UserSchema', () => {
      const invalidUser = {
        id: 'user-123',
        email: 'not-an-email',
        name: 'Test User',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = UserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('should validate ModelSchema correctly', () => {
      const validModel = {
        id: 'model-123',
        userId: 'user-123',
        name: 'Test Model',
        designer: 'Test Designer',
        category: 'functional' as const,
        imageUrls: ['https://example.com/image.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = ModelSchema.safeParse(validModel)
      expect(result.success).toBe(true)
    })

    it('should reject invalid category in ModelSchema', () => {
      const invalidModel = {
        id: 'model-123',
        userId: 'user-123',
        name: 'Test Model',
        designer: 'Test Designer',
        category: 'invalid-category',
        imageUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = ModelSchema.safeParse(invalidModel)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('category')
      }
    })

    it('should validate FilamentSchema with hex color', () => {
      const validFilament = {
        id: 'filament-123',
        userId: 'user-123',
        brand: 'Test Brand',
        materialType: 'PLA' as const,
        colorName: 'Red',
        colorHex: '#FF0000',
        costPerGramBase: 0.05,
        demandCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = FilamentSchema.safeParse(validFilament)
      expect(result.success).toBe(true)
    })

    it('should reject invalid hex color in FilamentSchema', () => {
      const invalidFilament = {
        id: 'filament-123',
        userId: 'user-123',
        brand: 'Test Brand',
        materialType: 'PLA' as const,
        colorName: 'Red',
        colorHex: 'not-a-hex-color',
        costPerGramBase: 0.05,
        demandCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = FilamentSchema.safeParse(invalidFilament)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('colorHex')
      }
    })

    it('should validate PrintJobSchema with completion percentage', () => {
      const validJob = {
        id: 'job-123',
        userId: 'user-123',
        variantId: 'variant-123',
        status: 'printing' as const,
        priority: 1,
        completionPercentage: 50,
        createdAt: new Date(),
      }

      const result = PrintJobSchema.safeParse(validJob)
      expect(result.success).toBe(true)
    })

    it('should reject invalid completion percentage in PrintJobSchema', () => {
      const invalidJob = {
        id: 'job-123',
        userId: 'user-123',
        variantId: 'variant-123',
        status: 'printing' as const,
        priority: 1,
        completionPercentage: 150, // Invalid: > 100
        createdAt: new Date(),
      }

      const result = PrintJobSchema.safeParse(invalidJob)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('completionPercentage')
      }
    })
  })

  describe('Type Inference', () => {
    it('should infer correct TypeScript types from Zod schemas', () => {
      type UserType = z.infer<typeof UserSchema>
      type ModelType = z.infer<typeof ModelSchema>
      type FilamentType = z.infer<typeof FilamentSchema>
      type PrintJobType = z.infer<typeof PrintJobSchema>

      // Type assertions to verify correct inference
      const user: UserType = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const model: ModelType = {
        id: 'model-123',
        userId: 'user-123',
        name: 'Test Model',
        designer: 'Test Designer',
        category: 'functional',
        imageUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // If these compile without errors, type inference is working correctly
      expect(user.id).toBe('user-123')
      expect(model.category).toBe('functional')
    })
  })

  describe('Schema Coverage', () => {
    it('should have all required schemas exported', () => {
      // Verify all main schemas are available
      expect(UserSchema).toBeDefined()
      expect(ModelSchema).toBeDefined()
      expect(FilamentSchema).toBeDefined()
      expect(PrintJobSchema).toBeDefined()
    })

    it('should support optional fields correctly', () => {
      // Test with minimal required fields
      const minimalUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = UserSchema.safeParse(minimalUser)
      expect(result.success).toBe(true)
    })
  })
})