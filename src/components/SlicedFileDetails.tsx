import type { SlicedFile } from "@/lib/types";
import { ColorSwatch } from "react-aria-components";

interface SlicedFileDetailsProps {
  slicedFile: SlicedFile;
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

function formatVolume(cm3?: number): string {
  if (!cm3) return 'N/A';
  return `${cm3.toFixed(1)}cm³`;
}

export default function SlicedFileDetails({ slicedFile }: SlicedFileDetailsProps) {
  const hasBasicInfo = slicedFile.printTimeMinutes || slicedFile.layerCount || slicedFile.layerHeight;
  const hasSlicerInfo = slicedFile.slicerName || slicedFile.slicerVersion;
  const hasPrinterSettings = slicedFile.nozzleDiameter || slicedFile.bedType;
  const hasFilamentTotals = slicedFile.totalFilamentLength || slicedFile.totalFilamentWeight;

  return (
    <div className="space-y-6">
      {/* File Info Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-foreground">{slicedFile.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Created: {new Date(slicedFile.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Print Information */}
        {hasBasicInfo && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Print Details</h3>
            <div className="bg-card rounded-lg p-4 space-y-2">
              {slicedFile.printTimeMinutes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Print Time:</span>
                  <span className="font-medium">{formatTime(slicedFile.printTimeMinutes)}</span>
                </div>
              )}
              {slicedFile.totalTimeMinutes && slicedFile.totalTimeMinutes !== slicedFile.printTimeMinutes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-medium">{formatTime(slicedFile.totalTimeMinutes)}</span>
                </div>
              )}
              {slicedFile.layerCount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layers:</span>
                  <span className="font-medium">{slicedFile.layerCount}</span>
                </div>
              )}
              {slicedFile.layerHeight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layer Height:</span>
                  <span className="font-medium">{slicedFile.layerHeight}mm</span>
                </div>
              )}
              {slicedFile.maxZHeight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Height:</span>
                  <span className="font-medium">{slicedFile.maxZHeight}mm</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slicer & Printer Info */}
        {(hasSlicerInfo || hasPrinterSettings) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Equipment</h3>
            <div className="bg-card rounded-lg p-4 space-y-2">
              {slicedFile.slicerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slicer:</span>
                  <span className="font-medium">
                    {slicedFile.slicerName}
                    {slicedFile.slicerVersion && ` v${slicedFile.slicerVersion}`}
                  </span>
                </div>
              )}
              {slicedFile.nozzleDiameter && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nozzle:</span>
                  <span className="font-medium">{slicedFile.nozzleDiameter}mm</span>
                </div>
              )}
              {slicedFile.bedType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bed Type:</span>
                  <span className="font-medium">{slicedFile.bedType}</span>
                </div>
              )}
              {slicedFile.bedTemperature && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bed Temp:</span>
                  <span className="font-medium">{slicedFile.bedTemperature}°C</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filament Totals */}
        {hasFilamentTotals && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Material Usage</h3>
            <div className="bg-card rounded-lg p-4 space-y-2">
              {slicedFile.totalFilamentLength && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Length:</span>
                  <span className="font-medium">{formatLength(slicedFile.totalFilamentLength)}</span>
                </div>
              )}
              {slicedFile.totalFilamentVolume && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Volume:</span>
                  <span className="font-medium">{formatVolume(slicedFile.totalFilamentVolume)}</span>
                </div>
              )}
              {slicedFile.totalFilamentWeight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <span className="font-medium">{formatWeight(slicedFile.totalFilamentWeight)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">File Info</h3>
          <div className="bg-card rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">
                {(slicedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model ID:</span>
              <span className="font-medium">{slicedFile.ThreeMFFile.modelId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Download:</span>
              <a
                href={slicedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm font-medium underline"
              >
                Open File
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filament Breakdown */}
      {slicedFile.SlicedFileFilaments && slicedFile.SlicedFileFilaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Filament Breakdown ({slicedFile.SlicedFileFilaments.length} filaments)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slicedFile.SlicedFileFilaments.map((filament) => (
              <div key={filament.id} className="bg-card rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-x-3">
                  {filament.filamentColor && (
                    <ColorSwatch
                      className="h-6 w-6 flex-shrink-0 rounded-sm shadow-sm border border-border/50"
                      color={filament.filamentColor}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      Filament {filament.filamentIndex + 1}
                    </div>
                    {filament.filamentType && (
                      <div className="text-xs text-muted-foreground">
                        {filament.filamentType}
                        {filament.filamentVendor && ` - ${filament.filamentVendor}`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {filament.lengthUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Length:</span>
                      <span>{formatLength(filament.lengthUsed)}</span>
                    </div>
                  )}
                  {filament.weightUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{formatWeight(filament.weightUsed)}</span>
                    </div>
                  )}
                  {filament.volumeUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume:</span>
                      <span>{formatVolume(filament.volumeUsed)}</span>
                    </div>
                  )}
                  {filament.density && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Density:</span>
                      <span>{filament.density}g/cm³</span>
                    </div>
                  )}
                  {filament.diameter && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diameter:</span>
                      <span>{filament.diameter}mm</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}