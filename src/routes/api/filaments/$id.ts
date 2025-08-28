import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for filament ID parameter
const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute("/api/filaments/$id").methods({
  DELETE: async ({ params }) => {
    try {
      // Validate filament ID parameter
      const validatedParams = paramsSchema.parse(params);
      const filamentId = validatedParams.id;

      // Check if filament exists and get related data
      const filament = await prisma.filament.findUnique({
        where: { id: filamentId },
        include: {
          Models: true,
        },
      });

      if (!filament) {
        return Response.json(
          { error: "Filament not found" },
          { status: 404 }
        );
      }

      // Delete the filament (models relationship will be disconnected automatically)
      await prisma.filament.delete({
        where: { id: filamentId },
      });

      return Response.json({
        success: true,
        message: `Filament "${filament.name}" deleted successfully`,
        disconnectedModels: filament.Models.length,
      });

    } catch (error) {
      console.error("Error deleting filament:", error);
      
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid filament ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to delete filament" },
        { status: 500 }
      );
    }
  },
});