import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

// Input validation schemas
const createThreeMFFileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().min(1, "Model ID is required"),
  url: z.string().url("Valid URL is required"),
  size: z.number().min(0, "Size must be non-negative"),
  s3Key: z.string().optional(),
  hasGcode: z.boolean().optional().default(false),
});

const updateThreeMFFileSchema = createThreeMFFileSchema.partial().extend({
  id: z.number(),
});

export const threeMFFilesRouter = router({
  // Get all 3MF files for a model
  byModelId: publicProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.threeMFFile.findMany({
          where: { modelId: input.modelId },
          include: {
            Model: true,
            SlicedFiles: {
              include: {
                SlicedFileFilaments: {
                  include: {
                    filament: {
                      include: {
                        Brand: true,
                        Material: true,
                        Type: true,
                      },
                    },
                  },
                },
                Products: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch 3MF files");
      }
    }),

  // Get single 3MF file by ID with full details
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const threeMFFile = await ctx.prisma.threeMFFile.findUnique({
          where: { id: input.id },
          include: {
            Model: {
              include: {
                Category: true,
              },
            },
            SlicedFiles: {
              include: {
                SlicedFileFilaments: {
                  include: {
                    filament: {
                      include: {
                        Brand: true,
                        Material: true,
                        Type: true,
                      },
                    },
                  },
                },
                Products: true,
              },
            },
          },
        });

        if (!threeMFFile) {
          throw new Error("3MF file not found");
        }

        // Get associated images from tagged union File system
        const images = await ctx.prisma.file.findMany({
          where: {
            entityType: 'THREE_MF',
            entityId: input.id,
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          ...threeMFFile,
          images,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to fetch 3MF file");
      }
    }),

  // Create new 3MF file
  create: publicProcedure
    .input(createThreeMFFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.threeMFFile.create({
          data: input,
          include: {
            Model: true,
            SlicedFiles: true,
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to create 3MF file");
      }
    }),

  // Update 3MF file
  update: publicProcedure
    .input(updateThreeMFFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        
        return await ctx.prisma.threeMFFile.update({
          where: { id },
          data: updateData,
          include: {
            Model: true,
            SlicedFiles: true,
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to update 3MF file");
      }
    }),

  // Delete 3MF file (will cascade to SlicedFiles)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the file with its sliced files to know what will be deleted
        const threeMFFile = await ctx.prisma.threeMFFile.findUnique({
          where: { id: input.id },
          include: {
            SlicedFiles: true,
          },
        });

        if (!threeMFFile) {
          throw new Error("3MF file not found");
        }

        // Delete the 3MF file (will cascade delete SlicedFiles and associated records)
        await ctx.prisma.threeMFFile.delete({
          where: { id: input.id },
        });

        return {
          success: true,
          message: `Successfully deleted 3MF file "${threeMFFile.name}" and ${threeMFFile.SlicedFiles.length} associated sliced files`,
          deletedSlicedFilesCount: threeMFFile.SlicedFiles.length,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to delete 3MF file");
      }
    }),

  // Get images for a specific 3MF file
  images: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.file.findMany({
          where: {
            entityType: 'THREE_MF',
            entityId: input.id,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch 3MF file images");
      }
    }),

  // List all 3MF files with summary info
  list: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.prisma.threeMFFile.findMany({
          include: {
            Model: {
              include: {
                Category: true,
              },
            },
            SlicedFiles: {
              select: {
                id: true,
                name: true,
                printTimeMinutes: true,
                totalFilamentWeight: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch 3MF files");
      }
    }),
});