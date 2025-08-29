import { 
  ChartBarIcon, 
  CubeIcon, 
  SwatchIcon,
  ArrowTrendingUpIcon,
  ClockIcon 
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
  const materialTypeData = data.distributions.materialTypes.map(item => ({
    ...item,
    percentage: totalFilaments > 0 ? (item._count / totalFilaments) * 100 : 0
  }));

  const brandData = data.distributions.brands
    .sort((a, b) => b._count - a._count)
    .slice(0, 10) // Top 10 brands
    .map(item => ({
      ...item,
      percentage: totalFilaments > 0 ? (item._count / totalFilaments) * 100 : 0
    }));

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Filaments</p>
              <p className="text-3xl font-bold">{data.overview.totalFilaments}</p>
            </div>
            <SwatchIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Models</p>
              <p className="text-3xl font-bold">{data.overview.totalModels}</p>
            </div>
            <CubeIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Print Jobs</p>
              <p className="text-3xl font-bold">{data.printStats.totalPrintJobs || 0}</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg Print Time</p>
              <p className="text-2xl font-bold">{formatTime(data.printStats.averagePrintTime)}</p>
            </div>
            <ClockIcon className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Types Distribution */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-6 text-card-foreground flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Material Types Distribution
          </h3>
          <div className="space-y-4">
            {materialTypeData.map((item, index) => (
              <div key={item.materialTypeId} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Material Type {item.materialTypeId}</span>
                  <span className="font-medium">{item._count} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-6 text-card-foreground flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            Top Brands
          </h3>
          <div className="space-y-3">
            {brandData.map((brand, index) => (
              <div key={brand.brandName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{brand.brandName}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{brand._count}</p>
                  <p className="text-xs text-muted-foreground">{brand.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Statistics */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-6 text-card-foreground">Print Statistics Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-surface-1 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{data.printStats.totalPrintJobs || 0}</p>
            <p className="text-muted-foreground">Total Print Jobs</p>
          </div>

          <div className="text-center p-4 bg-surface-1 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{formatTime(data.printStats.totalPrintTime)}</p>
            <p className="text-muted-foreground">Total Print Time</p>
          </div>

          <div className="text-center p-4 bg-surface-1 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{formatTime(data.printStats.averagePrintTime)}</p>
            <p className="text-muted-foreground">Average Print Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}