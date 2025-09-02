import { formatFileSize } from "@/lib/file-processing-service";
import { 
  ArrowDownTrayIcon, 
  PlayIcon, 
  ClockIcon,
  CubeIcon,
  DocumentTextIcon 
} from "@heroicons/react/24/outline";
import { type ReactNode } from "react";
import { Button } from "react-aria-components";
import type { SlicedFile } from "@/lib/types";

interface SlicedFileTileProps {
  slicedFile: SlicedFile;
  onDownload?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  className?: string;
}

export default function SlicedFileTile({
  slicedFile,
  onDownload,
  onDelete,
  showControls = true,
  className = "",
}: SlicedFileTileProps): ReactNode {
  
  // Determine if this is a 3MF file or plain gcode
  const is3MFFile = slicedFile.name.endsWith('.3mf') || slicedFile.name.endsWith('.gcode.3mf');
  
  // Format print time
  const formatPrintTime = (minutes?: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`group bg-card border-border hover:border-primary/50 relative aspect-square overflow-hidden rounded-lg border transition-colors ${className}`}>
      {/* Main Image/Icon Area */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
        {is3MFFile ? (
          // For 3MF files, show a placeholder for now (TODO: show actual extracted image)
          <div className="flex flex-col items-center space-y-2 p-4">
            <CubeIcon className="h-12 w-12 text-green-600" />
            <div className="text-xs font-medium text-green-600 text-center">
              3MF Preview
            </div>
          </div>
        ) : (
          // For plain gcode files, show document icon
          <div className="flex flex-col items-center space-y-2 p-4">
            <DocumentTextIcon className="h-12 w-12 text-blue-600" />
            <div className="text-xs font-medium text-blue-600 text-center">
              G-Code
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute top-2 right-2 flex space-x-1">
            {onDownload && (
              <Button
                className="rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 focus:bg-black/70 focus:ring-2 focus:ring-white/50 focus:outline-none"
                onPress={onDownload}
                aria-label="Download file"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                className="rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-red-500 focus:bg-red-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
                onPress={onDelete}
                aria-label="Delete file"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Ready to Print indicator for 3MF files */}
      {is3MFFile && (
        <div className="absolute top-2 left-2">
          <div className="flex items-center space-x-1 bg-green-600/90 text-white px-2 py-1 rounded-full text-xs font-medium">
            <PlayIcon className="h-3 w-3" />
            <span>Ready</span>
          </div>
        </div>
      )}

      {/* File information overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
        <div className="text-white">
          {/* File name */}
          <div className="font-medium text-sm mb-1 line-clamp-2 leading-tight">
            {slicedFile.name}
          </div>
          
          {/* File details */}
          <div className="space-y-1 text-xs text-white/80">
            {/* File size */}
            <div>{formatFileSize(slicedFile.size)}</div>
            
            {/* Print time */}
            {slicedFile.printTimeMinutes && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>{formatPrintTime(slicedFile.printTimeMinutes)}</span>
              </div>
            )}
            
            {/* Slicer info */}
            {slicedFile.slicerName && (
              <div className="truncate">
                {slicedFile.slicerName}
                {slicedFile.slicerVersion && ` ${slicedFile.slicerVersion}`}
              </div>
            )}
            
            {/* Layer info */}
            {slicedFile.layerCount && (
              <div>
                {slicedFile.layerCount} layers
                {slicedFile.layerHeight && ` • ${slicedFile.layerHeight}mm`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filament indicators */}
      {slicedFile.SlicedFileFilaments && slicedFile.SlicedFileFilaments.length > 0 && (
        <div className="absolute top-2 left-2 right-12 flex space-x-1">
          {slicedFile.SlicedFileFilaments.slice(0, 3).map((filamentData, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ 
                backgroundColor: filamentData.filamentColor || '#666666' 
              }}
              title={`${filamentData.filamentVendor || 'Unknown'} ${filamentData.filamentType || 'filament'}`}
            />
          ))}
          {slicedFile.SlicedFileFilaments.length > 3 && (
            <div className="w-3 h-3 rounded-full bg-white/20 border border-white/50 flex items-center justify-center">
              <span className="text-white text-xs leading-none">+</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}