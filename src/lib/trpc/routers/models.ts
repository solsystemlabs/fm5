import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

// Input validation schemas
const createModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelCategoryId: z.number().min(1, "Category is required"),
  filamentIds: z.array(z.number()).optional().default([]),
});

const updateModelSchema = createModelSchema.partial().extend({
  id: z.number(),
});

const deleteModelFilesSchema = z.object({
  modelId: z.number(),
  modelFileIds: z.array(z.number()).optional().default([]),
  threeMFFileIds: z.array(z.number()).optional().default([]),
  imageFileIds: z.array(z.number()).optional().default([]),
});

export const modelsRouter = router({
  // Get all models
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.model.findMany({
        include: {
          Category: true,
          Filaments: {
            include: {
              Brand: true,
            },
          },
          ModelFiles: true,
          ThreeMFFiles: {
            include: {
              SlicedFiles: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      handlePrismaError(error, "Failed to fetch models");
    }
  }),

  // Get single model by ID
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.model.findUnique({
          where: { id: input.id },
          include: {
            Category: true,
            Filaments: {
              include: {
                Brand: true,
                Material: true,
                Type: true,
              },
            },
            ModelFiles: true,
            ThreeMFFiles: {
              include: {
                SlicedFiles: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch model");
      }
    }),

  // Get model files, 3MF files, and images by model ID
  files: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const [modelFiles, threeMFFiles, imageFiles] = await Promise.all([
          ctx.prisma.modelFile.findMany({
            where: { modelId: input.id },
            orderBy: { id: 'desc' }
          }),
          ctx.prisma.threeMFFile.findMany({
            where: { modelId: input.id },
            include: {
              SlicedFiles: true,
            },
            orderBy: { id: 'desc' }
          }),
          ctx.prisma.file.findMany({
            where: { 
              entityType: 'MODEL',
              entityId: input.id 
            },
            orderBy: { id: 'desc' }
          })
        ]);

        return {
          modelFiles,
          threeMFFiles,
          imageFiles,
          summary: {
            totalFiles: modelFiles.length + threeMFFiles.length + imageFiles.length,
            modelFilesCount: modelFiles.length,
            threeMFFilesCount: threeMFFiles.length,
            imageFilesCount: imageFiles.length,
            totalSize: [...modelFiles, ...threeMFFiles, ...imageFiles].reduce((sum, file) => sum + file.size, 0)
          }
        };
      } catch (error) {
        handlePrismaError(error, "Failed to fetch model files");
      }
    }),

  // Create new model
  create: publicProcedure
    .input(createModelSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.model.create({
          data: {
            name: input.name,
            modelCategoryId: input.modelCategoryId,
            ...(input.filamentIds.length > 0 && {
              Filaments: {
                connect: input.filamentIds.map((id) => ({ id })),
              },
            }),
          },
          include: {
            Category: true,
            Filaments: {
              include: {
                Brand: true,
              },
            },
            ModelFiles: true,
            ThreeMFFiles: {
              include: {
                SlicedFiles: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to create model");
      }
    }),

  // Update model
  update: publicProcedure
    .input(updateModelSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, filamentIds, ...updateData } = input;
        
        return await ctx.prisma.model.update({
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
            Category: true,
            Filaments: {
              include: {
                Brand: true,
              },
            },
            ModelFiles: true,
            ThreeMFFiles: {
              include: {
                SlicedFiles: true,
              },
            },
          },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to update model");
      }
    }),

  // Delete model
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Note: This will cascade delete ModelFiles, ThreeMFFiles, SlicedFiles and tagged union Files
        // due to the foreign key constraints in the database
        return await ctx.prisma.model.delete({
          where: { id: input.id },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to delete model");
      }
    }),

  // Delete specific model files, 3MF files, and images
  deleteFiles: publicProcedure
    .input(deleteModelFilesSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { modelId, modelFileIds, threeMFFileIds, imageFileIds } = input;

        if (modelFileIds.length === 0 && threeMFFileIds.length === 0 && imageFileIds.length === 0) {
          throw new Error("No file IDs provided");
        }

        // Delete files from database and collect information for cleanup
        const deletedFiles = await ctx.prisma.$transaction(async (tx) => {
          let deletedModelFiles = [];
          let deletedThreeMFFiles = [];
          let deletedImageFiles = [];

          if (modelFileIds.length > 0) {
            // Fetch files before deletion to get S3 keys
            const modelFilesToDelete = await tx.modelFile.findMany({
              where: {
                id: { in: modelFileIds },
                modelId // Ensure files belong to this model
              }
            });

            if (modelFilesToDelete.length > 0) {
              await tx.modelFile.deleteMany({
                where: {
                  id: { in: modelFileIds },
                  modelId
                }
              });
              deletedModelFiles = modelFilesToDelete;
            }
          }

          if (threeMFFileIds.length > 0) {
            // Fetch ThreeMF files before deletion (this will cascade to SlicedFiles)
            const threeMFFilesToDelete = await tx.threeMFFile.findMany({
              where: {
                id: { in: threeMFFileIds },
                modelId // Ensure files belong to this model
              }
            });

            if (threeMFFilesToDelete.length > 0) {
              await tx.threeMFFile.deleteMany({
                where: {
                  id: { in: threeMFFileIds },
                  modelId
                }
              });
              deletedThreeMFFiles = threeMFFilesToDelete;
            }
          }

          if (imageFileIds.length > 0) {
            // Fetch tagged union images before deletion
            const imageFilesToDelete = await tx.file.findMany({
              where: {
                id: { in: imageFileIds },
                entityType: 'MODEL',
                entityId: modelId // Ensure images belong to this model
              }
            });

            if (imageFilesToDelete.length > 0) {
              await tx.file.deleteMany({
                where: {
                  id: { in: imageFileIds },
                  entityType: 'MODEL',
                  entityId: modelId
                }
              });
              deletedImageFiles = imageFilesToDelete;
            }
          }

          return { deletedModelFiles, deletedThreeMFFiles, deletedImageFiles };
        });

        const totalDeleted = deletedFiles.deletedModelFiles.length + 
                           deletedFiles.deletedThreeMFFiles.length + 
                           deletedFiles.deletedImageFiles.length;

        return {
          success: true,
          message: `Successfully deleted ${totalDeleted} files`,
          deletedCounts: {
            modelFiles: deletedFiles.deletedModelFiles.length,
            threeMFFiles: deletedFiles.deletedThreeMFFiles.length,
            imageFiles: deletedFiles.deletedImageFiles.length
          }
        };
      } catch (error) {
        handlePrismaError(error, "Failed to delete files");
      }
    }),

  // Note: File upload operations are complex and involve multipart form data, file processing,
  // and S3 uploads. These will be handled by a separate API endpoint that works alongside
  // tRPC for now, until tRPC supports file uploads natively or we implement a custom solution.
});