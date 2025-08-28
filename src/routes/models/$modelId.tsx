import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useModelFilesByModel, useModels } from "@/lib/api-hooks";
import {
  ChevronLeftIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { formatFileSize } from "@/lib/file-processing-service";
import ImagePreviewGallery from "@/components/ImagePreviewGallery";

export const Route = createFileRoute("/models/$modelId")({
  component: ModelDetailPage,
});

function ModelDetailPage() {
  const { modelId } = Route.useParams();
  const {
    data: modelFilesData,
    isLoading: filesLoading,
    error: filesError,
  } = useModelFilesByModel(parseInt(modelId));
  const { data: modelsData, isLoading: modelsLoading } = useModels();

  const isLoading = filesLoading || modelsLoading;
  const error = filesError;

  // Find the specific model from the models list
  const model = modelsData?.find((m) => m.id === parseInt(modelId));

  // Handle file download
  const handleFileDownload = async (file: any) => {
    try {
      const downloadEndpoint =
        file.type === "modelImage"
          ? `/api/download/model-image/${file.id}`
          : `/api/download/model-file/${file.id}`;

      const response = await fetch(downloadEndpoint);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const { downloadUrl, filename } = await response.json();

      // Create a temporary link and click it to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download file:", error);
      // You could add a toast notification here if you have one
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/models"
            className="text-muted-foreground hover:text-primary inline-flex items-center"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Back to Models
          </Link>
        </div>
        <h1 className="text-foreground text-3xl font-bold">Model Details</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-destructive">
            Error loading model details: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/models"
            className="text-muted-foreground hover:text-primary inline-flex items-center"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Back to Models
          </Link>
        </div>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-muted-foreground">Loading model details...</p>
        </div>
      </div>
    );
  }

  const modelFiles = modelFilesData?.modelFiles || [];
  const modelImages = modelFilesData?.modelImages || [];
  const summary = modelFilesData?.summary;

  if (!model) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/models"
            className="text-muted-foreground hover:text-primary inline-flex items-center"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Back to Models
          </Link>
        </div>
        <h1 className="text-foreground text-3xl font-bold">Model Not Found</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-muted-foreground">
            The requested model could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Convert model images to ImageFile format for gallery
  const imageFiles = modelImages.map((image) => ({
    id: image.id,
    name: image.name,
    url: image.url,
    size: image.size,
  }));

  // Convert to format expected by ModelFilesTable
  const files = [
    ...modelFiles.map((file) => ({
      ...file,
      type: "modelFile" as const,
      fileExtension: file.name.split(".").pop() || "",
      Model: {
        id: model.id,
        name: model.name,
        Category: model.Category,
      },
    })),
    ...modelImages.map((image) => ({
      ...image,
      type: "modelImage" as const,
      fileExtension: image.name.split(".").pop() || "",
      Model: {
        id: model.id,
        name: model.name,
        Category: model.Category,
      },
    })),
  ];

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/models"
            className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Back to Models
          </Link>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-card rounded-lg p-6 shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              {model.name}
            </h1>
            <div className="text-muted-foreground flex items-center space-x-4">
              <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {model.Category.name}
              </span>
              {summary && (
                <>
                  <span>{summary.totalFiles} files</span>
                  <span>{summary.modelFilesCount} model files</span>
                  <span>{summary.modelImagesCount} images</span>
                  {summary.totalSize > 0 && (
                    <span>
                      {(summary.totalSize / 1024 / 1024).toFixed(1)}MB
                    </span>
                  )}
                </>
              )}
            </div>
            {model.Filaments && model.Filaments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-foreground mb-2 text-sm font-medium">
                  Compatible Filaments
                </h3>
                <div className="flex flex-wrap gap-2">
                  {model.Filaments.map((filament) => (
                    <span
                      key={filament.id}
                      className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    >
                      {filament.Brand.name} {filament.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {imageFiles.length > 0 && (
        <div className="bg-card rounded-lg p-6 shadow">
          <h2 className="text-foreground mb-4 text-xl font-semibold">Images</h2>
          <ImagePreviewGallery
            images={imageFiles}
            gridCols={4}
            className="w-full"
          />
        </div>
      )}

      {/* Files Table */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b p-6">
          <h2 className="text-foreground text-xl font-semibold">Files</h2>
          <p className="text-muted-foreground mt-1">
            All files and images associated with this model.
          </p>
        </div>
        <div className="p-6">
          {files.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No files uploaded for this model yet.
            </p>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.type === "modelImage" ? (
                        <PhotoIcon className="text-muted-foreground h-6 w-6" />
                      ) : (
                        <DocumentIcon className="text-muted-foreground h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)} •{" "}
                        {file.fileExtension.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFileDownload(file)}
                      className="text-muted-foreground hover:text-primary hover:bg-muted inline-flex items-center rounded-md p-2 transition-colors"
                      title="Download file"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

