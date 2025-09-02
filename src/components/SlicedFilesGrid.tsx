import { type ReactNode } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";
import type { SlicedFile } from "@/lib/types";
import SlicedFileTile from "./SlicedFileTile";
import { PlayIcon, PlusIcon } from "@heroicons/react/24/outline";
import FMButton from "./ui/FMButton";

interface SlicedFilesGridProps {
  slicedFiles: SlicedFile[];
  onDownload?: (slicedFile: SlicedFile) => void;
  onDelete?: (slicedFile: SlicedFile) => void;
  onUpload?: () => void;
  isLoading?: boolean;
  className?: string;
  showControls?: boolean;
  gridCols?: 2 | 3 | 4 | 5;
}

export default function SlicedFilesGrid({
  slicedFiles,
  onDownload,
  onDelete,
  onUpload,
  isLoading = false,
  className = "",
  showControls = true,
  gridCols = 4,
}: SlicedFilesGridProps): ReactNode {
  // Grid column classes for responsive design
  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  }[gridCols];

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlayIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-foreground text-lg font-semibold">
              Sliced Files
            </h3>
            <div className="bg-muted h-5 w-8 animate-pulse rounded"></div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className={`grid ${gridColsClass} gap-4`}>
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-muted aspect-square animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (slicedFiles.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlayIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-foreground text-lg font-semibold">
              Sliced Files
            </h3>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
              0
            </span>
          </div>
          {onUpload && (
            <FMButton
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
              onPress={onUpload}
            >
              <PlusIcon className="h-4 w-4" />
              Add Files
            </FMButton>
          )}
        </div>

        {/* Empty state */}
        <div className="bg-card border-border rounded-lg border p-12 text-center">
          <div className="space-y-4">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <PlayIcon className="text-muted-foreground h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-foreground text-lg font-semibold">
                No sliced files yet
              </h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                Upload .gcode or .gcode.3mf files to get started with 3D
                printing this model.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PlayIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-foreground text-lg font-semibold">
            Ready to Print
          </h3>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {slicedFiles.length}
          </span>
        </div>
        {onUpload && showControls && (
          <FMButton variant="outline" size="sm" onPress={onUpload}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Files
          </FMButton>
        )}
      </div>

      {/* Files Grid */}
      <ListBox
        aria-label="Sliced files"
        className={`grid ${gridColsClass} gap-4`}
        items={slicedFiles.map((file, index) => ({
          ...file,
          index,
          id: file.id || `sliced-file-${index}`,
        }))}
      >
        {(item) => (
          <ListBoxItem
            key={item.id}
            textValue={item.name}
            className="focus:ring-primary/20 rounded-lg focus:ring-2 focus:outline-none"
          >
            <SlicedFileTile
              slicedFile={item}
              onDownload={() => onDownload?.(item)}
              onDelete={() => onDelete?.(item)}
              showControls={showControls}
            />
          </ListBoxItem>
        )}
      </ListBox>

      {/* Summary info */}
      {slicedFiles.length > 0 && (
        <div className="text-muted-foreground space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span>
              {slicedFiles.length} sliced file
              {slicedFiles.length > 1 ? "s" : ""}
            </span>
            <span>
              Total:{" "}
              {(
                slicedFiles.reduce((sum, file) => sum + file.size, 0) /
                (1024 * 1024)
              ).toFixed(1)}{" "}
              MB
            </span>
          </div>

          {/* Print time summary */}
          {slicedFiles.some((file) => file.printTimeMinutes) && (
            <div className="flex items-center justify-between">
              <span>Print times available</span>
              <span>
                {slicedFiles.filter((file) => file.printTimeMinutes).length} of{" "}
                {slicedFiles.length} files
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

