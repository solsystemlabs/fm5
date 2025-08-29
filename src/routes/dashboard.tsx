import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "react-aria-components";
import { DashboardLayoutSwitcher, type DashboardLayout } from "@/components/dashboard/DashboardLayoutSwitcher";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { DashboardBento } from "@/components/dashboard/DashboardBento";
import { DashboardDetailed } from "@/components/dashboard/DashboardDetailed";
import { useDashboardAnalytics } from "@/lib/api-hooks/dashboard";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>("overview");
  const { data, isLoading, error, refetch, isRefetching } = useDashboardAnalytics();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border text-center">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Failed to load dashboard data"}
          </p>
          <Button 
            onPress={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-2 rounded w-1/3"></div>
            <div className="h-4 bg-surface-2 rounded w-1/2"></div>
            <div className="h-4 bg-surface-2 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

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
            onPress={() => refetch()}
            isDisabled={isRefetching}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isRefetching 
                ? 'bg-surface-2 text-muted-foreground cursor-not-allowed' 
                : 'hover:bg-surface-2 text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <ArrowPathIcon className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </span>
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

