import { createFileRoute } from "@tanstack/react-router";
import { FilamentsTable } from "@/components/FilamentsTable";
import { AddFilamentDialog } from "@/components/AddFilamentDialog";
import { Button } from "@/components/aria/button";
import { useFilaments } from "@/lib/api-hooks";

export const Route = createFileRoute("/filaments/")({
  component: FilamentsPage,
});

function FilamentsPage() {
  const { data: filaments = [], isLoading, error } = useFilaments();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Filaments</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600">
            Error loading filaments: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Filaments
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A complete list of all your 3D printing filaments including their
            specifications and associated models.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <AddFilamentDialog>
            <Button
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Add filament
            </Button>
          </AddFilamentDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Loading filaments...
          </p>
        </div>
      ) : (
        <FilamentsTable data={filaments} />
      )}
    </div>
  );
}

