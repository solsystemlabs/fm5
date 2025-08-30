import { z } from 'zod';
import { router, publicProcedure, handlePrismaError } from '../init';

export const dashboardRouter = router({
  // Get complete dashboard analytics
  analytics: publicProcedure.query(async ({ ctx }) => {
    try {
      // Get current counts
      const [
        totalFilaments,
        totalModels,
        totalProducts,
        totalSlicedFiles,
        totalBrands,
        totalMaterialTypes,
        totalThreeMFFiles,
      ] = await Promise.all([
        ctx.prisma.filament.count(),
        ctx.prisma.model.count(),
        ctx.prisma.product.count(),
        ctx.prisma.slicedFile.count(),
        ctx.prisma.brand.count(),
        ctx.prisma.materialType.count(),
        ctx.prisma.threeMFFile.count(),
      ]);

      // Get filament inventory status
      const filamentInventory = await ctx.prisma.filament.findMany({
        select: {
          id: true,
          name: true,
          grams: true,
          cost: true,
          Brand: { select: { name: true } },
          Material: { select: { name: true } },
          color: true,
        },
      });

      // Calculate filament stats
      const totalFilamentWeight = filamentInventory.reduce(
        (sum, f) => sum + (f.grams || 0),
        0,
      );
      const totalFilamentCost = filamentInventory.reduce(
        (sum, f) => sum + (f.cost || 0),
        0,
      );
      const lowStockFilaments = filamentInventory.filter(
        (f) => (f.grams || 0) < 200,
      );

      // Get print time analytics from sliced files
      const printTimeStats = await ctx.prisma.slicedFile.aggregate({
        _avg: { printTimeMinutes: true },
        _sum: { printTimeMinutes: true },
        _count: { printTimeMinutes: true },
      });

      // Get filament usage analytics from sliced file filaments
      const filamentUsageStats = await ctx.prisma.slicedFileFilament.aggregate({
        _avg: { weightUsed: true },
        _sum: { weightUsed: true, lengthUsed: true, volumeUsed: true },
        _count: { weightUsed: true },
      });

      // Get material type distribution
      const materialDistribution = await ctx.prisma.filament.groupBy({
        by: ["materialTypeId"],
        _count: true,
        include: {
          Material: {
            select: { name: true },
          },
        },
      });

      // Get brand distribution
      const brandDistribution = await ctx.prisma.filament.groupBy({
        by: ["brandName"],
        _count: true,
      });

      // Get recent models with images from tagged union File system
      const recentModels = await ctx.prisma.model.findMany({
        take: 6,
        orderBy: { id: "desc" },
        include: {
          Category: { select: { name: true } },
          ThreeMFFiles: {
            take: 1,
            select: { id: true, name: true, hasGcode: true },
          },
        },
      });

      // Get model images separately using tagged union system
      const modelImages = await Promise.all(
        recentModels.map(async (model) => {
          const images = await ctx.prisma.file.findFirst({
            where: {
              entityType: 'MODEL',
              entityId: model.id,
            },
            select: { url: true, name: true },
          });
          return { modelId: model.id, image: images };
        })
      );

      // Combine models with their images
      const recentModelsWithImages = recentModels.map((model) => {
        const imageData = modelImages.find(img => img.modelId === model.id);
        return {
          ...model,
          images: imageData?.image ? [imageData.image] : [],
        };
      });

      // Get recent activity (if available)
      const recentActivity = await ctx.prisma.recentActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      return {
        overview: {
          totalFilaments,
          totalModels,
          totalProducts,
          totalSlicedFiles,
          totalBrands,
          totalMaterialTypes,
          totalThreeMFFiles,
        },
        inventory: {
          totalFilamentWeight,
          totalFilamentCost,
          lowStockCount: lowStockFilaments.length,
          lowStockFilaments: lowStockFilaments.slice(0, 5), // Top 5 low stock
        },
        printStats: {
          averagePrintTime: printTimeStats._avg.printTimeMinutes,
          totalPrintTime: printTimeStats._sum.printTimeMinutes,
          totalPrintJobs: printTimeStats._count.printTimeMinutes,
        },
        filamentUsage: {
          averageWeightPerPrint: filamentUsageStats._avg.weightUsed,
          totalWeightUsed: filamentUsageStats._sum.weightUsed,
          totalLengthUsed: filamentUsageStats._sum.lengthUsed,
          totalVolumeUsed: filamentUsageStats._sum.volumeUsed,
          totalPrintsWithFilament: filamentUsageStats._count.weightUsed,
        },
        distributions: {
          materialTypes: materialDistribution,
          brands: brandDistribution,
        },
        recentModels: recentModelsWithImages,
        recentActivity,
      };
    } catch (error) {
      handlePrismaError(error, "Failed to fetch dashboard analytics");
    }
  }),

  // Get overview stats only (lighter query)
  overview: publicProcedure.query(async ({ ctx }) => {
    try {
      const [
        totalFilaments,
        totalModels,
        totalProducts,
        totalSlicedFiles,
        totalBrands,
        totalMaterialTypes,
        totalThreeMFFiles,
      ] = await Promise.all([
        ctx.prisma.filament.count(),
        ctx.prisma.model.count(),
        ctx.prisma.product.count(),
        ctx.prisma.slicedFile.count(),
        ctx.prisma.brand.count(),
        ctx.prisma.materialType.count(),
        ctx.prisma.threeMFFile.count(),
      ]);

      return {
        totalFilaments,
        totalModels,
        totalProducts,
        totalSlicedFiles,
        totalBrands,
        totalMaterialTypes,
        totalThreeMFFiles,
      };
    } catch (error) {
      handlePrismaError(error, "Failed to fetch dashboard overview");
    }
  }),

  // Get filament inventory stats
  inventory: publicProcedure.query(async ({ ctx }) => {
    try {
      const filamentInventory = await ctx.prisma.filament.findMany({
        select: {
          id: true,
          name: true,
          grams: true,
          cost: true,
          Brand: { select: { name: true } },
          Material: { select: { name: true } },
          color: true,
        },
      });

      const totalFilamentWeight = filamentInventory.reduce(
        (sum, f) => sum + (f.grams || 0),
        0,
      );
      const totalFilamentCost = filamentInventory.reduce(
        (sum, f) => sum + (f.cost || 0),
        0,
      );
      const lowStockFilaments = filamentInventory.filter(
        (f) => (f.grams || 0) < 200,
      );

      return {
        totalFilamentWeight,
        totalFilamentCost,
        lowStockCount: lowStockFilaments.length,
        lowStockFilaments: lowStockFilaments.slice(0, 5),
        allFilaments: filamentInventory,
      };
    } catch (error) {
      handlePrismaError(error, "Failed to fetch inventory stats");
    }
  }),

  // Get print statistics
  printStats: publicProcedure.query(async ({ ctx }) => {
    try {
      const printTimeStats = await ctx.prisma.slicedFile.aggregate({
        _avg: { printTimeMinutes: true },
        _sum: { printTimeMinutes: true },
        _count: { printTimeMinutes: true },
      });

      const filamentUsageStats = await ctx.prisma.slicedFileFilament.aggregate({
        _avg: { weightUsed: true },
        _sum: { weightUsed: true, lengthUsed: true, volumeUsed: true },
        _count: { weightUsed: true },
      });

      return {
        averagePrintTime: printTimeStats._avg.printTimeMinutes,
        totalPrintTime: printTimeStats._sum.printTimeMinutes,
        totalPrintJobs: printTimeStats._count.printTimeMinutes,
        filamentUsage: {
          averageWeightPerPrint: filamentUsageStats._avg.weightUsed,
          totalWeightUsed: filamentUsageStats._sum.weightUsed,
          totalLengthUsed: filamentUsageStats._sum.lengthUsed,
          totalVolumeUsed: filamentUsageStats._sum.volumeUsed,
          totalPrintsWithFilament: filamentUsageStats._count.weightUsed,
        },
      };
    } catch (error) {
      handlePrismaError(error, "Failed to fetch print statistics");
    }
  }),
});