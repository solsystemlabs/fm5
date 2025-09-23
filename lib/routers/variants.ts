import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { ModelVariantSchema } from '../schemas'

export const variantsRouter = createTRPCRouter({
  // List variants for a model
  byModelId: protectedProcedure
    .input(z.string())
    .output(z.array(ModelVariantSchema))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const variants = await ctx.db.modelVariant.findMany({
        where: {
          modelId: input,
          userId: ctx.user.id,
        },
        orderBy: { version: 'desc' },
      })

      return variants
    }),

  // Get single variant by ID
  byId: protectedProcedure
    .input(z.string())
    .output(ModelVariantSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const variant = await ctx.db.modelVariant.findFirst({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      if (!variant) {
        throw new Error('Variant not found')
      }

      return variant
    }),

  // Create new variant
  create: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        name: z.string(),
        version: z.number(),
        slicedFileUrl: z.string(),
        layerHeight: z.number(),
        nozzleTemperature: z.number(),
        bedTemperature: z.number(),
        printDurationMinutes: z.number(),
        bambuMetadata: z.unknown(),
        costToProduceUsd: z.number(),
        successRatePercentage: z.number(),
      })
    )
    .output(ModelVariantSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      // Verify model belongs to user
      const model = await ctx.db.model.findFirst({
        where: {
          id: input.modelId,
          userId: ctx.user.id,
        },
      })

      if (!model) {
        throw new Error('Model not found or access denied')
      }

      const variant = await ctx.db.modelVariant.create({
        data: {
          ...input,
          userId: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return variant
    }),

  // Update existing variant
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        version: z.number().optional(),
        slicedFileUrl: z.string().optional(),
        layerHeight: z.number().optional(),
        nozzleTemperature: z.number().optional(),
        bedTemperature: z.number().optional(),
        printDurationMinutes: z.number().optional(),
        bambuMetadata: z.unknown().optional(),
        costToProduceUsd: z.number().optional(),
        successRatePercentage: z.number().optional(),
      })
    )
    .output(ModelVariantSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const { id, ...updateData } = input

      const variant = await ctx.db.modelVariant.updateMany({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })

      if (variant.count === 0) {
        throw new Error('Variant not found or access denied')
      }

      const updatedVariant = await ctx.db.modelVariant.findUniqueOrThrow({
        where: { id },
      })

      return updatedVariant
    }),

  // Delete variant
  delete: protectedProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const result = await ctx.db.modelVariant.deleteMany({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      return result.count > 0
    }),
})