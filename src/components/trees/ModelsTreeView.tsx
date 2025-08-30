import { type ReactNode, useState } from "react";
import {
  Button,
  Collection,
  Tree,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import {
  ChevronRightIcon,
  DocumentIcon,
  PhotoIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CubeIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "@tanstack/react-router";
import { ImageThumbnailGrid } from "../ImagePreviewGallery";
import { formatFileSize } from "@/lib/file-processing-service";
import { useDeleteModelFilesTRPC } from "@/lib/trpc-hooks";
import type { TreeNode } from "@/types/tree";

interface ModelsTreeViewProps {
  data: TreeNode[];
  className?: string;
}

export default function ModelsTreeView({
  data,
  className = "",
}: ModelsTreeViewProps): ReactNode {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const deleteModelFilesMutation = useDeleteModelFilesTRPC();
  const navigate = useNavigate();

  const handleModelAction = (modelId: string) => {
    navigate({ to: '/models/$modelId', params: { modelId } });
  };

  const handleDelete = async (file: TreeNode) => {
    if (
      !file.originalData ||
      !confirm(`Are you sure you want to delete "${file.name}"?`)
    ) {
      return;
    }

    try {
      // Map new node types to deletion parameters
      if (file.type === "modelImage") {
        // Delete from tagged union File system
        await deleteModelFilesMutation.mutateAsync({
          imageFileIds: [file.originalData.id],
        });
      } else if (file.type === "modelFile") {
        await deleteModelFilesMutation.mutateAsync({
          modelFileIds: [file.originalData.id],
        });
      } else if (file.type === "threeMFFile") {
        await deleteModelFilesMutation.mutateAsync({
          threeMFFileIds: [file.originalData.id],
        });
      }
      // Note: slicedFile deletion would be handled via threeMFFile cascade
    } catch (error) {
      alert(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // TODO: Rework this; download urls should be saved in the db on the model itself, not generated on the fly here
  // TODO: What the heck? Don't create a temporary <a> tag and programmatically click it!!!
  const handleDownload = async (file: TreeNode) => {
    if (!file.originalData) return;

    try {
      let downloadEndpoint: string;
      
      // Map to appropriate download endpoints based on file type
      switch (file.type) {
        case "modelImage":
          downloadEndpoint = `/api/download/model-image/${file.originalData.id}`;
          break;
        case "modelFile":
          downloadEndpoint = `/api/download/model-file/${file.originalData.id}`;
          break;
        case "threeMFFile":
          // TODO: Create threeMF download endpoint
          downloadEndpoint = `/api/download/threemf-file/${file.originalData.id}`;
          break;
        case "slicedFile":
          downloadEndpoint = `/api/download/sliced-files/${file.originalData.id}/download`;
          break;
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }

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
      alert(
        `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const getFileTypeIcon = (node: TreeNode) => {
    switch (node.type) {
      case "modelImage":
        return <PhotoIcon className="h-4 w-4 text-blue-500" />;
      case "modelFile":
        return <DocumentIcon className="h-4 w-4 text-gray-500" />;
      case "threeMFFile":
        return <CubeIcon className="h-4 w-4 text-purple-500" />;
      case "slicedFile":
        return <PlayIcon className="h-4 w-4 text-green-500" />;
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderTreeItem = (node: TreeNode): ReactNode => {
    const isModel = node.type === "model";
    const isFile = node.type === "modelFile" || node.type === "modelImage" || node.type === "threeMFFile" || node.type === "slicedFile";

    return (
      <TreeItem
        key={node.id}
        id={node.id}
        textValue={node.name}
        className="group outline-none"
        {...(isModel && { onAction: () => handleModelAction(node.id) })}
      >
        <TreeItemContent>
          {({ hasChildItems }) => (
            <div
              className={`hover:bg-muted/50 mx-1 my-0.5 flex items-center rounded-md py-2 transition-colors ${isModel ? 'cursor-pointer' : ''}`}
            >
              {/* Indentation and chevron */}
              <div
                className="flex w-full items-center"
                style={{
                  paddingLeft: `calc(var(--tree-item-level - 1) * 1.5rem)`,
                }}
              >
                {hasChildItems ? (
                  <Button
                    slot="chevron"
                    className={`text-muted-foreground hover:text-primary hover:bg-muted/30 mr-2 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent transition-transform duration-200 outline-none group-data-[expanded=true]:rotate-90`}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="mr-2 h-6 w-6 shrink-0" />
                )}

                {/* Content based on node type */}
                {isModel && (
                  <>
                    {/* Model name and info */}
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center space-x-3">
                        <div className="text-foreground group-hover:text-primary text-lg font-semibold transition-colors">
                          {node.name}
                        </div>
                        {node.category && (
                          <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                            {node.category}
                          </span>
                        )}
                      </div>

                      {/* File counts and filaments */}
                      <div className="text-muted-foreground mt-1 flex items-center space-x-4 text-sm">
                        {node.fileCounts && (
                          <div className="flex items-center space-x-3">
                            {node.fileCounts.images > 0 && (
                              <div className="flex items-center space-x-1">
                                <PhotoIcon className="h-4 w-4 text-blue-500" />
                                <span>
                                  {node.fileCounts.images} image
                                  {node.fileCounts.images !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                            {node.fileCounts.files > 0 && (
                              <div className="flex items-center space-x-1">
                                <DocumentIcon className="h-4 w-4 text-green-500" />
                                <span>
                                  {node.fileCounts.files} file
                                  {node.fileCounts.files !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                            {node.fileCounts.slicedFiles && node.fileCounts.slicedFiles > 0 && (
                              <div className="flex items-center space-x-1">
                                <PlayIcon className="h-4 w-4 text-green-600" />
                                <span>
                                  {node.fileCounts.slicedFiles} sliced
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {node.filaments && node.filaments.length > 0 && (
                          <span>
                            • {node.filaments.length} filament
                            {node.filaments.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1" />

                    <div className="mr-4 flex h-10">
                      {node.thumbnails && node.thumbnails.length > 0 ? (
                        <ImageThumbnailGrid
                          images={node.thumbnails}
                          maxImages={4}
                          className="justify-start"
                        />
                      ) : (
                        <div className="bg-muted/60 flex h-10 w-10 items-center justify-center rounded-lg">
                          <DocumentIcon className="text-muted-foreground h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* Model actions */}
                    <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        to="/models/$modelId"
                        params={{ modelId: node.id }}
                        className="text-muted-foreground hover:text-primary rounded p-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </>
                )}

                {isFile && (
                  <>
                    {/* File icon */}
                    <div className="bg-muted/40 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
                      {getFileTypeIcon(node)}
                    </div>

                    {/* File name and info */}
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground group-hover:text-primary truncate font-medium transition-colors">
                        {node.name}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {node.fileExtension?.toUpperCase()}{" "}
                        {node.size && `• ${formatFileSize(node.size)}`}
                        {node.type === "threeMFFile" && node.hasGcode && " • Sliced"}
                        {node.type === "slicedFile" && node.printTimeMinutes && ` • ${Math.round(node.printTimeMinutes / 60)}h ${node.printTimeMinutes % 60}m`}
                      </div>
                    </div>

                    {/* File actions */}
                    <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {node.type === "modelImage" && node.originalData && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement image preview
                          }}
                          className="text-muted-foreground hover:text-primary rounded p-1 transition-colors"
                          title="Preview image"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {node.originalData && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(node);
                          }}
                          className="text-muted-foreground hover:text-primary rounded p-1 transition-colors"
                          title="Download file"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(node);
                        }}
                        className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                        title="Delete file"
                        disabled={deleteModelFilesMutation.isPending}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </TreeItemContent>

        {/* Render children */}
        {node.children && (
          <Collection items={node.children}>{renderTreeItem}</Collection>
        )}
      </TreeItem>
    );
  };

  if (data.length === 0) {
    return (
      <div className="mt-8 py-12 text-center">
        <DocumentIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="text-foreground mb-2 text-lg font-medium">
          No models found
        </h3>
        <p className="text-muted-foreground">
          Create your first model to see it here with its associated files.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border-border overflow-hidden rounded-lg border shadow-sm ${className}`}
    >
      <Tree
        aria-label="Models and Files"
        selectionMode="single"
        expandedKeys={expandedKeys}
        onExpandedChange={setExpandedKeys}
        className="p-2"
        items={data}
      >
        {renderTreeItem}
      </Tree>
    </div>
  );
}
