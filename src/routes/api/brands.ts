import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/brands").methods({
  GET: async ({ request }) => {
    try {
      const brands = await prisma.brand.findMany({
        orderBy: { name: "asc" },
      });
      console.log(brands);

      return Response.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      return Response.json(
        { error: "Failed to fetch brands" },
        { status: 500 },
      );
    }
  },
});
