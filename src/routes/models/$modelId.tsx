import ImagePreviewGallery from "@/components/ImagePreviewGallery";
import SlicedFilesGrid from "@/components/SlicedFilesGrid";
import AddSlicedFileDialog from "@/components/dialogs/AddSlicedFileDialog";
import { formatFileSize } from "@/lib/file-processing-service";
import { useModelFilesByModelTRPC, useModelsTRPC, useSlicedFilesByModelTRPC } from "@/lib/trpc-hooks";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronLeftIcon,
  CubeIcon,
  DocumentIcon,
  PhotoIcon,
  PlayIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import FMButton from "@/components/ui/FMButton";
import type { SlicedFile } from "@/lib/types";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/models/$modelId")({
  component: ModelDetailPage,
});

function ModelDetailPage() {
  const { modelId } = Route.useParams();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedThreeMFFileId, setSelectedThreeMFFileId] = useState<number | undefined>();
  
  const {
    data: modelFilesData,
    isLoading: filesLoading,
    error: filesError,
  } = useModelFilesByModelTRPC(parseInt(modelId));
  const { data: modelsData, isLoading: modelsLoading } = useModelsTRPC();
  const {
    data: slicedFilesData = [],
    isLoading: slicedFilesLoading,
    error: slicedFilesError,
    refetch: refetchSlicedFiles,
  } = useSlicedFilesByModelTRPC(parseInt(modelId));

  const isLoading = filesLoading || modelsLoading || slicedFilesLoading;
  const error = filesError || slicedFilesError;

  const model = modelsData?.find((m) => m.id === parseInt(modelId));


  const handleFileDownload = async (file: any) => {
    try {
      const downloadEndpoint =
        file.type === "modelImage"
          ? `/api/download/model-image/${file.id}`
          : file.type === "threeMFFile"
            ? `/api/download/threemf-file/${file.id}`
            : file.type === "slicedFile"
              ? `/api/download/sliced-files/${file.id}/download`
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
  const threeMFFiles = modelFilesData?.threeMFFiles || [];
  const modelImages = modelFilesData?.imageFiles || [];
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
    ...threeMFFiles.map((file) => ({
      ...file,
      type: "threeMFFile" as const,
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
                  <span>{summary.threeMFFilesCount} 3MF files</span>
                  <span>{slicedFilesData.length} sliced files</span>
                  <span>{summary.imageFilesCount} images</span>
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

      {/* Sliced Files Section - Priority */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <SlicedFilesGrid
            slicedFiles={slicedFilesData}
            isLoading={slicedFilesLoading}
            onDownload={(slicedFile: SlicedFile) => handleFileDownload({ ...slicedFile, type: "slicedFile" })}
            onUpload={() => {
              setSelectedThreeMFFileId(undefined); // No pre-selection from grid header
              setIsUploadDialogOpen(true);
            }}
            gridCols={4}
          />
        </div>
      </div>

      {/* Add Sliced Files Dialog */}
      <AddSlicedFileDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={(open) => {
          setIsUploadDialogOpen(open);
          if (!open) {
            setSelectedThreeMFFileId(undefined); // Reset selection when dialog closes
          }
        }}
        modelId={parseInt(modelId)}
        preSelectedThreeMFFileId={selectedThreeMFFileId}
        onSuccess={() => {
          refetchSlicedFiles();
        }}
      />

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
          <h2 className="text-foreground text-xl font-semibold">Source Files</h2>
          <p className="text-muted-foreground mt-1">
            Original model files, 3MF files, and images associated with this model.
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
                      ) : file.type === "threeMFFile" ? (
                        <CubeIcon className="text-muted-foreground h-6 w-6" />
                      ) : (
                        <DocumentIcon className="text-muted-foreground h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatFileSize(file.size)} •{" "}
                            {file.fileExtension.toUpperCase()}
                            {file.type === "threeMFFile" &&
                              file.extractedImages?.length > 0 && (
                                <span>
                                  {" "}
                                  • {file.extractedImages.length} embedded image
                                  {file.extractedImages.length > 1 ? "s" : ""}
                                </span>
                              )}
                            {file.type === "threeMFFile" && (() => {
                              const slicedFilesForThisMF = slicedFilesData.filter(sf => sf.threeMFFileId === file.id);
                              return slicedFilesForThisMF.length > 0 && (
                                <span className="text-green-600">
                                  {" "}
                                  • {slicedFilesForThisMF.length} sliced file{slicedFilesForThisMF.length > 1 ? "s" : ""}
                                </span>
                              );
                            })()}
                          </p>
                        </div>
                        {file.type === "threeMFFile" &&
                          file.extractedImages?.length > 0 && (
                            <div className="flex space-x-2">
                              {file.extractedImages.map((image: any) => (
                                <img
                                  key={image.id}
                                  src={image.url}
                                  alt={image.name}
                                  className="h-12 w-12 rounded border object-cover"
                                  onError={(e) => {
                                    // Hide broken images
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Upload sliced file button for model files */}
                    {(file.type === "modelFile" || file.type === "threeMFFile") && (
                      <button
                        onClick={() => {
                          setSelectedThreeMFFileId(file.id);
                          setIsUploadDialogOpen(true);
                        }}
                        className="text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 inline-flex items-center rounded-md p-2 transition-colors"
                        title="Upload sliced file for this model"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                      </button>
                    )}
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
