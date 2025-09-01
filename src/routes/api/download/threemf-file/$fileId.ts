import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  generateSignedDownloadUrl,
  generateThreeMFFileS3Key,
} from "@/lib/s3-service";
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

// Validation schema for file ID parameter
const paramsSchema = z.object({
  fileId: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute(
  "/api/download/threemf-file/$fileId",
).methods({
  GET: async ({ params }) => {
    try {
      // Validate file ID parameter
      const validatedParams = paramsSchema.parse(params);
      const fileId = validatedParams.fileId;

      // Find the 3MF file
      const threeMFFile = await prisma.threeMFFile.findUnique({
        where: { id: fileId },
        include: {
          Model: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!threeMFFile) {
        return Response.json({ error: "File not found" }, { status: 404 });
      }

      logger.info("Generating download URL for 3MF file", {
        fileId,
        fileName: threeMFFile.name,
        modelId: threeMFFile.modelId,
        modelName: threeMFFile.Model.name,
      });

      const s3Key = generateThreeMFFileS3Key(
        threeMFFile.modelId,
        threeMFFile.name,
      );

      // Generate signed download URL (expires in 1 hour)
      const downloadUrl = await generateSignedDownloadUrl(s3Key, 3600);

      logger.info("Download URL generated successfully", {
        fileId,
        fileName: threeMFFile.name,
        s3Key,
      });

      // Return the signed URL
      return Response.json({
        downloadUrl,
        filename: threeMFFile.name,
        size: threeMFFile.size,
        contentType: getContentTypeFromFilename(threeMFFile.name),
      });
    } catch (error) {
      logger.error("Failed to generate download URL", {
        params,
        error:
          error instanceof Error
            ? error
            : new Error(
                error instanceof Error ? error.message : "Unknown error",
              ),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid file ID", details: error.errors },
          { status: 400 },
        );
      }

      return Response.json(
        {
          error: "Failed to generate download URL",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
});

// Helper function to determine content type from filename
function getContentTypeFromFilename(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop();

  switch (extension) {
    case "stl":
      return "model/stl";
    case "3mf":
      return "application/vnd.ms-3mfdocument";
    case "gcode":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

