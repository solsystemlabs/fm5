import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { generateSignedDownloadUrl } from "@/lib/s3-service";
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/sliced-files/$id/download").methods({
  GET: async ({ params }) => {
    try {
      const slicedFileId = parseInt(params.id);
      
      if (isNaN(slicedFileId)) {
        return Response.json(
          { error: "Invalid file ID" },
          { status: 400 }
        );
      }

      // Find the SlicedFile record
      const slicedFile = await prisma.slicedFile.findUnique({
        where: { id: slicedFileId },
        select: {
          id: true,
          name: true,
          s3Key: true,
          url: true,
          size: true
        }
      });

      if (!slicedFile) {
        return Response.json(
          { error: "File not found" },
          { status: 404 }
        );
      }

      logger.info("Generating download URL", {
        fileId: slicedFileId,
        fileName: slicedFile.name,
        s3Key: slicedFile.s3Key
      });

      // If file has S3 key, generate signed URL
      if (slicedFile.s3Key) {
        try {
          const signedUrl = await generateSignedDownloadUrl(
            slicedFile.s3Key,
            3600 // 1 hour expiration
          );
          
          logger.info("Signed URL generated successfully", {
            fileId: slicedFileId,
            fileName: slicedFile.name
          });
          
          // Redirect to signed URL
          return Response.redirect(signedUrl, 302);
          
        } catch (error) {
          logger.error("Failed to generate signed URL", {
            fileId: slicedFileId,
            s3Key: slicedFile.s3Key,
            error
          });
          
          return Response.json(
            { error: "Failed to generate download URL" },
            { status: 500 }
          );
        }
      }
      
      // Fallback for files without S3 key (legacy files)
      if (slicedFile.url) {
        logger.info("Redirecting to legacy URL", {
          fileId: slicedFileId,
          url: slicedFile.url
        });
        
        return Response.redirect(slicedFile.url, 302);
      }
      
      // No download URL available
      return Response.json(
        { error: "No download URL available for this file" },
        { status: 404 }
      );

    } catch (error) {
      logger.error("Error in download endpoint", { error });
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
});