import type { SlicedFile } from "@/lib/types";
import type { ReactNode } from "react";
import { Cell, ColorSwatch, TableBody } from "react-aria-components";
import { DeleteConfirmDialog } from "../ui/DeleteConfirmDialog";
import { useDeleteSlicedFile } from "@/lib/api-hooks";
import FMCell from "../ui/table/FMCell";
import FMColumn from "../ui/table/FMColumn";
import FMRow from "../ui/table/FMRow";
import FMTable from "../ui/table/FMTable";
import FMTableHeader from "../ui/table/FMTableHeader";
import { calculatePrintCost, formatCost } from "@/lib/cost-estimation";

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatTime(minutes?: number): string {
  if (!minutes) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function formatLength(mm?: number): string {
  if (!mm) return 'N/A';
  
  if (mm >= 1000) {
    return `${(mm / 1000).toFixed(1)}m`;
  }
  return `${mm.toFixed(0)}mm`;
}

function formatWeight(grams?: number): string {
  if (!grams) return 'N/A';
  return `${grams.toFixed(1)}g`;
}

export default function SlicedFilesTable({
  data,
}: {
  data: SlicedFile[];
}): ReactNode {
  const deleteSlicedFile = useDeleteSlicedFile();
  
  return (
    <FMTable>
      <FMTableHeader>
        <FMTableHeader.Row>
          <FMColumn className="rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6">
            File Name
          </FMColumn>
          <FMColumn>Print Time</FMColumn>
          <FMColumn className="hidden lg:table-cell">Layers</FMColumn>
          <FMColumn className="hidden lg:table-cell">Slicer</FMColumn>
          <FMColumn className="hidden xl:table-cell">Filament Usage</FMColumn>
          <FMColumn>Filaments</FMColumn>
          <FMColumn className="hidden lg:table-cell">Est. Cost</FMColumn>
          <FMColumn className="hidden xl:table-cell">File Size</FMColumn>
          <FMColumn className="rounded-tr-lg">Actions</FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((slicedFile) => {
          const costBreakdown = calculatePrintCost(slicedFile);
          
          return (
          <FMRow key={slicedFile.id}>
            <Cell className="relative py-4 pr-3 pl-4 text-sm sm:pl-6">
              <div className="flex flex-col">
                <div className="text-md text-foreground font-bold">
                  {slicedFile.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  {slicedFile.layerHeight && (
                    <span>Layer: {slicedFile.layerHeight}mm</span>
                  )}
                  {slicedFile.nozzleDiameter && (
                    <span className="ml-2">Nozzle: {slicedFile.nozzleDiameter}mm</span>
                  )}
                </div>
              </div>
              {/* Mobile-only details */}
              <div className="text-muted-foreground mt-1 flex flex-col sm:block lg:hidden">
                <span>{formatTime(slicedFile.printTimeMinutes)}</span>
                {slicedFile.layerCount && <span>{slicedFile.layerCount} layers</span>}
              </div>
            </Cell>
            
            <FMCell>
              <div className="flex flex-col">
                <span className="font-medium">{formatTime(slicedFile.printTimeMinutes)}</span>
                {slicedFile.totalTimeMinutes && slicedFile.totalTimeMinutes !== slicedFile.printTimeMinutes && (
                  <span className="text-xs text-muted-foreground">
                    Total: {formatTime(slicedFile.totalTimeMinutes)}
                  </span>
                )}
              </div>
            </FMCell>

            <FMCell className="hidden lg:table-cell">
              {slicedFile.layerCount ? (
                <div className="flex flex-col">
                  <span className="font-medium">{slicedFile.layerCount}</span>
                  {slicedFile.maxZHeight && (
                    <span className="text-xs text-muted-foreground">
                      {slicedFile.maxZHeight}mm high
                    </span>
                  )}
                </div>
              ) : (
                'N/A'
              )}
            </FMCell>

            <FMCell className="hidden lg:table-cell">
              {slicedFile.slicerName ? (
                <div className="flex flex-col">
                  <span className="font-medium">{slicedFile.slicerName}</span>
                  {slicedFile.slicerVersion && (
                    <span className="text-xs text-muted-foreground">
                      v{slicedFile.slicerVersion}
                    </span>
                  )}
                </div>
              ) : (
                'N/A'
              )}
            </FMCell>

            <FMCell className="hidden xl:table-cell">
              <div className="flex flex-col text-xs">
                <span>{formatLength(slicedFile.totalFilamentLength)}</span>
                <span className="text-muted-foreground">
                  {formatWeight(slicedFile.totalFilamentWeight)}
                </span>
              </div>
            </FMCell>

            <FMCell>
              <div className="flex items-center gap-x-1">
                {slicedFile.SlicedFileFilaments && slicedFile.SlicedFileFilaments.length > 0 ? (
                  <>
                    {slicedFile.SlicedFileFilaments.slice(0, 3).map((filament) => (
                      <div key={filament.id} className="flex items-center">
                        {filament.filamentColor && (
                          <ColorSwatch
                            className="h-4 w-4 flex-shrink-0 rounded-sm shadow-sm border border-border/50"
                            color={filament.filamentColor}
                          />
                        )}
                      </div>
                    ))}
                    {slicedFile.SlicedFileFilaments.length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{slicedFile.SlicedFileFilaments.length - 3}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">
                      {slicedFile.SlicedFileFilaments.length} filament{slicedFile.SlicedFileFilaments.length !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No filament data</span>
                )}
              </div>
            </FMCell>

            <FMCell className="hidden lg:table-cell">
              {costBreakdown ? (
                <div className="flex flex-col">
                  <span className="font-medium">{formatCost(costBreakdown.totalCost)}</span>
                  {costBreakdown.materialCost > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Material: {formatCost(costBreakdown.materialCost)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </FMCell>

            <FMCell className="hidden xl:table-cell">
              {formatFileSize(slicedFile.size)}
            </FMCell>

            <FMCell>
              <div className="flex items-center gap-x-2">
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                  onClick={() => {
                    // TODO: Add view details functionality
                    console.log('View details for', slicedFile.name);
                  }}
                >
                  View
                </button>
                <span className="text-muted-foreground">|</span>
                <a
                  href={`/api/sliced-files/${slicedFile.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Download
                </a>
                <span className="text-muted-foreground">|</span>
                <DeleteConfirmDialog
                  title="Delete Sliced File"
                  description="Are you sure you want to delete this sliced file? This action cannot be undone."
                  itemName={slicedFile.name}
                  onConfirm={() => deleteSlicedFile.mutate(slicedFile.id)}
                  isLoading={deleteSlicedFile.isPending}
                  triggerClassName="text-sm font-medium p-0 bg-transparent text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                />
              </div>
            </FMCell>
          </FMRow>
          );
        })}
      </TableBody>
    </FMTable>
  );
}