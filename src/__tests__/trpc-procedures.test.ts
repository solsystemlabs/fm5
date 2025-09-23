import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import { appRouter } from '../../lib/routers/_app'
import { createTRPCContext } from '../../lib/trpc'

// Mock database
const mockDb = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  model: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  modelVariant: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  filament: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  filamentInventory: {
    findMany: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    fields: { lowStockThreshold: 'lowStockThreshold' },
  },
  printJob: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    count: vi.fn(),
  },
}

// Mock user with complete schema-compliant data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  businessName: undefined,
  businessDescription: undefined,
  preferences: {
    units: undefined,
    defaultFilamentBrand: undefined,
    notifications: undefined,
  },
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
  lastLoginAt: undefined,
}

// Create test context
function createTestContext(user = mockUser) {
  return {
    db: mockDb,
    user,
    req: new Request('http://localhost/api/trpc'),
  }
}

describe('tRPC Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Auth Router', () => {
    it('should get current user', async () => {
      const ctx = createTestContext()
      mockDb.user.findUnique.mockResolvedValue(mockUser)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.auth.me()

      expect(result).toEqual(mockUser)
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      })
    })

    it('should update user profile', async () => {
      const ctx = createTestContext()
      const updateData = { name: 'Updated Name' }
      const updatedUser = { ...mockUser, ...updateData }

      mockDb.user.update.mockResolvedValue(updatedUser)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.auth.updateProfile(updateData)

      expect(result).toEqual(updatedUser)
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should throw error when user not authenticated', async () => {
      const ctx = createTestContext(null)

      const caller = appRouter.createCaller(ctx)

      await expect(caller.auth.me()).rejects.toThrow('User must be authenticated')
    })
  })

  describe('Models Router', () => {
    const mockModel = {
      id: 'model-123',
      userId: mockUser.id,
      name: 'Test Model',
      designer: 'Test Designer',
      category: 'functional' as const,
      imageUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should list models with filters', async () => {
      const ctx = createTestContext()
      mockDb.model.findMany.mockResolvedValue([mockModel])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.models.list({
        search: 'test',
        category: 'functional',
        limit: 10,
      })

      expect(result.models).toEqual([mockModel])
      expect(mockDb.model.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          category: 'functional',
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { designer: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        take: 11, // limit + 1 for pagination
        cursor: undefined,
        orderBy: { updatedAt: 'desc' },
      })
    })

    it('should create new model', async () => {
      const ctx = createTestContext()
      const newModelData = {
        name: 'New Model',
        designer: 'Test Designer',
        category: 'keychain' as const,
        imageUrls: [],
      }

      mockDb.model.create.mockResolvedValue({
        ...newModelData,
        id: 'new-model-123',
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.models.create(newModelData)

      expect(result.name).toBe(newModelData.name)
      expect(mockDb.model.create).toHaveBeenCalledWith({
        data: {
          ...newModelData,
          userId: mockUser.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should delete model with user isolation', async () => {
      const ctx = createTestContext()
      mockDb.model.deleteMany.mockResolvedValue({ count: 1 })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.models.delete('model-123')

      expect(result).toBe(true)
      expect(mockDb.model.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'model-123',
          userId: mockUser.id,
        },
      })
    })
  })

  describe('Print Queue Router', () => {
    const mockJob = {
      id: 'job-123',
      userId: mockUser.id,
      variantId: 'variant-123',
      status: 'queued' as const,
      priority: 1,
      createdAt: new Date(),
    }

    it('should list print jobs with filtering', async () => {
      const ctx = createTestContext()
      mockDb.printJob.findMany.mockResolvedValue([mockJob])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.queue.list({
        status: 'queued',
        limit: 10,
      })

      expect(result.jobs).toEqual([mockJob])
      expect(mockDb.printJob.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          status: 'queued',
        },
        take: 11,
        cursor: undefined,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
      })
    })

    it('should get queue statistics', async () => {
      const ctx = createTestContext()
      mockDb.printJob.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // queued
        .mockResolvedValueOnce(1)  // printing
        .mockResolvedValueOnce(5)  // completed
        .mockResolvedValueOnce(1)  // failed

      const caller = appRouter.createCaller(ctx)
      const result = await caller.queue.stats()

      expect(result).toEqual({
        total: 10,
        queued: 3,
        printing: 1,
        completed: 5,
        failed: 1,
      })
    })
  })

  describe('Input Validation', () => {
    it('should validate Zod schemas for model creation', async () => {
      const ctx = createTestContext()
      const caller = appRouter.createCaller(ctx)

      // Invalid category should throw validation error
      await expect(
        caller.models.create({
          name: 'Test Model',
          designer: 'Test Designer',
          category: 'invalid-category' as any,
          imageUrls: [],
        })
      ).rejects.toThrow()
    })

    it('should validate hex color format for filaments', async () => {
      const ctx = createTestContext()
      const caller = appRouter.createCaller(ctx)

      // Invalid hex color should throw validation error
      await expect(
        caller.filaments.create({
          brand: 'Test Brand',
          materialType: 'PLA',
          colorName: 'Red',
          colorHex: 'invalid-hex',
          costPerGramBase: 0.05,
        })
      ).rejects.toThrow()
    })

    it('should validate completion percentage range', async () => {
      const ctx = createTestContext()
      const caller = appRouter.createCaller(ctx)

      // Invalid percentage should throw validation error
      await expect(
        caller.queue.updateStatus({
          id: 'job-123',
          status: 'printing',
          completionPercentage: 150, // Invalid: > 100
        })
      ).rejects.toThrow()
    })
  })
})