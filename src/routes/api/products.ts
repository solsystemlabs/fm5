import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().min(1, "Model is required"),
  filamentIds: z.array(z.number()).optional(),
  price: z.number().positive("Price must be positive").optional(),
  slicedFileId: z.number().min(1, "Sliced file is required"),
});

export const ServerRoute = createServerFileRoute("/api/products").methods({
  GET: async ({ request }) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          model: {
            include: {
              Category: true,
            },
          },
          Filaments: {
            include: {
              Brand: true,
              Material: true,
              Type: true,
            },
          },
          slicedFile: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return Response.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return Response.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }
  },
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validatedData = createProductSchema.parse(body);

      const product = await prisma.product.create({
        data: {
          name: validatedData.name,
          modelId: validatedData.modelId,
          price: validatedData.price,
          slicedFileId: validatedData.slicedFileId,
          Filaments:
            validatedData.filamentIds && validatedData.filamentIds.length > 0
              ? {
                  connect: validatedData.filamentIds.map((id) => ({ id })),
                }
              : undefined,
        },
        include: {
          model: {
            include: {
              Category: true,
            },
          },
          Filaments: {
            include: {
              Brand: true,
              Material: true,
              Type: true,
            },
          },
          slicedFile: true,
        },
      });

      return Response.json(product, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid data", details: error.errors },
          { status: 400 },
        );
      }
      console.error("Error creating product:", error);
      return Response.json(
        { error: "Failed to create product" },
        { status: 500 },
      );
    }
  },
});