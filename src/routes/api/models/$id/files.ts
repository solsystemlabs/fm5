import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";
import { processUploadedFiles, cleanupPreviews } from "@/lib/file-processing-service";
import { uploadModelFilesAndImages } from "@/lib/s3-service";
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

// Validation schema for model ID parameter
const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute("/api/models/$id/files").methods({
  POST: async ({ request, params }) => {
    try {
      // Validate model ID parameter
      const validatedParams = paramsSchema.parse(params);
      const modelId = validatedParams.id;

      // Verify model exists
      const model = await prisma.model.findUnique({
        where: { id: modelId },
        include: {
          Category: true,
        },
      });

      if (!model) {
        return Response.json(
          { error: "Model not found" },
          { status: 404 }
        );
      }

      // Parse multipart form data
      const formData = await request.formData();
      const files: File[] = [];

      // Extract files from form data
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return Response.json(
          { error: "No files provided" },
          { status: 400 }
        );
      }

      logger.info('Processing file upload', {
        modelId,
        modelName: model.name,
        fileCount: files.length,
        filenames: files.map(f => f.name)
      });

      // Process uploaded files (extract ZIP, categorize, validate)
      const processedFiles = await processUploadedFiles(files);

      logger.info('Files processed successfully', {
        modelId,
        images: processedFiles.images.length,
        imageDetails: processedFiles.images.map(img => ({ name: img.name, size: img.size, category: img.category })),
        modelFiles: processedFiles.modelFiles.length,
        modelFileDetails: processedFiles.modelFiles.map(f => ({ name: f.name, size: f.size, fileType: f.fileType })),
        totalSize: processedFiles.totalSize
      });

      // Upload files to S3
      const uploadResults = await uploadModelFilesAndImages(
        processedFiles.modelFiles.map(f => f.file),
        processedFiles.images.map(f => f.file),
        modelId
      );

      logger.info('S3 upload completed', {
        modelId,
        modelFilesUploaded: uploadResults.modelFiles.length,
        modelFilesSuccess: uploadResults.modelFiles.filter(r => !r.error).length,
        imagesUploaded: uploadResults.images.length,
        imagesSuccess: uploadResults.images.filter(r => !r.error).length,
        uploadErrors: [...uploadResults.modelFiles, ...uploadResults.images].filter(r => r.error).map(r => ({ file: r.filename, error: r.error }))
      });

      // Prepare database records
      const modelFileRecords = [];
      const modelImageRecords = [];

      // Process successful model file uploads
      for (const result of uploadResults.modelFiles) {
        if (!result.error) {
          modelFileRecords.push({
            name: result.filename,
            modelId,
            url: result.s3Url,
            size: result.size,
          });
        }
      }

      // Process successful image uploads
      for (const result of uploadResults.images) {
        if (!result.error) {
          modelImageRecords.push({
            name: result.filename,
            modelId,
            url: result.s3Url,
            size: result.size,
          });
        }
      }

      logger.info('Database records to be created', {
        modelId,
        modelFileRecords: modelFileRecords.length,
        modelFileDetails: modelFileRecords.map(r => ({ name: r.name, url: r.url, size: r.size })),
        modelImageRecords: modelImageRecords.length,
        modelImageDetails: modelImageRecords.map(r => ({ name: r.name, url: r.url, size: r.size }))
      });

      // Save to database using transactions
      const dbResults = await prisma.$transaction(async (tx) => {
        const createdModelFiles = modelFileRecords.length > 0
          ? await tx.modelFile.createMany({
              data: modelFileRecords,
              skipDuplicates: true,
            })
          : { count: 0 };

        logger.info('ModelFiles database operation result', {
          modelId,
          recordsToCreate: modelFileRecords.length,
          recordsCreated: createdModelFiles.count
        });

        const createdModelImages = modelImageRecords.length > 0
          ? await tx.modelImage.createMany({
              data: modelImageRecords,
              skipDuplicates: true,
            })
          : { count: 0 };

        logger.info('ModelImages database operation result', {
          modelId,
          recordsToCreate: modelImageRecords.length,
          recordsCreated: createdModelImages.count
        });

        // Fetch the created records with full data
        const modelFiles = modelFileRecords.length > 0
          ? await tx.modelFile.findMany({
              where: {
                modelId,
                name: { in: modelFileRecords.map(r => r.name) }
              }
            })
          : [];

        const modelImages = modelImageRecords.length > 0
          ? await tx.modelImage.findMany({
              where: {
                modelId,
                name: { in: modelImageRecords.map(r => r.name) }
              }
            })
          : [];

        return {
          modelFilesCount: createdModelFiles.count,
          modelImagesCount: createdModelImages.count,
          modelFiles,
          modelImages,
        };
      });

      // Clean up blob URLs to prevent memory leaks
      cleanupPreviews(processedFiles);

      // Collect any upload errors
      const uploadErrors = [
        ...uploadResults.modelFiles.filter(r => r.error).map(r => ({ file: r.filename, error: r.error })),
        ...uploadResults.images.filter(r => r.error).map(r => ({ file: r.filename, error: r.error }))
      ];

      logger.info('File upload completed', {
        modelId,
        modelFilesCreated: dbResults.modelFilesCount,
        modelImagesCreated: dbResults.modelImagesCount,
        uploadErrors: uploadErrors.length
      });

      const response = {
        success: true,
        message: `Successfully uploaded ${dbResults.modelFilesCount + dbResults.modelImagesCount} files`,
        data: {
          modelFiles: dbResults.modelFiles,
          modelImages: dbResults.modelImages,
          summary: {
            totalProcessed: processedFiles.extractedCount,
            modelFilesUploaded: dbResults.modelFilesCount,
            modelImagesUploaded: dbResults.modelImagesCount,
            totalSize: processedFiles.totalSize,
          }
        },
        ...(uploadErrors.length > 0 && {
          errors: uploadErrors,
          warning: `${uploadErrors.length} files failed to upload`
        })
      };

      return Response.json(response);

    } catch (error) {
      logger.error('File upload failed', {
        params,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Determine appropriate error response
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid model ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { 
          error: "Failed to upload files", 
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  },

  GET: async ({ params }) => {
    try {
      // Validate model ID parameter
      const validatedParams = paramsSchema.parse(params);
      const modelId = validatedParams.id;

      // Fetch model files and images
      const [modelFiles, modelImages] = await Promise.all([
        prisma.modelFile.findMany({
          where: { modelId },
          orderBy: { id: 'desc' }
        }),
        prisma.modelImage.findMany({
          where: { modelId },
          orderBy: { id: 'desc' }
        })
      ]);

      return Response.json({
        modelFiles,
        modelImages,
        summary: {
          totalFiles: modelFiles.length + modelImages.length,
          modelFilesCount: modelFiles.length,
          modelImagesCount: modelImages.length,
          totalSize: [...modelFiles, ...modelImages].reduce((sum, file) => sum + file.size, 0)
        }
      });

    } catch (error) {
      logger.error('Failed to fetch model files', {
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid model ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to fetch model files" },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      // Validate model ID parameter
      const validatedParams = paramsSchema.parse(params);
      const modelId = validatedParams.id;

      // Parse request body for file IDs to delete
      const body = await request.json();
      const { modelFileIds = [], modelImageIds = [] } = body;

      if (modelFileIds.length === 0 && modelImageIds.length === 0) {
        return Response.json(
          { error: "No file IDs provided" },
          { status: 400 }
        );
      }

      // Delete files from database and collect S3 keys for cleanup
      const deletedFiles = await prisma.$transaction(async (tx) => {
        let deletedModelFiles = [];
        let deletedModelImages = [];

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

        if (modelImageIds.length > 0) {
          // Fetch images before deletion to get S3 keys
          const modelImagesToDelete = await tx.modelImage.findMany({
            where: {
              id: { in: modelImageIds },
              modelId // Ensure images belong to this model
            }
          });

          if (modelImagesToDelete.length > 0) {
            await tx.modelImage.deleteMany({
              where: {
                id: { in: modelImageIds },
                modelId
              }
            });
            deletedModelImages = modelImagesToDelete;
          }
        }

        return { deletedModelFiles, deletedModelImages };
      });

      // TODO: In a production system, we should also delete the files from S3
      // This can be done asynchronously or as part of a cleanup job
      // For now, we'll just log the S3 keys that should be deleted
      const s3KeysToDelete = [
        ...deletedFiles.deletedModelFiles.map(f => f.url),
        ...deletedFiles.deletedModelImages.map(f => f.url)
      ];

      logger.info('Files deleted from database', {
        modelId,
        modelFilesDeleted: deletedFiles.deletedModelFiles.length,
        modelImagesDeleted: deletedFiles.deletedModelImages.length,
        s3KeysToDelete
      });

      return Response.json({
        success: true,
        message: `Successfully deleted ${deletedFiles.deletedModelFiles.length + deletedFiles.deletedModelImages.length} files`,
        deletedCounts: {
          modelFiles: deletedFiles.deletedModelFiles.length,
          modelImages: deletedFiles.deletedModelImages.length
        }
      });

    } catch (error) {
      logger.error('Failed to delete model files', {
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid model ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to delete files" },
        { status: 500 }
      );
    }
  }
});