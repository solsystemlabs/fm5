import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

// Input validation schemas
const createEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const createFilamentTypeSchema = createEntitySchema.extend({
  description: z.string().optional(),
});

export const utilitiesRouter = router({
  // Brands
  brands: router({
    list: publicProcedure.query(async ({ ctx }) => {
      try {
        return await ctx.prisma.brand.findMany({
          orderBy: { name: 'asc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch brands");
      }
    }),

    create: publicProcedure
      .input(createEntitySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.brand.create({
            data: { name: input.name },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to create brand");
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.brand.delete({
            where: { id: input.id },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to delete brand");
        }
      }),
  }),

  // Material Types
  materialTypes: router({
    list: publicProcedure.query(async ({ ctx }) => {
      try {
        return await ctx.prisma.materialType.findMany({
          orderBy: { name: 'asc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch material types");
      }
    }),

    create: publicProcedure
      .input(createEntitySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.materialType.create({
            data: { name: input.name },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to create material type");
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.materialType.delete({
            where: { id: input.id },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to delete material type");
        }
      }),
  }),

  // Filament Types
  filamentTypes: router({
    list: publicProcedure.query(async ({ ctx }) => {
      try {
        return await ctx.prisma.filamentType.findMany({
          orderBy: { name: 'asc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch filament types");
      }
    }),

    create: publicProcedure
      .input(createFilamentTypeSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.filamentType.create({
            data: {
              name: input.name,
              description: input.description,
            },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to create filament type");
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.filamentType.delete({
            where: { id: input.id },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to delete filament type");
        }
      }),
  }),

  // Model Categories
  modelCategories: router({
    list: publicProcedure.query(async ({ ctx }) => {
      try {
        return await ctx.prisma.modelCategory.findMany({
          orderBy: { name: 'asc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch model categories");
      }
    }),

    create: publicProcedure
      .input(createEntitySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.modelCategory.create({
            data: { name: input.name },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to create model category");
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.prisma.modelCategory.delete({
            where: { id: input.id },
          });
        } catch (error) {
          handlePrismaError(error, "Failed to delete model category");
        }
      }),
  }),
});