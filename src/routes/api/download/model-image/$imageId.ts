import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";
import { generateSignedDownloadUrl } from "@/lib/s3-service";
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

      // Find the image in the tagged union File system
      const imageFile = await prisma.file.findUnique({
        where: { id: imageId },
      });

      if (!imageFile) {
        return Response.json(
          { error: "Image not found" },
          { status: 404 }
        );
      }

      // Ensure this is actually an image file
      if (!imageFile.mimeType?.startsWith('image/')) {
        return Response.json(
          { error: "File is not an image" },
          { status: 400 }
        );
      }

      logger.info('Generating download URL for image file', {
        imageId,
        imageName: imageFile.name,
        entityType: imageFile.entityType,
        entityId: imageFile.entityId,
        mimeType: imageFile.mimeType
      });

      // Use S3 key if available, otherwise generate from URL
      const s3Key = imageFile.s3Key;
      if (!s3Key) {
        logger.warn('No S3 key found for image file, returning direct URL', {
          imageId,
          imageName: imageFile.name
        });
        
        return Response.json({
          downloadUrl: imageFile.url,
          filename: imageFile.name,
          size: imageFile.size,
          contentType: imageFile.mimeType || getContentTypeFromFilename(imageFile.name)
        });
      }

      // Generate signed download URL (expires in 1 hour)
      const downloadUrl = await generateSignedDownloadUrl(s3Key, 3600);

      logger.info('Download URL generated successfully', {
        imageId,
        imageName: imageFile.name,
        s3Key
      });

      // Return the signed URL
      return Response.json({
        downloadUrl,
        filename: imageFile.name,
        size: imageFile.size,
        contentType: imageFile.mimeType || getContentTypeFromFilename(imageFile.name)
      });

    } catch (error) {
      logger.error('Failed to generate download URL', {
        params,
        error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : 'Unknown error'),
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