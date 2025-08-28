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
  TrashIcon
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { ImageThumbnailGrid } from "../ImagePreviewGallery";
import { formatFileSize } from "@/lib/file-processing-service";
import { useDeleteModelFiles } from "@/lib/api-hooks";
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
  const deleteModelFilesMutation = useDeleteModelFiles();

  const handleDelete = async (file: TreeNode) => {
    if (!file.originalData || !confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      await deleteModelFilesMutation.mutateAsync({
        fileIds: [file.originalData.id],
        type: file.type === 'modelImage' ? 'modelImage' : 'modelFile',
      });
    } catch (error) {
      alert(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = async (file: TreeNode) => {
    if (!file.originalData) return;
    
    try {
      const downloadEndpoint = file.type === 'modelImage' 
        ? `/api/download/model-image/${file.originalData.id}`
        : `/api/download/model-file/${file.originalData.id}`;
      
      const response = await fetch(downloadEndpoint);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const { downloadUrl, filename } = await response.json();
      
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getFileTypeIcon = (node: TreeNode) => {
    if (node.type === 'modelImage') {
      return <PhotoIcon className="h-4 w-4 text-blue-500" />;
    }
    return <DocumentIcon className="h-4 w-4 text-gray-500" />;
  };

  const renderTreeItem = (node: TreeNode): ReactNode => {
    const isModel = node.type === 'model';
    const isFile = node.type === 'modelFile' || node.type === 'modelImage';

    return (
      <TreeItem
        key={node.id}
        id={node.id}
        textValue={node.name}
        className="group outline-none"
      >
        <TreeItemContent>
          {({ hasChildItems, isExpanded }) => (
            <div className="flex items-center py-2 px-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-md mx-1 my-0.5">
              {/* Indentation and chevron */}
              <div 
                className="flex items-center"
                style={{ 
                  paddingLeft: `calc(var(--tree-item-level) * 1.5rem)` 
                }}
              >
                {hasChildItems ? (
                  <Button
                    slot="chevron"
                    className={`
                      shrink-0 w-6 h-6 mr-2 
                      group-data-[expanded=true]:rotate-90 transition-transform duration-200
                      inline-flex items-center justify-center bg-transparent border-0
                      cursor-pointer outline-none text-muted-foreground hover:text-primary
                      hover:bg-muted/30 rounded
                    `}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="shrink-0 w-6 h-6 mr-2" />
                )}

                {/* Content based on node type */}
                {isModel && (
                  <>
                    {/* Model icon/thumbnail */}
                    <div className="w-10 h-10 mr-4 flex-shrink-0">
                      {node.thumbnails && node.thumbnails.length > 0 ? (
                        <ImageThumbnailGrid 
                          images={node.thumbnails}
                          maxImages={1}
                          className="justify-start"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted/60 rounded-lg flex items-center justify-center">
                          <DocumentIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Model name and info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {node.name}
                        </div>
                        {node.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {node.category}
                          </span>
                        )}
                      </div>
                      
                      {/* File counts and filaments */}
                      <div className="mt-1 flex items-center space-x-4 text-sm text-muted-foreground">
                        {node.fileCounts && (
                          <div className="flex items-center space-x-3">
                            {node.fileCounts.images > 0 && (
                              <div className="flex items-center space-x-1">
                                <PhotoIcon className="h-4 w-4 text-blue-500" />
                                <span>{node.fileCounts.images} image{node.fileCounts.images !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {node.fileCounts.files > 0 && (
                              <div className="flex items-center space-x-1">
                                <DocumentIcon className="h-4 w-4 text-green-500" />
                                <span>{node.fileCounts.files} file{node.fileCounts.files !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {node.filaments && node.filaments.length > 0 && (
                          <span>• {node.filaments.length} filament{node.filaments.length !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>

                    {/* Model actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to="/models/$modelId" 
                        params={{ modelId: node.id }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
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
                    <div className="w-8 h-8 mr-3 flex items-center justify-center bg-muted/40 rounded-md flex-shrink-0">
                      {getFileTypeIcon(node)}
                    </div>

                    {/* File name and info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {node.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {node.fileExtension?.toUpperCase()} {node.size && `• ${formatFileSize(node.size)}`}
                      </div>
                    </div>

                    {/* File actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {node.type === 'modelImage' && node.originalData && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement image preview
                          }}
                          className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
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
                          className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
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
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
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
          <Collection items={node.children}>
            {renderTreeItem}
          </Collection>
        )}
      </TreeItem>
    );
  };

  if (data.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <DocumentIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No models found</h3>
        <p className="text-muted-foreground">
          Create your first model to see it here with its associated files.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border border-border shadow-sm overflow-hidden ${className}`}>
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