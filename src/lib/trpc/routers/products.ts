import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

// Input validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().min(1, "Model is required"),
  filamentIds: z.array(z.number()).optional(),
  price: z.number().positive("Price must be positive").optional(),
  slicedFileId: z.number().min(1, "Sliced file is required"),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.number(),
});

export const productsRouter = router({
  // Get all products
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.product.findMany({
        include: {
          model: {
            include: {
              Category: true,
            },
          },
          Filaments: {
            include: {
              Brand: true,
              Material: true,
              Type: true,
            },
          },
          slicedFile: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      handlePrismaError(error, "Failed to fetch products");
    }
  }),

  // Get single product by ID
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.product.findUnique({
          where: { id: input.id },
          include: {
            model: {
              include: {
                Category: true,
              },
            },
            Filaments: {
              include: {
                Brand: true,
                Material: true,
                Type: true,
              },
            },
            slicedFile: {
              include: {
                SlicedFileFilaments: {
                  orderBy: { filamentIndex: "asc" },
                },
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch product");
      }
    }),

  // Create new product
  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.product.create({
          data: {
            name: input.name,
            modelId: input.modelId,
            price: input.price,
            slicedFileId: input.slicedFileId,
            Filaments: input.filamentIds && input.filamentIds.length > 0
              ? {
                  connect: input.filamentIds.map((id) => ({ id })),
                }
              : undefined,
          },
          include: {
            model: {
              include: {
                Category: true,
              },
            },
            Filaments: {
              include: {
                Brand: true,
                Material: true,
                Type: true,
              },
            },
            slicedFile: true,
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to create product");
      }
    }),

  // Update product
  update: publicProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, filamentIds, ...updateData } = input;
        
        return await ctx.prisma.product.update({
          where: { id },
          data: {
            ...updateData,
            ...(filamentIds !== undefined && {
              Filaments: {
                set: filamentIds.map((id) => ({ id })),
              },
            }),
          },
          include: {
            model: {
              include: {
                Category: true,
              },
            },
            Filaments: {
              include: {
                Brand: true,
                Material: true,
                Type: true,
              },
            },
            slicedFile: true,
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to update product");
      }
    }),

  // Delete product
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.product.delete({
          where: { id: input.id },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to delete product");
      }
    }),
});