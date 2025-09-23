import { z } from 'zod'
import { UserSchema } from '../schemas'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const authRouter = createTRPCRouter({
  // Get current user information
  me: protectedProcedure
    .output(UserSchema)
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      })

      if (!user) {
        throw new Error('User not found in database')
      }

      return user
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        businessName: z.string().optional(),
        businessDescription: z.string().optional(),
        preferences: z.object({
          units: z.enum(['metric', 'imperial']).optional(),
          defaultFilamentBrand: z.string().optional(),
          notifications: z.object({
            email: z.boolean(),
            lowStock: z.boolean(),
            printComplete: z.boolean(),
            systemUpdates: z.boolean()
          }).optional()
        }).optional()
      })
    )
    .output(UserSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      })

      return updatedUser
    }),
})