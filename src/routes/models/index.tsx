import { useModelsTRPC } from "@/lib/trpc-hooks";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ModelsTreeView from "../../components/trees/ModelsTreeView";
import FMButton from "../../components/ui/FMButton";
import AddModelDialog from "../../components/dialogs/AddModelDialog";
import { transformModelsToTree } from "@/lib/tree-utils";

export const Route = createFileRoute("/models/")({
  component: ModelsPage,
});

function ModelsPage() {
  const { data: models = [], isLoading: modelsLoading, error: modelsError } = useModelsTRPC();
  const trpc = useTRPC();
  
  // Fetch model images separately from tagged union File system
  const { data: allModelImages = [], isLoading: imagesLoading } = useQuery(
    trpc.files.byMimeType.queryOptions({
      mimeTypePattern: "image/",
      limit: 200 // Adjust as needed
    })
  );

  const isLoading = modelsLoading || imagesLoading;
  const error = modelsError;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-3xl font-bold">Models</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-destructive">
            Error loading models: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Group images by model ID
  const imagesByModel = allModelImages
    .filter(img => img.entityType === 'MODEL')
    .reduce((acc, img) => {
      if (!acc[img.entityId]) {
        acc[img.entityId] = [];
      }
      acc[img.entityId].push(img);
      return acc;
    }, {} as Record<number, any[]>);

  // Transform flat models data into tree structure
  const treeData = transformModelsToTree(models, imagesByModel);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex">
        <div className="sm:flex-auto">
          <h1 className="text-foreground text-base font-semibold">Models</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Explore your 3D models in a hierarchical view. Expand models to see
            their associated files and images.
          </p>
        </div>
        <AddModelDialog
          triggerElement={
            <div className="sm:mt-0 sm:ml-16 sm:flex-none">
              <FMButton size="lg">Add Model</FMButton>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-muted-foreground">Loading models...</p>
        </div>
      ) : (
        <div className="mt-8">
          <ModelsTreeView data={treeData.models} />
        </div>
      )}
    </div>
  );
}
