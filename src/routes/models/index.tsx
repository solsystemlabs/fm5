import { useModels } from "@/lib/api-hooks";
import { createFileRoute } from "@tanstack/react-router";
import ModelsTable from "../../components/ModelsTable";
import FMButton from "../../components/ui/FMButton";
import AddModelDialog from "../../components/AddModelDialog";

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
          <p className="text-destructive">
            Error loading models: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-foreground">
            Models
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A complete list of all your 3D models organized by category and
            associated filaments.
          </p>
        </div>
        <AddModelDialog
          triggerElement={
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <FMButton size="lg">Add Model</FMButton>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-muted-foreground">
            Loading models...
          </p>
        </div>
      ) : (
        <ModelsTable data={models} />
      )}
    </div>
  );
}

