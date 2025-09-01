import { z } from "zod";
import { router, publicProcedure, handlePrismaError } from "../init";

// Note: This router provides download metadata and signed URLs.
// Actual file streaming still needs to be handled by API routes due to tRPC limitations.

export const downloadsRouter = router({
  // Get download URL for a file in the tagged union File system
  file: publicProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const file = await ctx.prisma.file.findUnique({
          where: { id: input.fileId },
        });

        if (!file) {
          throw new Error("File not found");
        }

        // For now, return the direct URL (in production this would generate signed URLs)
        return {
          downloadUrl: file.url,
          filename: file.name,
          size: file.size,
          mimeType: file.mimeType || getContentTypeFromFilename(file.name),
          entityType: file.entityType,
          entityId: file.entityId,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to get file download URL");
      }
    }),

  // Get download URL for a model file
  modelFile: publicProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const modelFile = await ctx.prisma.modelFile.findUnique({
          where: { id: input.fileId },
          include: {
            Model: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!modelFile) {
          throw new Error("Model file not found");
        }

        // Return download metadata (actual download handled by API route)
        return {
          downloadUrl: modelFile.url,
          filename: modelFile.name,
          size: modelFile.size,
          fileType: modelFile.fileType,
          contentType: getContentTypeFromFilename(modelFile.name),
          model: modelFile.Model,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to get model file download URL");
      }
    }),

  // Get download URL for a 3MF file
  threeMFFile: publicProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const threeMFFile = await ctx.prisma.threeMFFile.findUnique({
          where: { id: input.fileId },
          include: {
            Model: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!threeMFFile) {
          throw new Error("3MF file not found");
        }

        return {
          downloadUrl: threeMFFile.url,
          filename: threeMFFile.name,
          size: threeMFFile.size,
          hasGcode: threeMFFile.hasGcode,
          contentType: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
          model: threeMFFile.Model,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to get 3MF file download URL");
      }
    }),

  // Get download URL for a sliced file
  slicedFile: publicProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const slicedFile = await ctx.prisma.slicedFile.findUnique({
          where: { id: input.fileId },
          include: {
            ThreeMFFile: {
              include: {
                Model: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!slicedFile) {
          throw new Error("Sliced file not found");
        }

        return {
          downloadUrl: slicedFile.url,
          filename: slicedFile.name,
          size: slicedFile.size,
          contentType: "text/plain", // .gcode files are plain text
          printTimeMinutes: slicedFile.printTimeMinutes,
          slicerName: slicedFile.slicerName,
          slicerVersion: slicedFile.slicerVersion,
          model: slicedFile.ThreeMFFile.Model,
        };
      } catch (error) {
        handlePrismaError(error, "Failed to get sliced file download URL");
      }
    }),

  // Get batch download URLs for multiple files
  batch: publicProcedure
    .input(
      z.object({
        fileIds: z.array(z.number()).min(1, "At least one file ID required"),
        entityType: z.enum(["MODEL", "THREE_MF", "SLICED_FILE"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const whereClause: any = {
          id: { in: input.fileIds },
        };

        if (input.entityType) {
          whereClause.entityType = input.entityType;
        }

        const files = await ctx.prisma.file.findMany({
          where: whereClause,
        });

        return files.map((file) => ({
          fileId: file.id,
          downloadUrl: file.url,
          filename: file.name,
          size: file.size,
          mimeType: file.mimeType || getContentTypeFromFilename(file.name),
          entityType: file.entityType,
          entityId: file.entityId,
        }));
      } catch (error) {
        handlePrismaError(error, "Failed to get batch download URLs");
      }
    }),
});

// Helper function to determine content type from filename
function getContentTypeFromFilename(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "stl":
      return "application/sla";
    case "obj":
      return "text/plain";
    case "3mf":
      return "application/vnd.ms-package.3dmanufacturing-3dmodel+xml";
    case "gcode":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

