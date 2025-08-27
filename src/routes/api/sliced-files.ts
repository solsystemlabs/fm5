import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";
import { parse3MFMetadata, type Parsed3MFMetadata } from "@/lib/3mf-parser";
import { logger } from "@/lib/logger";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for POST requests
const uploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().int().positive("Valid model ID is required"),
  url: z.string().url("Valid URL is required"),
  size: z.number().int().positive("Valid file size is required"),
});

export const ServerRoute = createServerFileRoute("/api/sliced-files").methods({
  GET: async ({ request }) => {
    try {
      const slicedFiles = await prisma.slicedFile.findMany({
        include: {
          SlicedFileFilaments: {
            orderBy: {
              filamentIndex: "asc"
            }
          },
          ModelFile: true
        },
        orderBy: {
          name: "asc",
        },
      });

      return Response.json(slicedFiles);
    } catch (error) {
      logger.error("Error fetching sliced files:", error);
      return Response.json(
        { error: "Failed to fetch sliced files" },
        { status: 500 },
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const name = formData.get("name") as string;
      const modelId = parseInt(formData.get("modelId") as string);
      const url = formData.get("url") as string;
      
      // Validate required fields
      const validation = uploadSchema.safeParse({
        name,
        modelId,
        url,
        size: file?.size || 0
      });

      if (!validation.success) {
        return Response.json(
          { error: "Validation failed", details: validation.error.errors },
          { status: 400 }
        );
      }

      if (!file) {
        return Response.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Check if file is a 3MF file
      if (!file.name.endsWith('.3mf') && !file.name.endsWith('.gcode.3mf')) {
        return Response.json(
          { error: "Only 3MF files are supported" },
          { status: 400 }
        );
      }

      logger.info("Processing 3MF file upload", { name, size: file.size, modelId });

      // Parse 3MF metadata
      const buffer = Buffer.from(await file.arrayBuffer());
      let metadata: Parsed3MFMetadata;
      
      try {
        metadata = await parse3MFMetadata(buffer);
      } catch (error) {
        logger.error("Failed to parse 3MF file", { name, error });
        return Response.json(
          { error: "Failed to parse 3MF file" },
          { status: 400 }
        );
      }

      // Create database transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Create SlicedFile record with parsed metadata
        const slicedFile = await tx.slicedFile.create({
          data: {
            name: validation.data.name,
            modelId: validation.data.modelId,
            url: validation.data.url,
            size: validation.data.size,
            
            // Basic print information
            printTimeMinutes: metadata.printTimeMinutes,
            totalTimeMinutes: metadata.totalTimeMinutes,
            layerCount: metadata.layerCount,
            layerHeight: metadata.layerHeight,
            maxZHeight: metadata.maxZHeight,
            
            // Slicer information
            slicerName: metadata.slicerName,
            slicerVersion: metadata.slicerVersion,
            profileName: metadata.profileName,
            
            // Printer settings
            nozzleDiameter: metadata.nozzleDiameter,
            bedType: metadata.bedType,
            bedTemperature: metadata.bedTemperature,
            
            // Filament totals
            totalFilamentLength: metadata.totalFilamentLength,
            totalFilamentVolume: metadata.totalFilamentVolume,
            totalFilamentWeight: metadata.totalFilamentWeight,
          }
        });

        // Create SlicedFileFilament records for each filament
        if (metadata.filaments && metadata.filaments.length > 0) {
          await tx.slicedFileFilament.createMany({
            data: metadata.filaments.map(filament => ({
              slicedFileId: slicedFile.id,
              filamentIndex: filament.filamentIndex,
              
              // Total usage
              lengthUsed: filament.lengthUsed,
              volumeUsed: filament.volumeUsed,
              weightUsed: filament.weightUsed,
              
              // Usage breakdown (when available)
              modelLength: filament.modelLength,
              modelVolume: filament.modelVolume,
              modelWeight: filament.modelWeight,
              supportLength: filament.supportLength,
              supportVolume: filament.supportVolume,
              supportWeight: filament.supportWeight,
              towerLength: filament.towerLength,
              towerVolume: filament.towerVolume,
              towerWeight: filament.towerWeight,
              wasteLength: filament.wasteLength,
              wasteVolume: filament.wasteVolume,
              wasteWeight: filament.wasteWeight,
              infillLength: filament.infillLength,
              infillVolume: filament.infillVolume,
              infillWeight: filament.infillWeight,
              wallLength: filament.wallLength,
              wallVolume: filament.wallVolume,
              wallWeight: filament.wallWeight,
              
              // Filament properties
              filamentType: filament.filamentType,
              filamentColor: filament.filamentColor,
              filamentVendor: filament.filamentVendor,
              density: filament.density,
              diameter: filament.diameter,
              nozzleTemp: filament.nozzleTemp,
              bedTemp: filament.bedTemp,
            }))
          });
        }

        // Return the complete record with filaments
        return await tx.slicedFile.findUnique({
          where: { id: slicedFile.id },
          include: {
            SlicedFileFilaments: {
              orderBy: { filamentIndex: "asc" }
            },
            ModelFile: true
          }
        });
      });

      logger.info("3MF file processed successfully", { 
        name,
        slicedFileId: result?.id,
        filamentsCreated: metadata.filaments.length
      });

      return Response.json(result, { status: 201 });
    } catch (error) {
      logger.error("Error creating sliced file:", error);
      return Response.json(
        { error: "Failed to create sliced file" },
        { status: 500 },
      );
    }
  },
});