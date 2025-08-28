import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

// Input validation schemas
const createSlicedFileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().int().positive("Valid model ID is required"),
  url: z.string().url("Valid URL is required"),
  size: z.number().int().positive("Valid file size is required"),
  s3Key: z.string().optional(),
  
  // Basic print information
  printTimeMinutes: z.number().optional(),
  totalTimeMinutes: z.number().optional(),
  layerCount: z.number().optional(),
  layerHeight: z.number().optional(),
  maxZHeight: z.number().optional(),
  
  // Slicer information
  slicerName: z.string().optional(),
  slicerVersion: z.string().optional(),
  profileName: z.string().optional(),
  
  // Printer settings
  nozzleDiameter: z.number().optional(),
  bedType: z.string().optional(),
  bedTemperature: z.number().optional(),
  
  // Filament totals
  totalFilamentLength: z.number().optional(),
  totalFilamentVolume: z.number().optional(),
  totalFilamentWeight: z.number().optional(),
});

const updateSlicedFileSchema = createSlicedFileSchema.partial().extend({
  id: z.number(),
});

export const slicedFilesRouter = router({
  // Get all sliced files
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.slicedFile.findMany({
        include: {
          SlicedFileFilaments: {
            orderBy: {
              filamentIndex: "asc"
            }
          },
          ModelFile: true,
          Model: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      handlePrismaError(error, "Failed to fetch sliced files");
    }
  }),

  // Get single sliced file by ID
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.slicedFile.findUnique({
          where: { id: input.id },
          include: {
            SlicedFileFilaments: {
              orderBy: {
                filamentIndex: "asc"
              },
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
            ModelFile: true,
            Model: {
              include: {
                Category: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch sliced file");
      }
    }),

  // Create new sliced file (without file upload - that's handled by separate endpoint)
  create: publicProcedure
    .input(createSlicedFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.slicedFile.create({
          data: input,
          include: {
            SlicedFileFilaments: {
              orderBy: { filamentIndex: "asc" }
            },
            ModelFile: true,
            Model: {
              include: {
                Category: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to create sliced file");
      }
    }),

  // Update sliced file
  update: publicProcedure
    .input(updateSlicedFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        
        return await ctx.prisma.slicedFile.update({
          where: { id },
          data: updateData,
          include: {
            SlicedFileFilaments: {
              orderBy: { filamentIndex: "asc" }
            },
            ModelFile: true,
            Model: {
              include: {
                Category: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to update sliced file");
      }
    }),

  // Delete sliced file
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // This will also cascade delete associated SlicedFileFilaments
        // due to the foreign key constraints in the database
        return await ctx.prisma.slicedFile.delete({
          where: { id: input.id },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to delete sliced file");
      }
    }),

  // Get sliced files by model ID
  byModel: publicProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.slicedFile.findMany({
          where: { modelId: input.modelId },
          include: {
            SlicedFileFilaments: {
              orderBy: {
                filamentIndex: "asc"
              }
            },
            ModelFile: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch sliced files for model");
      }
    }),

  // Note: File upload operations for sliced files are complex and involve
  // multipart form data, 3MF parsing, and S3 uploads. These will be handled
  // by a separate API endpoint that works alongside tRPC for now.
});