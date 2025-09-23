import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { ModelSchema } from '../schemas'

export const modelsRouter = createTRPCRouter({
  // List models with pagination and filtering
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        search: z.string().optional(),
        category: z.enum(['keychain', 'earring', 'decoration', 'functional']).optional(),
      })
    )
    .output(
      z.object({
        models: z.array(ModelSchema),
        nextCursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const { limit, cursor, search, category } = input

      const where = {
        userId: ctx.user.id,
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { designer: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const models = await ctx.db.model.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (models.length > limit) {
        const nextItem = models.pop()
        nextCursor = nextItem!.id
      }

      return {
        models,
        nextCursor,
      }
    }),

  // Get single model by ID
  byId: protectedProcedure
    .input(z.string())
    .output(ModelSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const model = await ctx.db.model.findFirst({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      if (!model) {
        throw new Error('Model not found')
      }

      return model
    }),

  // Create new model
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        designer: z.string(),
        description: z.string().optional(),
        imageUrls: z.array(z.string()),
        category: z.enum(['keychain', 'earring', 'decoration', 'functional']),
      })
    )
    .output(ModelSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const model = await ctx.db.model.create({
        data: {
          ...input,
          userId: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return model
    }),

  // Update existing model
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        designer: z.string().optional(),
        description: z.string().optional(),
        imageUrls: z.array(z.string()).optional(),
        category: z.enum(['keychain', 'earring', 'decoration', 'functional']).optional(),
      })
    )
    .output(ModelSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const { id, ...updateData } = input

      const model = await ctx.db.model.updateMany({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })

      if (model.count === 0) {
        throw new Error('Model not found or access denied')
      }

      const updatedModel = await ctx.db.model.findUniqueOrThrow({
        where: { id },
      })

      return updatedModel
    }),

  // Delete model
  delete: protectedProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not found')
      }

      const result = await ctx.db.model.deleteMany({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      return result.count > 0
    }),
})