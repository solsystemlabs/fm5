import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/sliced-files").methods({
  GET: async ({ request }) => {
    try {
      const slicedFiles = await prisma.slicedFile.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return Response.json(slicedFiles);
    } catch (error) {
      console.error("Error fetching sliced files:", error);
      return Response.json(
        { error: "Failed to fetch sliced files" },
        { status: 500 },
      );
    }
  },
});