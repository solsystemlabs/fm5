import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";
import { generateSignedDownloadUrl, generateModelImageS3Key } from "@/lib/s3-service";
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

// Validation schema for image ID parameter
const paramsSchema = z.object({
  imageId: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute("/api/download/model-image/$imageId").methods({
  GET: async ({ params }) => {
    try {
      // Validate image ID parameter
      const validatedParams = paramsSchema.parse(params);
      const imageId = validatedParams.imageId;

      // Find the model image
      const modelImage = await prisma.modelImage.findUnique({
        where: { id: imageId },
        include: {
          Model: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      if (!modelImage) {
        return Response.json(
          { error: "Image not found" },
          { status: 404 }
        );
      }

      logger.info('Generating download URL for model image', {
        imageId,
        imageName: modelImage.name,
        modelId: modelImage.modelId,
        modelName: modelImage.Model.name
      });

      // Generate the S3 key for this image
      const s3Key = generateModelImageS3Key(modelImage.modelId, modelImage.name);

      // Generate signed download URL (expires in 1 hour)
      const downloadUrl = await generateSignedDownloadUrl(s3Key, 3600);

      logger.info('Download URL generated successfully', {
        imageId,
        imageName: modelImage.name,
        s3Key
      });

      // Return the signed URL
      return Response.json({
        downloadUrl,
        filename: modelImage.name,
        size: modelImage.size,
        contentType: getContentTypeFromFilename(modelImage.name)
      });

    } catch (error) {
      logger.error('Failed to generate download URL', {
        params,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid image ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { 
          error: "Failed to generate download URL", 
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
});

// Helper function to determine content type from filename
function getContentTypeFromFilename(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}