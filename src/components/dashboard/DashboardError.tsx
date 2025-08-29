import { useRouter } from "@tanstack/react-router";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "react-aria-components";

interface DashboardErrorProps {
  error: Error;
}

export function DashboardError({ error }: DashboardErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    // Invalidate the route to reload the loader and reset error boundary
    router.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>
      
      <div className="bg-card p-8 rounded-lg border border-border text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2 text-destructive">Failed to Load Dashboard</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {error.message || "There was an error loading the dashboard data. Please try again."}
        </p>
        
        <Button 
          onPress={handleRetry}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Retry Loading Dashboard
        </Button>
      </div>
    </div>
  );
}