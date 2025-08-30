import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

// Input validation schemas
const createFileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL is required"),
  size: z.number().min(0, "Size must be non-negative"),
  s3Key: z.string().optional(),
  mimeType: z.string().optional(),
  entityType: z.enum(['MODEL', 'THREE_MF', 'SLICED_FILE']),
  entityId: z.number().min(1, "Entity ID is required"),
});

const updateFileSchema = createFileSchema.partial().extend({
  id: z.number(),
});

const deleteFilesSchema = z.object({
  fileIds: z.array(z.number()).min(1, "At least one file ID is required"),
});

export const filesRouter = router({
  // Get files by entity
  byEntity: publicProcedure
    .input(z.object({ 
      entityType: z.enum(['MODEL', 'THREE_MF', 'SLICED_FILE']), 
      entityId: z.number() 
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.file.findMany({
          where: {
            entityType: input.entityType,
            entityId: input.entityId,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch files");
      }
    }),

  // Get single file by ID
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const file = await ctx.prisma.file.findUnique({
          where: { id: input.id },
        });

        if (!file) {
          throw new Error("File not found");
        }

        return file;
      } catch (error) {
        handlePrismaError(error, "Failed to fetch file");
      }
    }),

  // Get files by type (all images, for example)
  byMimeType: publicProcedure
    .input(z.object({ 
      mimeTypePattern: z.string(), // e.g., "image/%"
      limit: z.number().optional().default(50) 
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.file.findMany({
          where: {
            mimeType: {
              contains: input.mimeTypePattern.replace('%', ''),
            },
          },
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        handlePrismaError(error, "Failed to fetch files by mime type");
      }
    }),

  // Create new file record
  create: publicProcedure
    .input(createFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.file.create({
          data: input,
        });
      } catch (error) {
        handlePrismaError(error, "Failed to create file record");
      }
    }),

  // Batch create multiple files
  createMany: publicProcedure
    .input(z.object({
      files: z.array(createFileSchema).min(1, "At least one file is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.prisma.file.createMany({
          data: input.files,
        });

        return {
          success: true,
          count: result.count,
          message: `Successfully created ${result.count} file records`,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to create file records");
      }
    }),

  // Update file record
  update: publicProcedure
    .input(updateFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        
        return await ctx.prisma.file.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        handlePrismaError(error, "Failed to update file record");
      }
    }),

  // Delete file records
  delete: publicProcedure
    .input(deleteFilesSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get files to be deleted for S3 cleanup info
        const filesToDelete = await ctx.prisma.file.findMany({
          where: {
            id: { in: input.fileIds },
          },
        });

        // Delete from database
        const result = await ctx.prisma.file.deleteMany({
          where: {
            id: { in: input.fileIds },
          },
        });

        return {
          success: true,
          deletedCount: result.count,
          message: `Successfully deleted ${result.count} file records`,
          deletedFiles: filesToDelete, // For S3 cleanup
        };
      } catch (error) {
        handlePrismaError(error, "Failed to delete file records");
      }
    }),

  // Get file statistics
  stats: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const [totalCount, modelFiles, threeMFFiles, slicedFiles] = await Promise.all([
          ctx.prisma.file.count(),
          ctx.prisma.file.count({ where: { entityType: 'MODEL' } }),
          ctx.prisma.file.count({ where: { entityType: 'THREE_MF' } }),
          ctx.prisma.file.count({ where: { entityType: 'SLICED_FILE' } }),
        ]);

        const totalSize = await ctx.prisma.file.aggregate({
          _sum: { size: true },
        });

        return {
          totalCount,
          breakdown: {
            modelFiles,
            threeMFFiles,
            slicedFiles,
          },
          totalSize: totalSize._sum.size || 0,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to fetch file statistics");
      }
    }),
});