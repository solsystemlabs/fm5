import {
  ChartBarIcon,
  CubeIcon,
  SwatchIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  overview: {
    totalFilaments: number;
    totalModels: number;
    totalProducts: number;
    totalSlicedFiles: number;
  };
  distributions: {
    materialTypes: Array<{ materialTypeId: number; _count: number }>;
    brands: Array<{ brandName: string; _count: number }>;
  };
  printStats: {
    averagePrintTime: number | null;
    totalPrintTime: number | null;
    totalPrintJobs: number | null;
  };
}

interface DashboardAnalyticsProps {
  data: AnalyticsData;
}

export function DashboardAnalytics({ data }: DashboardAnalyticsProps) {
  const formatTime = (minutes: number | null) => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate percentages for distributions
  const totalFilaments = data.overview.totalFilaments;
  const materialTypeData = data.distributions.materialTypes.map((item) => ({
    ...item,
    percentage: totalFilaments > 0 ? (item._count / totalFilaments) * 100 : 0,
  }));

  const brandData = data.distributions.brands
    .sort((a, b) => b._count - a._count)
    .slice(0, 10) // Top 10 brands
    .map((item) => ({
      ...item,
      percentage: totalFilaments > 0 ? (item._count / totalFilaments) * 100 : 0,
    }));

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Filaments</p>
              <p className="text-3xl font-bold">
                {data.overview.totalFilaments}
              </p>
            </div>
            <SwatchIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="rounded-lg bg-amber-600 bg-gradient-to-br p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Total Models</p>
              <p className="text-3xl font-bold">{data.overview.totalModels}</p>
            </div>
            <CubeIcon className="h-12 w-12 text-amber-200" />
          </div>
        </div>

        <div className="bg-satin-linen-600 rounded-lg bg-gradient-to-br p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-satin-linen-100">Print Jobs</p>
              <p className="text-3xl font-bold">
                {data.printStats.totalPrintJobs || 0}
              </p>
            </div>
            <ChartBarIcon className="text-satin-linen-200 h-12 w-12" />
          </div>
        </div>

        <div className="bg-ebony-clay-600 rounded-lg bg-gradient-to-br p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ebony-clay-100">Avg Print Time</p>
              <p className="text-2xl font-bold">
                {formatTime(data.printStats.averagePrintTime)}
              </p>
            </div>
            <ClockIcon className="text-ebony-clay-200 h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Material Types Distribution */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="text-card-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
            <ChartBarIcon className="h-5 w-5" />
            Material Types Distribution
          </h3>
          <div className="space-y-4">
            {materialTypeData.map((item, index) => (
              <div key={item.materialTypeId} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Material Type {item.materialTypeId}
                  </span>
                  <span className="font-medium">
                    {item._count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="bg-surface-2 h-2 w-full rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === 0
                        ? "bg-blue-500"
                        : index === 1
                          ? "bg-green-500"
                          : index === 2
                            ? "bg-purple-500"
                            : index === 3
                              ? "bg-orange-500"
                              : "bg-gray-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="text-card-foreground mb-6 flex items-center gap-2 text-lg font-semibold">
            <ArrowTrendingUpIcon className="h-5 w-5" />
            Top Brands
          </h3>
          <div className="space-y-3">
            {brandData.map((brand, index) => (
              <div
                key={brand.brandName}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                          ? "bg-gray-400"
                          : index === 2
                            ? "bg-orange-600"
                            : "bg-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{brand.brandName}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{brand._count}</p>
                  <p className="text-muted-foreground text-xs">
                    {brand.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Statistics */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="text-card-foreground mb-6 text-lg font-semibold">
          Print Statistics Overview
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-surface-1 rounded-lg p-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-card-foreground text-2xl font-bold">
              {data.printStats.totalPrintJobs || 0}
            </p>
            <p className="text-muted-foreground">Total Print Jobs</p>
          </div>

          <div className="bg-surface-1 rounded-lg p-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-card-foreground text-2xl font-bold">
              {formatTime(data.printStats.totalPrintTime)}
            </p>
            <p className="text-muted-foreground">Total Print Time</p>
          </div>

          <div className="bg-surface-1 rounded-lg p-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-card-foreground text-2xl font-bold">
              {formatTime(data.printStats.averagePrintTime)}
            </p>
            <p className="text-muted-foreground">Average Print Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

