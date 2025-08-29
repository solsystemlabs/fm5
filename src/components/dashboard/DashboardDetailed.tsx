import { 
  CubeIcon, 
  SwatchIcon, 
  ShoppingBagIcon, 
  DocumentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { ColorLabel } from "@/components/color/ColorLabel";

interface DetailedData {
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
  distributions: {
    materialTypes: Array<{ materialTypeId: number; _count: number }>;
    brands: Array<{ brandName: string; _count: number }>;
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
}

interface DashboardDetailedProps {
  data: DetailedData;
}

export function DashboardDetailed({ data }: DashboardDetailedProps) {
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
    <div className="space-y-8">
      {/* Comprehensive Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <SwatchIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-card-foreground">{data.overview.totalFilaments}</p>
          <p className="text-sm text-muted-foreground">Filaments</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <CubeIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold text-card-foreground">{data.overview.totalModels}</p>
          <p className="text-sm text-muted-foreground">Models</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-bold text-card-foreground">{data.overview.totalProducts}</p>
          <p className="text-sm text-muted-foreground">Products</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <DocumentIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold text-card-foreground">{data.overview.totalSlicedFiles}</p>
          <p className="text-sm text-muted-foreground">Sliced Files</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
          <p className="text-2xl font-bold text-card-foreground">{data.overview.totalBrands}</p>
          <p className="text-sm text-muted-foreground">Brands</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <SwatchIcon className="w-8 h-8 mx-auto mb-2 text-pink-600" />
          <p className="text-2xl font-bold text-card-foreground">{data.overview.totalMaterialTypes}</p>
          <p className="text-sm text-muted-foreground">Materials</p>
        </div>
      </div>

      {/* Detailed Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Detailed Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              Low Stock Inventory ({data.inventory.lowStockCount} items)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-1">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Filament</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.inventory.lowStockFilaments.slice(0, 10).map((filament) => (
                  <tr key={filament.id} className="hover:bg-surface-1">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <ColorLabel 
                          color={filament.color} 
                          name={filament.name}
                          brand={filament.Brand.name}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {filament.Brand.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {filament.Material.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-orange-600">
                        {formatWeight(filament.grams || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      ${(filament.cost || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brand Distribution Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              Brand Distribution
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-1">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.distributions.brands
                  .sort((a, b) => b._count - a._count)
                  .slice(0, 10)
                  .map((brand, index) => {
                    const percentage = data.overview.totalFilaments > 0 
                      ? (brand._count / data.overview.totalFilaments) * 100 
                      : 0;
                    return (
                      <tr key={brand.brandName} className="hover:bg-surface-1">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-card-foreground">
                          {brand.brandName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {brand._count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-2 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Statistics Detailed */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-purple-600" />
            Print Statistics Summary
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{data.printStats.totalPrintJobs || 0}</span>
              </div>
              <h4 className="font-semibold text-card-foreground mb-2">Total Print Jobs</h4>
              <p className="text-sm text-muted-foreground">
                All print jobs processed through the system
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-card-foreground mb-2">{formatTime(data.printStats.totalPrintTime)}</h4>
              <p className="text-sm text-muted-foreground">
                Total print time across all jobs
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-card-foreground mb-2">{formatTime(data.printStats.averagePrintTime)}</h4>
              <p className="text-sm text-muted-foreground">
                Average print time per job
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Models Grid */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-green-600" />
            Recent Models Library
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {data.recentModels.map((model) => (
              <div key={model.id} className="group cursor-pointer">
                <div className="aspect-square bg-surface-1 rounded-lg border border-border overflow-hidden mb-3">
                  {model.ModelImage[0] ? (
                    <img 
                      src={model.ModelImage[0].url} 
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CubeIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm truncate text-card-foreground mb-1">{model.name}</h4>
                <p className="text-xs text-muted-foreground">{model.Category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Inventory Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-card-foreground">{formatWeight(data.inventory.totalFilamentWeight)}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Weight</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-card-foreground">${data.inventory.totalFilamentCost.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Value</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-card-foreground">{data.overview.totalBrands}</p>
              <p className="text-sm text-muted-foreground mt-1">Brands</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{data.inventory.lowStockCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Low Stock Items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}