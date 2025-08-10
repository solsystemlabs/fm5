import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateModelsSchema = z.object({
  modelIds: z.array(z.number()),
});

export const ServerRoute = createServerFileRoute("/api/filaments/$filamentId/models").methods({
  PATCH: async ({ params, request }) => {
    try {
      const filamentId = parseInt(params.filamentId);
      
      if (isNaN(filamentId)) {
        return Response.json(
          { error: "Invalid filament ID" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { modelIds } = updateModelsSchema.parse(body);

      // Update the filament's model associations
      const filament = await prisma.filament.update({
        where: { id: filamentId },
        data: {
          Models: {
            set: modelIds.map(id => ({ id }))
          }
        },
        include: {
          Material: true,
          Brand: true,
          Models: {
            include: {
              Category: true,
            },
          },
        },
      });

      return Response.json(filament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid data", details: error.errors },
          { status: 400 }
        );
      }
      console.error("Error updating filament models:", error);
      return Response.json(
        { error: "Failed to update filament models" },
        { status: 500 }
      );
    }
  },
});