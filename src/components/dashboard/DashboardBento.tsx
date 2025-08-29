import { 
  CubeIcon, 
  SwatchIcon, 
  ShoppingBagIcon, 
  DocumentIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { ColorLabel } from "@/components/color/ColorLabel";

interface BentoData {
  overview: {
    totalFilaments: number;
    totalModels: number;
    totalProducts: number;
    totalSlicedFiles: number;
  };
  inventory: {
    totalFilamentWeight: number;
    totalFilamentCost: number;
    lowStockCount: number;
    lowStockFilaments: Array<{
      id: number;
      name: string;
      grams: number | null;
      color: string;
      Brand: { name: string };
      Material: { name: string };
    }>;
  };
  printStats: {
    averagePrintTime: number | null;
    totalPrintTime: number | null;
    totalPrintJobs: number | null;
  };
  recentModels: Array<{
    id: number;
    name: string;
    Category: { name: string };
    ModelImage: Array<{ url: string; name: string }>;
  }>;
  distributions: {
    brands: Array<{ brandName: string; _count: number }>;
  };
}

interface DashboardBentoProps {
  data: BentoData;
}

export function DashboardBento({ data }: DashboardBentoProps) {
  const formatTime = (minutes: number | null) => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatWeight = (grams: number) => {
    return grams >= 1000 ? `${(grams / 1000).toFixed(1)}kg` : `${grams}g`;
  };

  const topBrands = data.distributions.brands
    .sort((a, b) => b._count - a._count)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-[calc(100vh-200px)]">
      {/* Primary Metrics - Large Cards */}
      <div className="col-span-3 row-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <SwatchIcon className="w-8 h-8 text-blue-200" />
            <SparklesIcon className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Filaments</p>
            <p className="text-4xl font-bold">{data.overview.totalFilaments}</p>
            <p className="text-blue-200 text-sm mt-1">Active inventory</p>
          </div>
        </div>
      </div>

      <div className="col-span-3 row-span-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <CubeIcon className="w-8 h-8 text-green-200" />
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-200" />
          </div>
          <div>
            <p className="text-green-100 text-sm">3D Models</p>
            <p className="text-4xl font-bold">{data.overview.totalModels}</p>
            <p className="text-green-200 text-sm mt-1">Ready to print</p>
          </div>
        </div>
      </div>

      {/* Recent Models Gallery */}
      <div className="col-span-6 row-span-2 bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-orange-500" />
          Recent Models
        </h3>
        <div className="grid grid-cols-3 gap-3 h-full">
          {data.recentModels.slice(0, 6).map((model) => (
            <div key={model.id} className="group cursor-pointer">
              <div className="aspect-square bg-surface-1 rounded-xl border border-border overflow-hidden mb-2">
                {model.ModelImage[0] ? (
                  <img 
                    src={model.ModelImage[0].url} 
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CubeIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium truncate">{model.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Print Stats */}
      <div className="col-span-4 row-span-2 bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-blue-500" />
          Print Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Total Jobs</span>
            <span className="text-2xl font-bold text-card-foreground">{data.printStats.totalPrintJobs || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Total Time</span>
            <span className="text-lg font-semibold text-card-foreground">{formatTime(data.printStats.totalPrintTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Avg Time</span>
            <span className="text-lg font-semibold text-card-foreground">{formatTime(data.printStats.averagePrintTime)}</span>
          </div>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="col-span-4 row-span-2 bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <SwatchIcon className="w-5 h-5 text-purple-500" />
          Inventory Value
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-card-foreground">${data.inventory.totalFilamentCost.toFixed(0)}</p>
            <p className="text-muted-foreground text-sm">Total Value</p>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-lg font-semibold text-card-foreground">{formatWeight(data.inventory.totalFilamentWeight)}</p>
            <p className="text-muted-foreground text-sm">Total Weight</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="col-span-4 row-span-2 bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
          Stock Alerts
        </h3>
        {data.inventory.lowStockCount > 0 ? (
          <div className="space-y-3">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.inventory.lowStockCount}</p>
              <p className="text-orange-700 dark:text-orange-300 text-sm">Low stock items</p>
            </div>
            <div className="space-y-2">
              {data.inventory.lowStockFilaments.slice(0, 2).map((filament) => (
                <div key={filament.id} className="flex items-center gap-2 p-2 bg-surface-1 rounded-lg">
                  <ColorLabel 
                    color={filament.color} 
                    name={filament.name}
                    brand={filament.Brand.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{formatWeight(filament.grams || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium">All stock levels good</p>
          </div>
        )}
      </div>

      {/* Top Brands */}
      <div className="col-span-6 row-span-2 bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
          Top Brands
        </h3>
        <div className="grid grid-cols-3 gap-4 h-full">
          {topBrands.map((brand, index) => (
            <div key={brand.brandName} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-white text-lg font-bold ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                'bg-gradient-to-br from-orange-400 to-orange-600'
              }`}>
                #{index + 1}
              </div>
              <p className="font-semibold text-card-foreground text-sm">{brand.brandName}</p>
              <p className="text-muted-foreground text-xs">{brand._count} filaments</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="col-span-3 row-span-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <ShoppingBagIcon className="w-8 h-8 text-purple-200" />
            <DocumentIcon className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <p className="text-purple-100 text-sm">Products & Files</p>
            <p className="text-2xl font-bold">{data.overview.totalProducts}</p>
            <p className="text-2xl font-bold">{data.overview.totalSlicedFiles}</p>
            <p className="text-purple-200 text-sm mt-1">Ready for production</p>
          </div>
        </div>
      </div>

      <div className="col-span-3 row-span-2 bg-card rounded-2xl p-6 border border-border">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-bold text-card-foreground">System Healthy</h3>
          <p className="text-muted-foreground text-sm">All systems operational</p>
        </div>
      </div>
    </div>
  );
}