import { useFilaments } from "@/lib/api-hooks";
import { createFileRoute } from "@tanstack/react-router";
import FilamentsTable from "../../components/tables/FilamentsTable";
import FMButton from "../../components/ui/FMButton";
import AddFilamentDialog from "../../components/dialogs/AddFilamentDialog";

export const Route = createFileRoute("/filaments/")({
  component: FilamentsPage,
});

function FilamentsPage() {
  const { data: filaments = [], isLoading, error } = useFilaments();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-3xl font-bold">Filaments</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-destructive">
            Error loading filaments: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex">
        <div className="sm:flex-auto">
          <h1 className="text-foreground text-base font-semibold">Filaments</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            A complete list of all your 3D printing filaments including their
            specifications and associated models.
          </p>
        </div>
        <AddFilamentDialog
          triggerElement={
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <FMButton size="lg">Add Filament</FMButton>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-muted-foreground">Loading filaments...</p>
        </div>
      ) : (
        <FilamentsTable data={filaments} />
      )}
    </div>
  );
}
