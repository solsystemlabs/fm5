import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";

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

// Query options for dashboard analytics (for use with TanStack Router loaders)
export const dashboardAnalyticsQueryOptions = queryOptions({
  queryKey: ['dashboard-analytics'],
  queryFn: async (): Promise<DashboardData> => {
    const response = await fetch('/api/dashboard-analytics', {
      cache: 'no-store', // Prevent browser caching
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard analytics');
    }

    return response.json();
  },
  staleTime: 0, // Always consider data stale
  gcTime: 0, // Don't keep old data in memory
  refetchOnWindowFocus: true,
  refetchOnMount: 'always',
});

export function useDashboardAnalytics() {
  return useQuery(dashboardAnalyticsQueryOptions);
}

// Suspense version for better SSR + streaming behavior
export function useDashboardAnalyticsSuspense() {
  return useSuspenseQuery(dashboardAnalyticsQueryOptions);
}