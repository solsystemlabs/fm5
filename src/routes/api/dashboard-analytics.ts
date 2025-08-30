import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

export const ServerRoute = createServerFileRoute(
  "/api/dashboard-analytics",
).methods({
  GET: async ({ request }) => {
    try {
      const prisma = new PrismaClient();

      // Get current counts
      const [
        totalFilaments,
        totalModels,
        totalProducts,
        totalSlicedFiles,
        totalBrands,
        totalMaterialTypes,
      ] = await Promise.all([
        prisma.filament.count(),
        prisma.model.count(),
        prisma.product.count(),
        prisma.slicedFile.count(),
        prisma.brand.count(),
        prisma.materialType.count(),
      ]);

      // Get filament inventory status
      const filamentInventory = await prisma.filament.findMany({
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
      const printTimeStats = await prisma.slicedFile.aggregate({
        _avg: { printTimeMinutes: true },
        _sum: { printTimeMinutes: true },
        _count: { printTimeMinutes: true },
      });

      // Get material type distribution
      const materialDistribution = await prisma.filament.groupBy({
        by: ["materialTypeId"],
        _count: true,
      });

      // Get brand distribution
      const brandDistribution = await prisma.filament.groupBy({
        by: ["brandName"],
        _count: true,
      });

      // Get recent models with images
      const recentModels = await prisma.model.findMany({
        take: 6,
        orderBy: { id: "desc" },
        include: {
          Category: { select: { name: true } },
          ModelImage: {
            take: 1,
            select: { url: true, name: true },
          },
        },
      });

      await prisma.$disconnect();

      return Response.json({
        overview: {
          totalFilaments,
          totalModels,
          totalProducts,
          totalSlicedFiles,
          totalBrands,
          totalMaterialTypes,
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
        distributions: {
          materialTypes: materialDistribution,
          brands: brandDistribution,
        },
        recentModels,
        recentActivity: [], // Empty array for now until RecentActivity table is available
      });
    } catch (error) {
      console.error("Dashboard analytics error:", error);
      return Response.json(
        { error: "Failed to fetch dashboard analytics" },
        { status: 500 },
      );
    }
  },
});
