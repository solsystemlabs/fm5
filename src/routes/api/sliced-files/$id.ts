import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for sliced file ID parameter
const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute("/api/sliced-files/$id").methods({
  DELETE: async ({ params }) => {
    try {
      // Validate sliced file ID parameter
      const validatedParams = paramsSchema.parse(params);
      const slicedFileId = validatedParams.id;

      // Check if sliced file exists
      const slicedFile = await prisma.slicedFile.findUnique({
        where: { id: slicedFileId },
      });

      if (!slicedFile) {
        return Response.json(
          { error: "Sliced file not found" },
          { status: 404 }
        );
      }

      // Delete the sliced file
      await prisma.slicedFile.delete({
        where: { id: slicedFileId },
      });

      // TODO: In production, also delete file from S3
      // The S3 URL is stored in slicedFile.url

      return Response.json({
        success: true,
        message: `Sliced file "${slicedFile.filename}" deleted successfully`,
      });

    } catch (error) {
      console.error("Error deleting sliced file:", error);
      
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid sliced file ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to delete sliced file" },
        { status: 500 }
      );
    }
  },
});