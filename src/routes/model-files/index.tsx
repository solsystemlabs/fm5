import { useModelFiles } from "@/lib/api-hooks";
import { createFileRoute } from "@tanstack/react-router";
import ModelFilesTable from "../../components/tables/ModelFilesTable";
import FMButton from "../../components/ui/FMButton";

export const Route = createFileRoute("/model-files/")({
  component: ModelFilesPage,
});

function ModelFilesPage() {
  const { data: modelFilesData, isLoading, error } = useModelFiles();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-3xl font-bold">Model Files</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-destructive">
            Error loading model files: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const files = modelFilesData?.files || [];
  const summary = modelFilesData?.summary;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-foreground text-base font-semibold">Model Files</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage all model files and images across your entire inventory.
            View, download, and organize your 3D model assets.
          </p>
          {summary && (
            <div className="mt-3 flex items-center space-x-6 text-sm text-muted-foreground">
              <span>{summary.totalFiles} total files</span>
              <span>{summary.modelFilesCount} model files</span>
              <span>{summary.modelImagesCount} images</span>
              {summary.totalSize > 0 && (
                <span>{(summary.totalSize / 1024 / 1024).toFixed(1)}MB total</span>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <p className="text-muted-foreground text-sm">
            Upload files through individual models
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-muted-foreground">Loading model files...</p>
        </div>
      ) : (
        <ModelFilesTable data={files} />
      )}
    </div>
  );
}