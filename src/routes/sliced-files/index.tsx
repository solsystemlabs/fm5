import { useSlicedFilesTRPC } from "@/lib/trpc-hooks";
import { createFileRoute } from "@tanstack/react-router";
import SlicedFilesTable from "../../components/tables/SlicedFilesTable";
import FMButton from "../../components/ui/FMButton";
import Upload3MFDialog from "../../components/dialogs/Upload3MFDialog";

export const Route = createFileRoute("/sliced-files/")({
  component: SlicedFilesPage,
});

function SlicedFilesPage() {
  const { data: slicedFiles = [], isLoading, error } = useSlicedFilesTRPC();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-3xl font-bold">3MF Files</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-destructive">
            Error loading 3MF files: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex">
        <div className="sm:flex-auto">
          <h1 className="text-foreground text-base font-semibold">3MF Files</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your 3MF sliced files with automatic metadata extraction,
            print time estimates, and filament usage breakdowns.
          </p>
        </div>
        <Upload3MFDialog
          triggerElement={
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <FMButton size="lg">Upload 3MF File</FMButton>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-muted-foreground">Loading 3MF files...</p>
        </div>
      ) : (
        <SlicedFilesTable data={slicedFiles} />
      )}
    </div>
  );
}

