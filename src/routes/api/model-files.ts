import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/model-files").methods({
  GET: async () => {
    try {
      // Fetch all model files with associated model and category information
      const modelFiles = await prisma.modelFile.findMany({
        include: {
          Model: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: {
          id: "desc", // Most recent first
        },
      });

      // Also fetch model images for comprehensive file listing
      const modelImages = await prisma.modelImage.findMany({
        include: {
          Model: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: {
          id: "desc", // Most recent first
        },
      });

      // Combine and format the response
      const allFiles = [
        ...modelFiles.map(file => ({
          ...file,
          type: 'modelFile' as const,
          fileExtension: file.name.split('.').pop()?.toLowerCase() || 'unknown'
        })),
        ...modelImages.map(image => ({
          ...image,
          type: 'modelImage' as const,
          fileExtension: image.name.split('.').pop()?.toLowerCase() || 'unknown'
        }))
      ].sort((a, b) => b.id - a.id); // Sort by ID descending (most recent first)

      const summary = {
        totalFiles: allFiles.length,
        modelFilesCount: modelFiles.length,
        modelImagesCount: modelImages.length,
        totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
        fileTypes: {
          images: modelImages.reduce((acc, img) => {
            const ext = img.name.split('.').pop()?.toLowerCase() || 'unknown';
            acc[ext] = (acc[ext] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          models: modelFiles.reduce((acc, file) => {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
            acc[ext] = (acc[ext] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      };

      return Response.json({
        files: allFiles,
        summary
      });

    } catch (error) {
      logger.error("Error fetching model files", {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return Response.json(
        { error: "Failed to fetch model files" },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ request }) => {
    try {
      const body = await request.json();
      const { fileIds, type } = body;

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return Response.json(
          { error: "No file IDs provided" },
          { status: 400 }
        );
      }

      if (!type || (type !== 'modelFile' && type !== 'modelImage')) {
        return Response.json(
          { error: "Invalid or missing file type. Must be 'modelFile' or 'modelImage'" },
          { status: 400 }
        );
      }

      let deletedCount = 0;
      let s3UrlsToDelete: string[] = [];

      if (type === 'modelFile') {
        // Get the files before deletion to collect S3 URLs
        const filesToDelete = await prisma.modelFile.findMany({
          where: { id: { in: fileIds } }
        });

        s3UrlsToDelete = filesToDelete.map(f => f.url);

        const deleteResult = await prisma.modelFile.deleteMany({
          where: { id: { in: fileIds } }
        });

        deletedCount = deleteResult.count;
      } else {
        // Get the images before deletion to collect S3 URLs
        const imagesToDelete = await prisma.modelImage.findMany({
          where: { id: { in: fileIds } }
        });

        s3UrlsToDelete = imagesToDelete.map(i => i.url);

        const deleteResult = await prisma.modelImage.deleteMany({
          where: { id: { in: fileIds } }
        });

        deletedCount = deleteResult.count;
      }

      // TODO: In production, also delete from S3
      // This could be done asynchronously or as part of a cleanup job
      logger.info('Model files deleted', {
        type,
        deletedCount,
        s3UrlsToDelete
      });

      return Response.json({
        success: true,
        message: `Successfully deleted ${deletedCount} ${type === 'modelFile' ? 'model files' : 'images'}`,
        deletedCount
      });

    } catch (error) {
      logger.error("Error deleting model files", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return Response.json(
        { error: "Failed to delete model files" },
        { status: 500 }
      );
    }
  }
});