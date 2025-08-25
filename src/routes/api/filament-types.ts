import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createFilamentTypesSchema = z.object({
  name: z.string().min(1, "Filament type name is required"),
  description: z.string().optional(),
});

export const ServerRoute = createServerFileRoute("/api/filament-types").methods(
  {
    GET: async ({ request }) => {
      try {
        const filamentTypes = await prisma.filamentType.findMany({
          orderBy: {
            name: "asc",
          },
        });

        return Response.json(filamentTypes);
      } catch (error) {
        console.error("Error fetching filament types:", error);
        return Response.json(
          { error: "Failed to fetch filament types" },
          { status: 500 },
        );
      }
    },

    POST: async ({ request }) => {
      try {
        const body = await request.json();
        const validatedData = createFilamentTypesSchema.parse(body);

        const filamentType = await prisma.filamentType.create({
          data: {
            name: validatedData.name,
          },
        });

        return Response.json(filamentType, { status: 201 });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return Response.json(
            { error: "Invalid data", details: error.errors },
            { status: 400 },
          );
        }
        console.error("Error creating filament type:", error);
        return Response.json(
          { error: "Failed to create filament type" },
          { status: 500 },
        );
      }
    },
  },
);

