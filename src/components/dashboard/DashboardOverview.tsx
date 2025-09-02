import { 
  CubeIcon, 
  SwatchIcon, 
  ShoppingBagIcon, 
  DocumentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ScaleIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "@tanstack/react-router";
import { ColorLabel } from "@/components/color/ColorLabel";

interface OverviewData {
  totalFilaments: number;
  totalModels: number;
  totalProducts: number;
  totalSlicedFiles: number;
  totalBrands: number;
  totalMaterialTypes: number;
}

interface InventoryData {
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
}

interface PrintStatsData {
  averagePrintTime: number | null;
  totalPrintTime: number | null;
  totalPrintJobs: number | null;
}

interface RecentModel {
  id: number;
  name: string;
  Category: { name: string };
  images: Array<{ url: string; name: string }>;
}

interface DashboardOverviewProps {
  overview: OverviewData;
  inventory: InventoryData;
  printStats: PrintStatsData;
  recentModels: RecentModel[];
}

export function DashboardOverview({ overview, inventory, printStats, recentModels }: DashboardOverviewProps) {
  const navigate = useNavigate();
  const formatTime = (minutes: number | null) => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatWeight = (grams: number) => {
    return grams >= 1000 ? `${(grams / 1000).toFixed(1)}kg` : `${grams}g`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <SwatchIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{overview.totalFilaments}</p>
              <p className="text-sm text-muted-foreground">Filaments</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CubeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{overview.totalModels}</p>
              <p className="text-sm text-muted-foreground">Models</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{overview.totalProducts}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{overview.totalSlicedFiles}</p>
              <p className="text-sm text-muted-foreground">Sliced Files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Status */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
            <ScaleIcon className="w-5 h-5" />
            Inventory Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Weight</span>
              <span className="font-medium">{formatWeight(inventory.totalFilamentWeight)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-medium">${inventory.totalFilamentCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brands</span>
              <span className="font-medium">{overview.totalBrands}</span>
            </div>
            {inventory.lowStockCount > 0 && (
              <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-md">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{inventory.lowStockCount} low stock items</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Print Stats */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Print Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Print Jobs</span>
              <span className="font-medium">{printStats.totalPrintJobs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Print Time</span>
              <span className="font-medium">{formatTime(printStats.totalPrintTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Print Time</span>
              <span className="font-medium">{formatTime(printStats.averagePrintTime)}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {inventory.lowStockFilaments.length > 0 && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              Low Stock Items
            </h3>
            <div className="space-y-2">
              {inventory.lowStockFilaments.map((filament) => (
                <div key={filament.id} className="flex items-center gap-3 p-2 bg-surface-1 rounded-md">
                  <ColorLabel 
                    color={filament.color} 
                    name={filament.name}
                    brand={filament.Brand.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{filament.Material.name}</p>
                  </div>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    {formatWeight(filament.grams || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Models */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Recent Models</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentModels.map((model) => (
            <div 
              key={model.id} 
              className="group cursor-pointer"
              onClick={() => navigate({ to: '/models/$modelId', params: { modelId: model.id.toString() } })}
            >
              <div className="aspect-square bg-surface-1 rounded-lg border border-border overflow-hidden mb-2">
                {model.images[0] ? (
                  <img 
                    src={model.images[0].url} 
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CubeIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h4 className="font-medium text-sm truncate">{model.name}</h4>
              <p className="text-xs text-muted-foreground">{model.Category.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}