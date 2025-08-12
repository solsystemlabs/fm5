import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

// Test database URL for isolated testing
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL

describe('Prisma Schema Validation', () => {
  beforeAll(async () => {
    // Apply migrations to test database
    try {
      execSync('npx prisma migrate deploy', { stdio: 'pipe' })
    } catch (error) {
      console.warn('Migration warning:', error)
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data before each test (in correct order due to foreign keys)
    await prisma.printJobMaterial.deleteMany()
    await prisma.printJob.deleteMany()
    await prisma.filamentRoll.deleteMany()
    await prisma.filament.deleteMany()
    await prisma.filamentType.deleteMany()
    await prisma.filamentBrand.deleteMany()
    await prisma.product.deleteMany()
    await prisma.model.deleteMany()
    await prisma.modelCategory.deleteMany()
    await prisma.printer.deleteMany()
    await prisma.printerBrand.deleteMany()
    // Clean up auth-related tables (in correct order due to foreign keys)
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('User Entity', () => {
    test('should have correct user schema structure', async () => {
      const userModel = prisma.user
      expect(userModel).toBeDefined()
      
      // Test required fields exist by attempting to create without them
      await expect(
        prisma.user.create({
          data: {
            // Missing required fields should fail
          } as any
        })
      ).rejects.toThrow()
    })

    test('should enforce unique email constraint', async () => {
      const userData = {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await prisma.user.create({ data: userData })

      // Attempting to create another user with same email should fail
      await expect(
        prisma.user.create({
          data: {
            ...userData,
            id: 'test-user-2',
            name: 'Another User'
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('FilamentType Entity', () => {
    test('should create and validate filament types', async () => {
      const filamentType = await prisma.filamentType.create({
        data: {
          name: 'PLA',
          description: 'Polylactic Acid - Easy to print'
        }
      })

      expect(filamentType).toMatchObject({
        id: expect.any(String),
        name: 'PLA',
        description: 'Polylactic Acid - Easy to print'
      })
    })

    test('should enforce unique name constraint', async () => {
      await prisma.filamentType.create({
        data: { name: 'PETG', description: 'Strong material' }
      })

      await expect(
        prisma.filamentType.create({
          data: { name: 'PETG', description: 'Duplicate name' }
        })
      ).rejects.toThrow()
    })
  })

  describe('FilamentBrand Entity', () => {
    test('should create and validate filament brands', async () => {
      const brand = await prisma.filamentBrand.create({
        data: {
          name: 'Bambu Lab',
          website: 'https://bambulab.com'
        }
      })

      expect(brand).toMatchObject({
        id: expect.any(String),
        name: 'Bambu Lab',
        website: 'https://bambulab.com'
      })
    })

    test('should enforce unique name constraint', async () => {
      await prisma.filamentBrand.create({
        data: { name: 'Hatchbox' }
      })

      await expect(
        prisma.filamentBrand.create({
          data: { name: 'Hatchbox' }
        })
      ).rejects.toThrow()
    })
  })

  describe('Model Category Entity', () => {
    test('should create and validate model categories', async () => {
      const category = await prisma.modelCategory.create({
        data: {
          name: 'Miniatures',
          description: 'Small detailed figures'
        }
      })

      expect(category).toMatchObject({
        id: expect.any(String),
        name: 'Miniatures',
        description: 'Small detailed figures'
      })
    })

    test('should enforce unique name constraint', async () => {
      await prisma.modelCategory.create({
        data: { name: 'Toys' }
      })

      await expect(
        prisma.modelCategory.create({
          data: { name: 'Toys' }
        })
      ).rejects.toThrow()
    })

    test('should support hierarchical categories', async () => {
      const parentCategory = await prisma.modelCategory.create({
        data: { name: 'Gaming' }
      })

      const childCategory = await prisma.modelCategory.create({
        data: {
          name: 'Board Games',
          parentId: parentCategory.id
        }
      })

      expect(childCategory.parentId).toBe(parentCategory.id)

      // Verify relationship
      const categoryWithChildren = await prisma.modelCategory.findUnique({
        where: { id: parentCategory.id },
        include: { children: true }
      })

      expect(categoryWithChildren?.children).toHaveLength(1)
      expect(categoryWithChildren?.children[0].name).toBe('Board Games')
    })
  })

  describe('Model Entity', () => {
    test('should create model with required fields', async () => {
      // Create dependencies first
      const category = await prisma.modelCategory.create({
        data: { name: 'Functional' }
      })

      const model = await prisma.model.create({
        data: {
          name: 'Phone Stand',
          categoryId: category.id,
          originalFileName: 'phone_stand.3mf',
          fileHash: 'abc123hash456',
          fileSize: 1024000,
          description: 'Adjustable phone stand'
        }
      })

      expect(model).toMatchObject({
        id: expect.any(String),
        name: 'Phone Stand',
        categoryId: category.id,
        originalFileName: 'phone_stand.3mf',
        fileHash: 'abc123hash456',
        fileSize: 1024000
      })
    })

    test('should enforce unique file hash constraint', async () => {
      const category = await prisma.modelCategory.create({
        data: { name: 'Gadgets' }
      })

      const duplicateHash = 'duplicate123hash456'

      await prisma.model.create({
        data: {
          name: 'Model One',
          categoryId: category.id,
          originalFileName: 'model1.3mf',
          fileHash: duplicateHash,
          fileSize: 1000
        }
      })

      await expect(
        prisma.model.create({
          data: {
            name: 'Model Two',
            categoryId: category.id,
            originalFileName: 'model2.3mf',
            fileHash: duplicateHash, // Duplicate hash should fail
            fileSize: 2000
          }
        })
      ).rejects.toThrow()
    })

    test('should maintain foreign key constraint to category', async () => {
      // Attempting to create model with non-existent category should fail
      await expect(
        prisma.model.create({
          data: {
            name: 'Invalid Model',
            categoryId: 'non-existent-id',
            originalFileName: 'invalid.3mf',
            fileHash: 'invalid123',
            fileSize: 1000
          }
        })
      ).rejects.toThrow()
    })

    test('should support 3MF metadata fields', async () => {
      const category = await prisma.modelCategory.create({
        data: { name: 'Test' }
      })

      const model = await prisma.model.create({
        data: {
          name: 'Complex Model',
          categoryId: category.id,
          originalFileName: 'complex.3mf',
          fileHash: 'complex123',
          fileSize: 2048000,
          // 3MF metadata
          slicerApplication: 'BambuStudio-02.01.01.52',
          slicerVersion: '02.01.01.52',
          threemfVersion: '1.0',
          hasGcode: true,
          hasThumbnails: true,
          // Physical properties
          volume: 15000.5,
          boundingBoxMinX: 0,
          boundingBoxMaxX: 100,
          boundingBoxMinY: 0,
          boundingBoxMaxY: 100,
          boundingBoxMinZ: 0,
          boundingBoxMaxZ: 50,
          // Material info
          primaryMaterial: 'PLA',
          isMultiMaterial: false,
          estimatedCost: 2.50
        }
      })

      expect(model).toMatchObject({
        slicerApplication: 'BambuStudio-02.01.01.52',
        hasGcode: true,
        volume: 15000.5,
        primaryMaterial: 'PLA',
        isMultiMaterial: false
      })
    })
  })

  describe('Filament Entity', () => {
    test('should create filament with all required relationships', async () => {
      // Create dependencies
      const filamentType = await prisma.filamentType.create({
        data: { name: 'ABS', description: 'Strong plastic' }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: 'Polymaker', website: 'https://polymaker.com' }
      })

      const filament = await prisma.filament.create({
        data: {
          name: 'PolyLite ABS Black',
          color: 'Black',
          hexColor: '#000000',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75,
          density: 1.04,
          description: 'High quality ABS filament'
        }
      })

      expect(filament).toMatchObject({
        id: expect.any(String),
        name: 'PolyLite ABS Black',
        color: 'Black',
        hexColor: '#000000',
        typeId: filamentType.id,
        brandId: filamentBrand.id,
        diameter: 1.75,
        density: 1.04
      })
    })

    test('should maintain foreign key constraints', async () => {
      // Test filament type constraint
      await expect(
        prisma.filament.create({
          data: {
            name: 'Invalid Filament',
            color: 'Red',
            typeId: 'non-existent-type',
            brandId: 'non-existent-brand',
            diameter: 1.75
          }
        })
      ).rejects.toThrow()
    })

    test('should enforce unique combination constraint', async () => {
      const filamentType = await prisma.filamentType.create({
        data: { name: 'PLA' }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: 'TestBrand' }
      })

      // Create first filament
      await prisma.filament.create({
        data: {
          name: 'Test PLA',
          color: 'Red',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75
        }
      })

      // Attempt to create duplicate should fail
      await expect(
        prisma.filament.create({
          data: {
            name: 'Test PLA', // Same name
            color: 'Red',     // Same color
            typeId: filamentType.id,
            brandId: filamentBrand.id, // Same brand
            diameter: 1.75    // Same diameter
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('FilamentRoll Entity', () => {
    test('should create filament rolls with physical tracking', async () => {
      // Create dependencies
      const filamentType = await prisma.filamentType.create({
        data: { name: 'PETG' }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: 'SUNLU' }
      })

      const filament = await prisma.filament.create({
        data: {
          name: 'SUNLU PETG Clear',
          color: 'Clear',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75
        }
      })

      const filamentRoll = await prisma.filamentRoll.create({
        data: {
          filamentId: filament.id,
          initialWeight: 1000,
          currentWeight: 750,
          spoolWeight: 200,
          totalCost: 28.99,
          costPerGram: 0.029,
          purchaseDate: new Date('2024-01-15'),
          supplier: 'Amazon',
          storageLocation: 'Shelf A-1',
          isActive: true,
          isEmpty: false
        }
      })

      expect(filamentRoll).toMatchObject({
        id: expect.any(String),
        filamentId: filament.id,
        initialWeight: 1000,
        currentWeight: 750,
        totalCost: 28.99,
        isActive: true,
        isEmpty: false
      })
    })
  })

  describe('Schema Relationships and Constraints', () => {
    test('should validate CUID primary keys', async () => {
      const filamentType1 = await prisma.filamentType.create({
        data: { name: 'HIPS' }
      })

      const filamentType2 = await prisma.filamentType.create({
        data: { name: 'Wood-fill' }
      })

      expect(typeof filamentType1.id).toBe('string')
      expect(typeof filamentType2.id).toBe('string')
      expect(filamentType1.id).toMatch(/^[a-z0-9]+$/) // CUID format
      expect(filamentType2.id).toMatch(/^[a-z0-9]+$/)
      expect(filamentType1.id).not.toBe(filamentType2.id)
    })

    test('should validate required fields', async () => {
      // Test that required fields cannot be null/undefined
      await expect(
        prisma.filamentType.create({
          data: {
            name: undefined as any
          }
        })
      ).rejects.toThrow()

      await expect(
        prisma.filamentBrand.create({
          data: {} as any
        })
      ).rejects.toThrow()
    })

    test('should maintain referential integrity with cascading', async () => {
      // Create test data hierarchy
      const filamentType = await prisma.filamentType.create({
        data: { name: 'Test Material' }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: 'Test Brand' }
      })

      const filament = await prisma.filament.create({
        data: {
          name: 'Test Filament',
          color: 'Blue',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75
        }
      })

      const filamentRoll = await prisma.filamentRoll.create({
        data: {
          filamentId: filament.id,
          initialWeight: 1000,
          currentWeight: 1000
        }
      })

      // Should not be able to delete filament type that's referenced by filament (Restrict)
      await expect(
        prisma.filamentType.delete({
          where: { id: filamentType.id }
        })
      ).rejects.toThrow()

      // Should be able to delete filament brand that cascades to filament
      await prisma.filamentBrand.delete({
        where: { id: filamentBrand.id }
      })

      // Verify filament was cascaded deleted
      const deletedFilament = await prisma.filament.findUnique({
        where: { id: filament.id }
      })
      expect(deletedFilament).toBeNull()

      // Verify filament roll was cascaded deleted too
      const deletedRoll = await prisma.filamentRoll.findUnique({
        where: { id: filamentRoll.id }
      })
      expect(deletedRoll).toBeNull()

      // Now we can delete the filament type since no filaments reference it
      await prisma.filamentType.delete({ 
        where: { id: filamentType.id } 
      })
    })

    test('should support complex relationships', async () => {
      // Test User -> Model relationship
      const user = await prisma.user.create({
        data: {
          id: 'test-designer-123',
          name: 'Test Designer',
          email: 'designer@test.com',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      const category = await prisma.modelCategory.create({
        data: { name: 'Test Category' }
      })

      const model = await prisma.model.create({
        data: {
          name: 'Designer Model',
          categoryId: category.id,
          designerUserId: user.id,
          originalFileName: 'designer.3mf',
          fileHash: 'designer123',
          fileSize: 1000
        }
      })

      // Verify relationship
      const modelWithDesigner = await prisma.model.findUnique({
        where: { id: model.id },
        include: { designerUser: true }
      })

      expect(modelWithDesigner?.designerUser?.name).toBe('Test Designer')

      // Verify reverse relationship
      const userWithModels = await prisma.user.findUnique({
        where: { id: user.id },
        include: { designedModels: true }
      })

      expect(userWithModels?.designedModels).toHaveLength(1)
      expect(userWithModels?.designedModels[0].name).toBe('Designer Model')
    })
  })
})