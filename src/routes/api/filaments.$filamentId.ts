import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateFilamentSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  brandName: z.string().min(1).optional(),
  materialTypeId: z.number().optional(),
  diameter: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  grams: z.number().positive().optional(),
});

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
      const validatedData = updateFilamentSchema.parse(body);

      // If brandName is being updated, ensure the brand exists
      if (validatedData.brandName) {
        await prisma.brand.upsert({
          where: { name: validatedData.brandName },
          update: {},
          create: { name: validatedData.brandName },
        });
      }

      const filament = await prisma.filament.update({
        where: { id: filamentId },
        data: validatedData,
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
      console.error("Error updating filament:", error);
      return Response.json(
        { error: "Failed to update filament" },
        { status: 500 }
      );
    }
  },
});