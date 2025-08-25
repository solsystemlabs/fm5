import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/filaments-grouped").methods({
  GET: async ({ request }) => {
    try {
      // First, get all filament types
      const filamentTypes = await prisma.filamentType.findMany({
        include: {
          Filament: {
            include: {
              Material: true,
              Brand: true,
              Models: {
                include: {
                  Category: true,
                },
              },
            },
            orderBy: [
              { brandName: "asc" },
              { name: "asc" }
            ]
          }
        },
        orderBy: {
          name: "asc"
        }
      });

      // Transform the data into the grouped structure
      const groupedFilaments = filamentTypes.reduce((acc, filamentType) => {
        if (filamentType.Filament.length > 0) {
          acc[filamentType.name] = filamentType.Filament;
        }
        return acc;
      }, {} as Record<string, typeof filamentTypes[0]['Filament']>);

      return Response.json(groupedFilaments);
    } catch (error) {
      console.error("Error fetching grouped filaments:", error);
      return Response.json(
        { error: "Failed to fetch grouped filaments" },
        { status: 500 },
      );
    }
  },
});