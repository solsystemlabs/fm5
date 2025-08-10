import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/filaments/$filamentId").methods({
  GET: async ({ params }) => {
    try {
      const filamentId = parseInt(params.filamentId);
      
      if (isNaN(filamentId)) {
        return Response.json(
          { error: "Invalid filament ID" },
          { status: 400 }
        );
      }

      const filament = await prisma.filament.findUnique({
        where: { id: filamentId },
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

      if (!filament) {
        return Response.json(
          { error: "Filament not found" },
          { status: 404 }
        );
      }

      return Response.json(filament);
    } catch (error) {
      console.error("Error fetching filament:", error);
      return Response.json(
        { error: "Failed to fetch filament" },
        { status: 500 }
      );
    }
  },
});