import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for model ID parameter
const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute("/api/models/$id").methods({
  DELETE: async ({ params }) => {
    try {
      // Validate model ID parameter
      const validatedParams = paramsSchema.parse(params);
      const modelId = validatedParams.id;

      // Check if model exists and get related data
      const model = await prisma.model.findUnique({
        where: { id: modelId },
        include: {
          ModelFiles: true,
          ModelImage: true,
          SlicedFiles: true,
        },
      });

      if (!model) {
        return Response.json(
          { error: "Model not found" },
          { status: 404 }
        );
      }

      // Delete the model and all related data using cascade
      await prisma.model.delete({
        where: { id: modelId },
      });

      // TODO: In production, also delete files from S3
      // The related ModelFiles, ModelImages, and SlicedFiles should be deleted by cascade

      return Response.json({
        success: true,
        message: `Model "${model.name}" and all associated files deleted successfully`,
        deletedCounts: {
          modelFiles: model.ModelFiles.length,
          modelImages: model.ModelImage.length,
          slicedFiles: model.SlicedFiles.length,
        }
      });

    } catch (error) {
      console.error("Error deleting model:", error);
      
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid model ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to delete model" },
        { status: 500 }
      );
    }
  },
});