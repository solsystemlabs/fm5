import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/model-categories").methods({
  GET: async () => {
    try {
      const modelCategories = await prisma.modelCategory.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return Response.json(modelCategories);
    } catch (error) {
      console.error("Error fetching model categories:", error);
      return Response.json(
        { error: "Failed to fetch model categories" },
        { status: 500 },
      );
    }
  },
});