import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createFilamentSchema = z.object({
  color: z.string().min(1, "Color is required"),
  name: z.string().min(1, "Name is required"),
  materialTypeId: z.number().min(1, "Material type is required"),
  modelIds: z.array(z.number()).optional(),
  cost: z.number().positive("Cost must be positive").optional(),
  grams: z.number().positive("Weight must be positive").optional(),
  brandName: z.string().min(1, "Brand is required"),
  diameter: z.number().positive("Diameter must be positive"),
});

export const ServerRoute = createServerFileRoute("/api/filaments").methods({
  GET: async ({ request }) => {
    try {
      const filaments = await prisma.filament.findMany({
        include: {
          Material: true,
          Brand: true,
          Models: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: {
          color: "asc",
        },
      });

      return Response.json(filaments);
    } catch (error) {
      console.error("Error fetching filaments:", error);
      return Response.json(
        { error: "Failed to fetch filaments" },
        { status: 500 },
      );
    }
  },
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validatedData = createFilamentSchema.parse(body);

      const filament = await prisma.filament.create({
        data: {
          color: validatedData.color,
          name: validatedData.name,
          materialTypeId: validatedData.materialTypeId,
          brandName: validatedData.brandName,
          diameter: validatedData.diameter,
          cost: validatedData.cost,
          grams: validatedData.grams,
          Models:
            validatedData.modelIds && validatedData.modelIds.length > 0
              ? {
                  connect: validatedData.modelIds.map((id) => ({ id })),
                }
              : undefined,
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

      return Response.json(filament, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid data", details: error.errors },
          { status: 400 },
        );
      }
      console.error("Error creating filament:", error);
      return Response.json(
        { error: "Failed to create filament" },
        { status: 500 },
      );
    }
  },
});

