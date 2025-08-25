import { createFileRoute } from "@tanstack/react-router";
import { useModels } from "@/lib/api-hooks";

export const Route = createFileRoute("/models/")({
  component: ModelsPage,
});

function ModelsPage() {
  const { data: models = [], isLoading, error } = useModels();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Models</h1>
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <p className="text-destructive">Error loading models: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Models</h1>
      </div>

      <div className="bg-card rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading models...</p>
          </div>
        ) : (
          <div className="p-6"></div>
        )}
      </div>
    </div>
  );
}

