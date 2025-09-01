import { z } from "zod";
import { router, publicProcedure, handlePrismaError } from "../init";

// Input validation schema for creating filaments (matching existing API)
const createFilamentSchema = z.object({
  color: z.string().min(1, "Color is required"),
  name: z.string().min(1, "Name is required"),
  filamentTypeId: z.number().min(1, "Filament type is required"),
  materialTypeId: z.number().min(1, "Material type is required"),
  modelIds: z.array(z.number()).optional(),
  cost: z.number().positive("Cost must be positive").optional(),
  grams: z.number().positive("Weight must be positive").optional(),
  brandName: z.string().min(1, "Brand is required"),
  diameter: z.number().positive("Diameter must be positive"),
});

const updateFilamentSchema = createFilamentSchema.partial().extend({
  id: z.number(),
});

export const filamentsRouter = router({
  // Get all filaments
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.filament.findMany({
        include: {
          Material: true,
          Type: true,
          Brand: true,
          Models: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: {
          color: "asc",
        },
      });
    } catch (error) {
      handlePrismaError(error, "Failed to fetch filaments");
    }
  }),

  // Get filaments grouped by material type (existing endpoint)
  grouped: publicProcedure.query(async ({ ctx }) => {
    try {
      const filaments = await ctx.prisma.filament.findMany({
        include: {
          Material: true,
          Type: true,
          Brand: true,
          Models: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: [{ Material: { name: "asc" } }, { color: "asc" }],
      });

      // Group by material type
      const groupedFilaments: Record<string, typeof filaments> = {};
      for (const filament of filaments) {
        const materialName = filament.Material.name;
        if (!groupedFilaments[materialName]) {
          groupedFilaments[materialName] = [];
        }
        groupedFilaments[materialName].push(filament);
      }

      return groupedFilaments;
    } catch (error) {
      handlePrismaError(error, "Failed to fetch grouped filaments");
    }
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.filament.findUnique({
          where: { id: input.id },
          include: {
            Material: true,
            Type: true,
            Brand: true,
            Models: {
              include: {
                Category: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch filament");
      }
    }),

  // Get models for a specific filament
  models: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const filament = await ctx.prisma.filament.findUnique({
          where: { id: input.id },
          include: {
            Models: {
              include: {
                Category: true,
              },
            },
          },
        });
        return filament?.Models || [];
      } catch (error) {
        handlePrismaError(error, "Failed to fetch filament models");
      }
    }),

  // Create new filament
  create: publicProcedure
    .input(createFilamentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.filament.create({
          data: {
            color: input.color,
            name: input.name,
            materialTypeId: input.materialTypeId,
            filamentTypeId: input.filamentTypeId,
            brandName: input.brandName,
            diameter: input.diameter,
            cost: input.cost,
            grams: input.grams,
            Models:
              input.modelIds && input.modelIds.length > 0
                ? {
                    connect: input.modelIds.map((id) => ({ id })),
                  }
                : undefined,
          },
          include: {
            Material: true,
            Type: true,
            Brand: true,
            Models: {
              include: {
                Category: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to create filament");
      }
    }),

  // Update filament
  update: publicProcedure
    .input(updateFilamentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, modelIds, ...updateData } = input;

        return await ctx.prisma.filament.update({
          where: { id },
          data: {
            ...updateData,
            Models:
              modelIds !== undefined
                ? {
                    set: modelIds.map((id) => ({ id })),
                  }
                : undefined,
          },
          include: {
            Material: true,
            Type: true,
            Brand: true,
            Models: {
              include: {
                Category: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to update filament");
      }
    }),

  // Delete filament
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.filament.delete({
          where: { id: input.id },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to delete filament");
      }
    }),
});

