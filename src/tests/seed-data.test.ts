import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

describe('Seed Data Functionality', () => {
  beforeAll(async () => {
    // Ensure database is up to date
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
    // Clean up before each test with proper ordering
    try {
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
    } catch (error) {
      console.warn('Cleanup warning:', error)
    }
  })

  describe('FilamentType Seed Data', () => {
    test('should create standard filament types', async () => {
      const standardTypes = [
        { name: 'PLA', description: 'Polylactic Acid - Easy to print, biodegradable' },
        { name: 'PETG', description: 'Polyethylene Terephthalate Glycol - Strong and clear' },
        { name: 'ABS', description: 'Acrylonitrile Butadiene Styrene - Durable and heat resistant' },
        { name: 'TPU', description: 'Thermoplastic Polyurethane - Flexible and elastic' },
        { name: 'ASA', description: 'Acrylonitrile Styrene Acrylate - UV resistant ABS alternative' },
        { name: 'PC', description: 'Polycarbonate - High strength engineering plastic' },
        { name: 'WOOD', description: 'Wood-filled filament - Natural appearance' },
        { name: 'CARBON FIBER', description: 'Carbon fiber reinforced - Ultra strong' }
      ]

      await prisma.filamentType.createMany({
        data: standardTypes,
        skipDuplicates: true
      })

      const createdTypes = await prisma.filamentType.findMany({
        orderBy: { name: 'asc' }
      })

      expect(createdTypes).toHaveLength(standardTypes.length)
      expect(createdTypes.map(t => t.name)).toEqual([
        'ABS', 'ASA', 'CARBON FIBER', 'PC', 'PETG', 'PLA', 'TPU', 'WOOD'
      ])
    })

    test('should include material properties in descriptions', async () => {
      await prisma.filamentType.create({
        data: {
          name: 'PLA',
          description: 'Polylactic Acid - Easy to print, biodegradable'
        }
      })

      const plaType = await prisma.filamentType.findFirst({
        where: { name: 'PLA' }
      })

      expect(plaType?.description).toContain('Easy to print')
      expect(plaType?.description).toContain('biodegradable')
    })
  })

  describe('FilamentBrand Seed Data', () => {
    test('should create popular filament brands', async () => {
      const popularBrands = [
        { name: 'Bambu Lab', website: 'https://bambulab.com' },
        { name: 'Hatchbox', website: 'https://www.hatchbox3d.com' },
        { name: 'Overture', website: 'https://overture3d.com' },
        { name: 'SUNLU', website: 'https://www.sunlu.com' },
        { name: 'Polymaker', website: 'https://polymaker.com' },
        { name: 'Prusament', website: 'https://prusament.com' },
        { name: 'eSUN', website: 'https://www.esun3d.com' },
        { name: 'ERYONE', website: 'https://www.eryone3d.com' }
      ]

      await prisma.filamentBrand.createMany({
        data: popularBrands,
        skipDuplicates: true
      })

      const createdBrands = await prisma.filamentBrand.findMany({
        orderBy: { name: 'asc' }
      })

      expect(createdBrands).toHaveLength(popularBrands.length)
      expect(createdBrands.every(brand => brand.website)).toBe(true)
    })

    test('should handle brands without websites', async () => {
      await prisma.filamentBrand.create({
        data: {
          name: 'Generic Brand'
          // No website provided
        }
      })

      const brand = await prisma.filamentBrand.findFirst({
        where: { name: 'Generic Brand' }
      })

      expect(brand?.name).toBe('Generic Brand')
      expect(brand?.website).toBeNull()
    })
  })

  describe('ModelCategory Seed Data', () => {
    test('should create hierarchical model categories', async () => {
      // Create parent categories
      const parentCategories = [
        { name: 'Miniatures', description: 'Small detailed figures and characters' },
        { name: 'Functional', description: 'Practical items and tools' },
        { name: 'Decorative', description: 'Ornamental and artistic pieces' },
        { name: 'Hobby', description: 'Gaming and recreational items' }
      ]

      await prisma.modelCategory.createMany({
        data: parentCategories,
        skipDuplicates: true
      })

      const miniatures = await prisma.modelCategory.findFirst({
        where: { name: 'Miniatures' }
      })

      // Create subcategories
      const subCategories = [
        { name: 'D&D Characters', description: 'Dungeons & Dragons miniatures', parentId: miniatures!.id },
        { name: 'Vehicles', description: 'Cars, planes, and other vehicles', parentId: miniatures!.id }
      ]

      await prisma.modelCategory.createMany({
        data: subCategories,
        skipDuplicates: true
      })

      // Verify hierarchical structure
      const categoriesWithChildren = await prisma.modelCategory.findMany({
        include: { children: true, parent: true }
      })

      const parent = categoriesWithChildren.find(c => c.name === 'Miniatures')
      const child = categoriesWithChildren.find(c => c.name === 'D&D Characters')

      expect(parent?.children).toHaveLength(2)
      expect(child?.parent?.name).toBe('Miniatures')
    })
  })

  describe('Development User Accounts', () => {
    test('should create admin user with proper authentication', async () => {
      const adminUser = await prisma.user.create({
        data: {
          id: 'admin-test-user',
          name: 'Admin User',
          email: 'admin@fm.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      expect(adminUser.email).toBe('admin@fm.com')
      expect(adminUser.emailVerified).toBe(true)
      expect(adminUser.name).toBe('Admin User')
    })

    test('should create test designer users', async () => {
      const testUsers = [
        {
          id: 'designer-1',
          name: 'John Designer',
          email: 'john@test.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'designer-2',
          name: 'Jane Creator',
          email: 'jane@test.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      await prisma.user.createMany({
        data: testUsers,
        skipDuplicates: true
      })

      const createdUsers = await prisma.user.findMany({
        where: {
          email: { in: ['john@test.com', 'jane@test.com'] }
        }
      })

      expect(createdUsers).toHaveLength(2)
      expect(createdUsers.every(user => user.emailVerified)).toBe(true)
    })
  })

  describe('Material Properties and Defaults', () => {
    test('should create filaments with realistic material properties', async () => {
      // Create dependencies with unique names to avoid conflicts
      const uniqueSuffix = Date.now()
      const plaType = await prisma.filamentType.create({
        data: { name: `PLA-${uniqueSuffix}`, description: 'Polylactic Acid' }
      })

      const brand = await prisma.filamentBrand.create({
        data: { name: `TestBrand-${uniqueSuffix}`, website: 'https://test.com' }
      })

      // Create filament with material properties
      const filament = await prisma.filament.create({
        data: {
          name: `Test PLA Red-${uniqueSuffix}`,
          color: 'Red',
          hexColor: '#FF0000',
          typeId: plaType.id,
          brandId: brand.id,
          diameter: 1.75,
          density: 1.24, // PLA typical density g/cm³
          description: 'High quality PLA filament'
        }
      })

      expect(filament.density).toBe(1.24)
      expect(filament.diameter).toBe(1.75)
    })

    test('should create filament rolls with cost tracking', async () => {
      // Setup dependencies with unique names
      const uniqueSuffix = Date.now()
      const filamentType = await prisma.filamentType.create({
        data: { name: `PETG-${uniqueSuffix}` }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: `CostBrand-${uniqueSuffix}` }
      })

      const filament = await prisma.filament.create({
        data: {
          name: `PETG Clear-${uniqueSuffix}`,
          color: 'Clear',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75,
          density: 1.27
        }
      })

      // Create roll with cost tracking
      const roll = await prisma.filamentRoll.create({
        data: {
          filamentId: filament.id,
          initialWeight: 1000, // 1kg roll
          currentWeight: 1000,
          spoolWeight: 200,
          totalCost: 25.99,
          costPerGram: 0.026, // $25.99 / 1000g
          purchaseDate: new Date('2024-01-15'),
          supplier: 'Test Supplier'
        }
      })

      expect(roll.costPerGram).toBe(0.026)
      expect(roll.totalCost).toBe(25.99)
      expect(roll.initialWeight).toBe(1000)
    })
  })

  describe('Seed Data Integrity', () => {
    test('should maintain referential integrity', async () => {
      // Create complete hierarchy with unique names
      const uniqueSuffix = Date.now()
      const filamentType = await prisma.filamentType.create({
        data: { name: `ABS-${uniqueSuffix}` }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: `IntegrityBrand-${uniqueSuffix}` }
      })

      const filament = await prisma.filament.create({
        data: {
          name: `ABS Black-${uniqueSuffix}`,
          color: 'Black',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75
        }
      })

      const roll = await prisma.filamentRoll.create({
        data: {
          filamentId: filament.id,
          initialWeight: 1000,
          currentWeight: 500
        }
      })

      // Verify relationships exist
      const filamentWithRelations = await prisma.filament.findUnique({
        where: { id: filament.id },
        include: {
          type: true,
          brand: true,
          rolls: true
        }
      })

      expect(filamentWithRelations?.type.name).toBe(`ABS-${uniqueSuffix}`)
      expect(filamentWithRelations?.brand.name).toBe(`IntegrityBrand-${uniqueSuffix}`)
      expect(filamentWithRelations?.rolls).toHaveLength(1)
      expect(filamentWithRelations?.rolls[0].id).toBe(roll.id)
    })

    test('should handle skipDuplicates correctly', async () => {
      const typeData = { name: 'PLA', description: 'Test material' }

      // Create first time
      await prisma.filamentType.create({ data: typeData })

      // Try to create again with createMany and skipDuplicates
      await prisma.filamentType.createMany({
        data: [typeData],
        skipDuplicates: true
      })

      const types = await prisma.filamentType.findMany({
        where: { name: 'PLA' }
      })

      expect(types).toHaveLength(1)
    })
  })

  describe('Database Reset/Refresh Utilities', () => {
    test('should be able to clear all data in proper order', async () => {
      // Create some test data
      const filamentType = await prisma.filamentType.create({
        data: { name: 'TestType' }
      })

      const filamentBrand = await prisma.filamentBrand.create({
        data: { name: 'TestBrand' }
      })

      const filament = await prisma.filament.create({
        data: {
          name: 'TestFilament',
          color: 'Blue',
          typeId: filamentType.id,
          brandId: filamentBrand.id,
          diameter: 1.75
        }
      })

      await prisma.filamentRoll.create({
        data: {
          filamentId: filament.id,
          initialWeight: 1000,
          currentWeight: 1000
        }
      })

      // Verify data exists
      expect(await prisma.filamentType.count()).toBeGreaterThan(0)
      expect(await prisma.filamentBrand.count()).toBeGreaterThan(0)
      expect(await prisma.filament.count()).toBeGreaterThan(0)
      expect(await prisma.filamentRoll.count()).toBeGreaterThan(0)

      // Clear all data in proper order (this is what our beforeEach does)
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

      // Verify all cleared
      expect(await prisma.filamentType.count()).toBe(0)
      expect(await prisma.filamentBrand.count()).toBe(0)
      expect(await prisma.filament.count()).toBe(0)
      expect(await prisma.filamentRoll.count()).toBe(0)
    })
  })
})