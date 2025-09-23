import { z } from 'zod'
import { FilamentInventorySchema, FilamentSchema } from '../schemas'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const filamentsRouter = createTRPCRouter({
  // List filaments with filtering
  list: protectedProcedure
    .input(
      z.object({
        materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .output(z.array(FilamentSchema))
    .query(async ({ ctx, input }) => {
      const { materialType, search, limit } = input

      const where = {
        userId: ctx.user.id,
        ...(materialType && { materialType }),
        ...(search && {
          OR: [
            { brand: { contains: search, mode: 'insensitive' as const } },
            { colorName: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const filaments = await ctx.db.filament.findMany({
        where,
        take: limit,
        orderBy: { demandCount: 'desc' },
      })

      return filaments
    }),

  // Get single filament by ID
  byId: protectedProcedure
    .input(z.string())
    .output(FilamentSchema)
    .query(async ({ ctx, input }) => {
      const filament = await ctx.db.filament.findFirst({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      if (!filament) {
        throw new Error('Filament not found')
      }

      return filament
    }),

  // Create new filament
  create: protectedProcedure
    .input(
      z.object({
        brand: z.string(),
        materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']),
        colorName: z.string(),
        colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        costPerGramBase: z.number(),
        purchaseUrl: z.string().url().optional(),
      })
    )
    .output(FilamentSchema)
    .mutation(async ({ ctx, input }) => {
      const filament = await ctx.db.filament.create({
        data: {
          ...input,
          userId: ctx.user.id,
          demandCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return filament
    }),

  // Update existing filament
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        brand: z.string().optional(),
        materialType: z.enum(['PLA', 'PETG', 'ABS', 'TPU']).optional(),
        colorName: z.string().optional(),
        colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        costPerGramBase: z.number().optional(),
        purchaseUrl: z.string().url().optional(),
      })
    )
    .output(FilamentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const filament = await ctx.db.filament.updateMany({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })

      if (filament.count === 0) {
        throw new Error('Filament not found or access denied')
      }

      const updatedFilament = await ctx.db.filament.findUniqueOrThrow({
        where: { id },
      })

      return updatedFilament
    }),

  // Delete filament
  delete: protectedProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.filament.deleteMany({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      return result.count > 0
    }),

  // Inventory management
  inventory: createTRPCRouter({
    // List inventory for user
    list: protectedProcedure
      .input(
        z.object({
          filamentId: z.string().optional(),
          lowStock: z.boolean().optional(),
        })
      )
      .output(z.array(FilamentInventorySchema))
      .query(async ({ ctx, input }) => {
        const { filamentId, lowStock } = input

        const where = {
          userId: ctx.user.id,
          ...(filamentId && { filamentId }),
          ...(lowStock && {
            quantityGrams: { lte: ctx.db.filamentInventory.fields.lowStockThreshold },
          }),
        }

        const inventory = await ctx.db.filamentInventory.findMany({
          where,
          orderBy: { lastUpdated: 'desc' },
        })

        return inventory
      }),

    // Add inventory
    add: protectedProcedure
      .input(
        z.object({
          filamentId: z.string(),
          batchIdentifier: z.string().optional(),
          quantityGrams: z.number(),
          actualCostPerGram: z.number(),
          lowStockThreshold: z.number(),
          purchaseDate: z.date().optional(),
          expiryDate: z.date().optional(),
        })
      )
      .output(FilamentInventorySchema)
      .mutation(async ({ ctx, input }) => {
        // Verify filament belongs to user
        const filament = await ctx.db.filament.findFirst({
          where: {
            id: input.filamentId,
            userId: ctx.user.id,
          },
        })

        if (!filament) {
          throw new Error('Filament not found or access denied')
        }

        const inventory = await ctx.db.filamentInventory.create({
          data: {
            ...input,
            userId: ctx.user.id,
            createdAt: new Date(),
            lastUpdated: new Date(),
          },
        })

        return inventory
      }),

    // Update inventory
    updateQuantity: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          quantityGrams: z.number(),
        })
      )
      .output(FilamentInventorySchema)
      .mutation(async ({ ctx, input }) => {
        const { id, quantityGrams } = input

        const inventory = await ctx.db.filamentInventory.updateMany({
          where: {
            id,
            userId: ctx.user.id,
          },
          data: {
            quantityGrams,
            lastUpdated: new Date(),
          },
        })

        if (inventory.count === 0) {
          throw new Error('Inventory not found or access denied')
        }

        const updatedInventory = await ctx.db.filamentInventory.findUniqueOrThrow({
          where: { id },
        })

        return updatedInventory
      }),
  }),
})