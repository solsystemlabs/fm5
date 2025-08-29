import { useQuery } from "@tanstack/react-query";

export interface DashboardData {
  overview: {
    totalFilaments: number;
    totalModels: number;
    totalProducts: number;
    totalSlicedFiles: number;
    totalBrands: number;
    totalMaterialTypes: number;
  };
  inventory: {
    totalFilamentWeight: number;
    totalFilamentCost: number;
    lowStockCount: number;
    lowStockFilaments: Array<{
      id: number;
      name: string;
      grams: number | null;
      cost: number | null;
      Brand: { name: string };
      Material: { name: string };
      color: string;
    }>;
  };
  printStats: {
    averagePrintTime: number | null;
    totalPrintTime: number | null;
    totalPrintJobs: number | null;
  };
  distributions: {
    materialTypes: Array<{ materialTypeId: number; _count: number }>;
    brands: Array<{ brandName: string; _count: number }>;
  };
  recentModels: Array<{
    id: number;
    name: string;
    Category: { name: string };
    ModelImage: Array<{ url: string; name: string }>;
  }>;
  recentActivity: Array<{
    id: number;
    type: string;
    title: string;
    description: string | null;
    entityType: string;
    entityId: number;
    metadata: any;
    createdAt: string;
  }>;
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async (): Promise<DashboardData> => {
      const response = await fetch('/api/dashboard-analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard analytics');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}