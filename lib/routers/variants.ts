import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { ModelVariantSchema } from '../schemas'

export const variantsRouter = createTRPCRouter({
  // List variants for a model
  byModelId: protectedProcedure
    .input(z.string())
    .output(z.array(ModelVariantSchema))
    .query(async ({ ctx, input }) => {
      const variants = await ctx.db.modelVariant.findMany({
        where: {
          modelId: input,
          userId: ctx.user.id,
        },
        orderBy: { version: 'desc' },
      })

      // Transform Prisma model to match Zod schema (Decimal -> number)
      return variants.map((variant) => ({
        ...variant,
        layerHeight: variant.layerHeight.toNumber(),
        costToProduceUsd: variant.costToProduceUsd.toNumber(),
        successRatePercentage: variant.successRatePercentage.toNumber(),
      }))
    }),

  // Get single variant by ID
  byId: protectedProcedure
    .input(z.string())
    .output(ModelVariantSchema)
    .query(async ({ ctx, input }) => {
      const variant = await ctx.db.modelVariant.findFirst({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      if (!variant) {
        throw new Error('Variant not found')
      }

      // Transform Prisma model to match Zod schema (Decimal -> number)
      return {
        ...variant,
        layerHeight: variant.layerHeight.toNumber(),
        costToProduceUsd: variant.costToProduceUsd.toNumber(),
        successRatePercentage: variant.successRatePercentage.toNumber(),
      }
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
      }),
    )
    .output(ModelVariantSchema)
    .mutation(async ({ ctx, input }) => {
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
          bambuMetadata: input.bambuMetadata as any, // Cast unknown to JsonValue for Prisma
          userId: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Transform Prisma model to match Zod schema (Decimal -> number)
      return {
        ...variant,
        layerHeight: variant.layerHeight.toNumber(),
        costToProduceUsd: variant.costToProduceUsd.toNumber(),
        successRatePercentage: variant.successRatePercentage.toNumber(),
      }
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
      }),
    )
    .output(ModelVariantSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const variant = await ctx.db.modelVariant.updateMany({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: {
          ...updateData,
          bambuMetadata: updateData.bambuMetadata as any, // Cast unknown to JsonValue for Prisma
          updatedAt: new Date(),
        },
      })

      if (variant.count === 0) {
        throw new Error('Variant not found or access denied')
      }

      const updatedVariant = await ctx.db.modelVariant.findUniqueOrThrow({
        where: { id },
      })

      // Transform Prisma model to match Zod schema (Decimal -> number)
      return {
        ...updatedVariant,
        layerHeight: updatedVariant.layerHeight.toNumber(),
        costToProduceUsd: updatedVariant.costToProduceUsd.toNumber(),
        successRatePercentage: updatedVariant.successRatePercentage.toNumber(),
      }
    }),

  // Delete variant
  delete: protectedProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.modelVariant.deleteMany({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      return result.count > 0
    }),
})
