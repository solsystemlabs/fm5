import { z } from 'zod'
import { UserSchema } from '../schemas'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const authRouter = createTRPCRouter({
  // Get current user information
  me: protectedProcedure.output(UserSchema).query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
    })

    if (!user) {
      throw new Error('User not found in database')
    }

    // Transform Prisma model to match Zod schema (null -> undefined)
    return {
      ...user,
      businessName: user.businessName ?? undefined,
      businessDescription: user.businessDescription ?? undefined,
      lastLoginAt: user.lastLoginAt ?? undefined,
      image: user.image ?? undefined,
      preferences:
        typeof user.preferences === 'object' && user.preferences !== null
          ? (user.preferences as any)
          : {},
    }
  }),

  // Get session information
  session: protectedProcedure
    .output(
      z.object({
        userId: z.string(),
        isAuthenticated: z.boolean(),
      }),
    )
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        isAuthenticated: true,
      }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        businessName: z.string().optional(),
        businessDescription: z.string().optional(),
        preferences: z
          .object({
            units: z.enum(['metric', 'imperial']).optional(),
            defaultFilamentBrand: z.string().optional(),
            notifications: z
              .object({
                email: z.boolean(),
                lowStock: z.boolean(),
                printComplete: z.boolean(),
                systemUpdates: z.boolean(),
              })
              .optional(),
          })
          .optional(),
      }),
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

      // Transform Prisma model to match Zod schema (null -> undefined)
      return {
        ...updatedUser,
        businessName: updatedUser.businessName ?? undefined,
        businessDescription: updatedUser.businessDescription ?? undefined,
        lastLoginAt: updatedUser.lastLoginAt ?? undefined,
        image: updatedUser.image ?? undefined,
        preferences:
          typeof updatedUser.preferences === 'object' &&
          updatedUser.preferences !== null
            ? (updatedUser.preferences as any)
            : {},
      }
    }),
})
