import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, Suspense } from "react";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "react-aria-components";
import { DashboardLayoutSwitcher, type DashboardLayout } from "@/components/dashboard/DashboardLayoutSwitcher";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { DashboardBento } from "@/components/dashboard/DashboardBento";
import { DashboardDetailed } from "@/components/dashboard/DashboardDetailed";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { useDashboardAnalyticsTRPC } from "@/lib/trpc-hooks";
import { useTRPC } from "@/lib/trpc/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  errorComponent: DashboardError,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardContent() {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>("overview");
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.dashboard.analytics.queryOptions()); // Using tRPC with suspense
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate tRPC dashboard queries
    queryClient.invalidateQueries({ queryKey: [["dashboard"]] });
  };

  const renderDashboardLayout = () => {
    switch (currentLayout) {
      case "overview":
        return (
          <DashboardOverview 
            overview={data.overview}
            inventory={data.inventory}
            printStats={data.printStats}
            recentModels={data.recentModels}
          />
        );
      case "analytics":
        return <DashboardAnalytics data={data} />;
      case "bento":
        return <DashboardBento data={data} />;
      case "detailed":
        return <DashboardDetailed data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Layout Switcher */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            onPress={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-surface-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <DashboardLayoutSwitcher 
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="min-h-screen">
        {renderDashboardLayout()}
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="w-20 h-8 bg-surface-2 rounded-md animate-pulse"></div>
          <div className="w-64 h-8 bg-surface-2 rounded-md animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-surface-2 rounded w-3/4"></div>
              <div className="h-8 bg-surface-2 rounded w-1/2"></div>
              <div className="h-4 bg-surface-2 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-surface-2 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-2 rounded"></div>
                <div className="h-4 bg-surface-2 rounded w-5/6"></div>
                <div className="h-4 bg-surface-2 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

