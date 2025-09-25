import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { PrintJobSchema } from '../schemas'

export const queueRouter = createTRPCRouter({
  // List print jobs with filtering and pagination
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(['queued', 'printing', 'completed', 'failed'])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        jobs: z.array(PrintJobSchema),
        nextCursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input

      const where = {
        userId: ctx.user.id,
        ...(status && { status }),
      }

      const jobs = await ctx.db.printJob.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (jobs.length > limit) {
        const nextItem = jobs.pop()
        nextCursor = nextItem!.id
      }

      return {
        jobs: jobs.map(job => ({
          ...job,
          estimatedStartTime: job.estimatedStartTime ?? undefined,
          estimatedCompletionTime: job.estimatedCompletionTime ?? undefined,
          actualCompletionTime: job.actualCompletionTime ?? undefined,
          failureReason: job.failureReason ?? undefined,
          completionPercentage: job.completionPercentage ?? undefined,
        })),
        nextCursor,
      }
    }),

  // Get single print job by ID
  byId: protectedProcedure
    .input(z.string())
    .output(PrintJobSchema)
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.printJob.findFirst({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      if (!job) {
        throw new Error('Print job not found')
      }

      // Transform Prisma model to match Zod schema (null -> undefined)
      return {
        ...job,
        estimatedStartTime: job.estimatedStartTime ?? undefined,
        estimatedCompletionTime: job.estimatedCompletionTime ?? undefined,
        actualCompletionTime: job.actualCompletionTime ?? undefined,
        failureReason: job.failureReason ?? undefined,
        completionPercentage: job.completionPercentage ?? undefined,
      }
    }),

  // Add new print job to queue
  add: protectedProcedure
    .input(
      z.object({
        variantId: z.string(),
        priority: z.number().default(1),
        estimatedStartTime: z.date().optional(),
        estimatedCompletionTime: z.date().optional(),
      }),
    )
    .output(PrintJobSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify variant belongs to user
      const variant = await ctx.db.modelVariant.findFirst({
        where: {
          id: input.variantId,
          userId: ctx.user.id,
        },
      })

      if (!variant) {
        throw new Error('Variant not found or access denied')
      }

      const job = await ctx.db.printJob.create({
        data: {
          ...input,
          userId: ctx.user.id,
          status: 'queued',
          createdAt: new Date(),
        },
      })

      // Transform Prisma model to match Zod schema (null -> undefined)
      return {
        ...job,
        estimatedStartTime: job.estimatedStartTime ?? undefined,
        estimatedCompletionTime: job.estimatedCompletionTime ?? undefined,
        actualCompletionTime: job.actualCompletionTime ?? undefined,
        failureReason: job.failureReason ?? undefined,
        completionPercentage: job.completionPercentage ?? undefined,
      }
    }),

  // Update print job status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['queued', 'printing', 'completed', 'failed']),
        completionPercentage: z.number().min(0).max(100).optional(),
        failureReason: z.string().optional(),
        actualCompletionTime: z.date().optional(),
      }),
    )
    .output(PrintJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Set completion time automatically if status is completed
      if (
        updateData.status === 'completed' &&
        !updateData.actualCompletionTime
      ) {
        updateData.actualCompletionTime = new Date()
        updateData.completionPercentage = 100
      }

      const job = await ctx.db.printJob.updateMany({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: updateData,
      })

      if (job.count === 0) {
        throw new Error('Print job not found or access denied')
      }

      const updatedJob = await ctx.db.printJob.findUniqueOrThrow({
        where: { id },
      })

      // Transform Prisma model to match Zod schema (null -> undefined)
      return {
        ...updatedJob,
        estimatedStartTime: updatedJob.estimatedStartTime ?? undefined,
        estimatedCompletionTime: updatedJob.estimatedCompletionTime ?? undefined,
        actualCompletionTime: updatedJob.actualCompletionTime ?? undefined,
        failureReason: updatedJob.failureReason ?? undefined,
        completionPercentage: updatedJob.completionPercentage ?? undefined,
      }
    }),

  // Update print job priority
  updatePriority: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        priority: z.number(),
      }),
    )
    .output(PrintJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, priority } = input

      const job = await ctx.db.printJob.updateMany({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: { priority },
      })

      if (job.count === 0) {
        throw new Error('Print job not found or access denied')
      }

      const updatedJob = await ctx.db.printJob.findUniqueOrThrow({
        where: { id },
      })

      // Transform Prisma model to match Zod schema (null -> undefined)
      return {
        ...updatedJob,
        estimatedStartTime: updatedJob.estimatedStartTime ?? undefined,
        estimatedCompletionTime: updatedJob.estimatedCompletionTime ?? undefined,
        actualCompletionTime: updatedJob.actualCompletionTime ?? undefined,
        failureReason: updatedJob.failureReason ?? undefined,
        completionPercentage: updatedJob.completionPercentage ?? undefined,
      }
    }),

  // Delete print job
  delete: protectedProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.printJob.deleteMany({
        where: {
          id: input,
          userId: ctx.user.id,
        },
      })

      return result.count > 0
    }),

  // Get queue statistics
  stats: protectedProcedure
    .output(
      z.object({
        total: z.number(),
        queued: z.number(),
        printing: z.number(),
        completed: z.number(),
        failed: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const [total, queued, printing, completed, failed] = await Promise.all([
        ctx.db.printJob.count({ where: { userId: ctx.user.id } }),
        ctx.db.printJob.count({
          where: { userId: ctx.user.id, status: 'queued' },
        }),
        ctx.db.printJob.count({
          where: { userId: ctx.user.id, status: 'printing' },
        }),
        ctx.db.printJob.count({
          where: { userId: ctx.user.id, status: 'completed' },
        }),
        ctx.db.printJob.count({
          where: { userId: ctx.user.id, status: 'failed' },
        }),
      ])

      return {
        total,
        queued,
        printing,
        completed,
        failed,
      }
    }),
})
