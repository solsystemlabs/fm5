import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
});

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

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validatedData = createBrandSchema.parse(body);

      const brand = await prisma.brand.create({
        data: {
          name: validatedData.name,
        },
      });

      return Response.json(brand, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid data", details: error.errors },
          { status: 400 },
        );
      }
      console.error("Error creating brand:", error);
      return Response.json(
        { error: "Failed to create brand" },
        { status: 500 },
      );
    }
  },
});
