import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for creating model categories
const createModelCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

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

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validatedData = createModelCategorySchema.parse(body);

      const modelCategory = await prisma.modelCategory.create({
        data: {
          name: validatedData.name,
        },
      });

      return Response.json(modelCategory);
    } catch (error: any) {
      console.error("Error creating model category:", error);
      
      if (error.name === "ZodError") {
        return Response.json(
          { error: "Invalid data", details: error.errors },
          { status: 400 },
        );
      }

      return Response.json(
        { error: "Failed to create model category" },
        { status: 500 },
      );
    }
  },
});