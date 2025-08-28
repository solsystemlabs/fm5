import { PrismaClient } from "@prisma/client";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for product ID parameter
const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const ServerRoute = createServerFileRoute("/api/products/$id").methods({
  DELETE: async ({ params }) => {
    try {
      // Validate product ID parameter
      const validatedParams = paramsSchema.parse(params);
      const productId = validatedParams.id;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return Response.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Delete the product
      await prisma.product.delete({
        where: { id: productId },
      });

      return Response.json({
        success: true,
        message: `Product "${product.name}" deleted successfully`,
      });

    } catch (error) {
      console.error("Error deleting product:", error);
      
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: "Invalid product ID", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }
  },
});