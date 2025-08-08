import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ServerRoute = createServerFileRoute("/api/models").methods({
  GET: async () => {
    try {
      const models = await prisma.model.findMany({
        include: {
          Category: true,
          Filaments: {
            include: {
              Brand: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return Response.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      return Response.json(
        { error: "Failed to fetch models" },
        { status: 500 },
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { name, modelCategoryId } = body;

      if (!name || !modelCategoryId) {
        return Response.json(
          { error: "Name and category are required" },
          { status: 400 },
        );
      }

      const model = await prisma.model.create({
        data: {
          name,
          modelCategoryId,
        },
        include: {
          Category: true,
          Filaments: {
            include: {
              Brand: true,
            },
          },
        },
      });

      return Response.json(model);
    } catch (error) {
      console.error("Error creating model:", error);
      return Response.json(
        { error: "Failed to create model" },
        { status: 500 },
      );
    }
  },
});

