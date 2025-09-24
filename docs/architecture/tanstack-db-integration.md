# Tanstack DB Integration

## Collection Definitions

````typescript
import { createCollection } from '@tanstack/db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { ModelSchema, FilamentSchema, FilamentInventorySchema } from '@/lib/schemas';

// Models collection with live queries
export const modelsCollection = createCollection({
  id: 'models',
  schema: ModelSchema,
  ...queryCollectionOptions({
    queryClient,
    // Sync with tRPC
    queryFn: () => trpc.models.list.query(),
    onInsert: async ({ transaction }) => {
      const model = transaction.mutations[0].modified;
      await trpc.models.create.mutate(model);
    },
    onUpdate: async ({ transaction }) => {
      const { id, ...updates } = transaction.mutations[0].modified;
      await trpc.models.update.mutate({ id, updates });
    },
    onDelete: async ({ transaction }) => {
      const id = transaction.mutations[0].original.id;
      await trpc.models.delete.mutate({ id });
    },
  }),
});

// Filaments collection with demand tracking
export const filamentsCollection = createCollection({
  id: 'filaments',
  schema: FilamentSchema,
  ...queryCollectionOptions({
    queryClient,
    queryFn: () => trpc.filaments.list.query(),
    onInsert: async ({ transaction }) => {
      const filament = transaction.mutations[0].modified;
      await trpc.filaments.create.mutate(filament);
    },
  }),
});

// Filament inventory collection with reactive updates
export const filamentInventoryCollection = createCollection({
  id: 'filament-inventory',
  schema: FilamentInventorySchema,
  ...queryCollectionOptions({
    queryClient,
    queryFn: () => trpc.filaments.inventory.list.query(),
    onUpdate: async ({ transaction }) => {
      const { id, quantity_grams } = transaction.mutations[0].modified;
      await trpc.filaments.updateQuantity.mutate({
        inventoryId: id,
        operation: 'set',
        quantity: quantity_grams,
      });
    },
  }),
});

## Live Query Usage

```typescript
import { useLiveQuery } from '@tanstack/react-db';
import { eq, gt, and } from '@tanstack/db';

// Live query for low stock filaments
export function useLowStockFilaments() {
  return useLiveQuery((query) =>
    query
      .from({
        filaments: filamentsCollection,
        inventory: filamentInventoryCollection
      })
      .where(({ inventory }) =>
        gt(inventory.lowStockThreshold, inventory.quantityGrams)
      )
      .select({
        filament: ({ filaments }) => filaments,
        inventory: ({ inventory }) => inventory,
        shortage: ({ inventory }) =>
          inventory.lowStockThreshold - inventory.quantityGrams
      })
      .orderBy(({ shortage }) => shortage, 'desc')
  );
}

// Live query for high-demand filaments
export function useHighDemandFilaments() {
  return useLiveQuery((query) =>
    query
      .from({ filaments: filamentsCollection })
      .where(({ filaments }) => gt(filaments.demandCount, 3))
      .orderBy(({ filaments }) => filaments.demandCount, 'desc')
  );
}

// Live query for queue feasibility
export function useQueueFeasibility() {
  return useLiveQuery((query) =>
    query
      .from({
        queue: printQueueCollection,
        variants: modelVariantsCollection,
        requirements: filamentRequirementsCollection,
        inventory: filamentInventoryCollection
      })
      .where(({ queue }) => eq(queue.status, 'queued'))
      .select({
        job: ({ queue }) => queue,
        variant: ({ variants }) => variants,
        feasible: ({ requirements, inventory }) => {
          // Complex feasibility calculation using live data
          // This automatically updates when inventory changes
        }
      })
  );
}

// Optimistic updates with automatic rollback
export function useAddToQueue() {
  return (variantId: string, priority: number = 0) => {
    printQueueCollection.insert({
      id: crypto.randomUUID(),
      variantId,
      status: 'queued',
      priority,
      createdAt: new Date(),
    });

    // tRPC mutation handles server sync and rollback on failure
  };
}
````

## State Management with Collections

```typescript
// Replace traditional useQuery patterns with live collections
export function useModelBrowser() {
  const { data: models } = useLiveQuery((query) =>
    query
      .from({ models: modelsCollection })
      .select({
        id: ({ models }) => models.id,
        name: ({ models }) => models.name,
        designer: ({ models }) => models.designer,
        category: ({ models }) => models.category,
        imageUrls: ({ models }) => models.imageUrls,
        variantCount: ({ models }) => models.variants.length,
      })
      .orderBy(({ models }) => models.updatedAt, 'desc'),
  )

  // Search with live filtering
  const searchModels = (searchTerm: string) => {
    return useLiveQuery((query) =>
      query
        .from({ models: modelsCollection })
        .where(
          ({ models }) =>
            models.name.includes(searchTerm) ||
            models.designer.includes(searchTerm),
        ),
    )
  }

  return { models, searchModels }
}

// Inventory management with live updates
export function useInventoryDashboard() {
  const { data: lowStock } = useLowStockFilaments()
  const { data: highDemand } = useHighDemandFilaments()

  const { data: inventoryStats } = useLiveQuery((query) =>
    query
      .from({
        filaments: filamentsCollection,
        inventory: filamentInventoryCollection,
      })
      .select({
        totalFilaments: ({ filaments }) => filaments.count(),
        totalSpools: ({ inventory }) => inventory.count(),
        totalValue: ({ inventory }) =>
          inventory.sum(inventory.quantityGrams * inventory.actualCostPerGram),
        averageAge: ({ inventory }) =>
          inventory.avg(new Date() - inventory.purchaseDate),
      }),
  )

  return {
    lowStock,
    highDemand,
    inventoryStats,
  }
}
```

# Components Architecture

## Frontend Component Organization

```
src/
├── app/                           # Tanstack Start app directory
│   ├── routes/                    # File-based routing
│   │   ├── __root.tsx            # Root layout
│   │   ├── index.tsx             # Dashboard page
│   │   ├── models/               # Models section
│   │   │   ├── index.tsx         # Models list
│   │   │   ├── $modelId.tsx      # Model details
│   │   │   └── upload.tsx        # File upload
│   │   ├── inventory/            # Inventory section
│   │   ├── queue/                # Print queue
│   │   └── analytics/            # Analytics dashboard
│   └── api/                      # API routes
├── components/                    # Reusable UI components
│   ├── ui/                       # Base UI components (React Aria)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── forms/                    # Form components
│   │   ├── ModelForm.tsx
│   │   ├── VariantForm.tsx
│   │   └── InventoryForm.tsx
│   ├── displays/                 # Display components
│   │   ├── ModelCard.tsx
│   │   ├── VariantCard.tsx
│   │   ├── FilamentCard.tsx
│   │   └── QueueItem.tsx
│   └── layout/                   # Layout components
│       ├── Navigation.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client functions
│   ├── db.ts                     # Database client (Tanstack DB)
│   ├── validation.ts             # Zod schemas
│   ├── metadata-extractor.ts     # Client-side metadata extraction
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
│   ├── useModels.ts              # Model data hooks
│   ├── useInventory.ts           # Inventory hooks
│   ├── useQueue.ts               # Print queue hooks
│   └── useFileUpload.ts          # File upload hooks
└── types/                        # TypeScript type definitions
    ├── models.ts
    ├── inventory.ts
    └── api.ts
```

## Key Component Patterns

```typescript
// Example: ModelCard Component
import { ModelVariant } from '@/types/models';
import { Button } from '@/components/ui';
import { useQueue } from '@/hooks/useQueue';

interface ModelCardProps {
  variant: ModelVariant;
  onEdit?: (variant: ModelVariant) => void;
  className?: string;
}

export function ModelCard({ variant, onEdit, className }: ModelCardProps) {
  const { addToQueue, checkFeasibility } = useQueue();
  const feasible = checkFeasibility(variant.id);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="aspect-square mb-3">
        <img
          src={variant.model.imageUrls[0]}
          alt={variant.name}
          className="w-full h-full object-cover rounded"
        />
      </div>

      <h3 className="font-medium text-slate-900 mb-1">{variant.name}</h3>
      <p className="text-sm text-slate-600 mb-2">{variant.model.designer}</p>

      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span>{variant.printDurationMinutes}min</span>
        <span>{variant.layerHeight}mm</span>
        <span className={feasible ? 'text-green-600' : 'text-orange-600'}>
          {feasible ? 'Ready' : 'Need Materials'}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(variant)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          onClick={() => addToQueue(variant.id)}
          disabled={!feasible}
        >
          Queue
        </Button>
      </div>
    </div>
  );
}
```

## State Management with Tanstack Query

```typescript
// hooks/useModels.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useModels(searchParams: SearchParams = {}) {
  return useQuery({
    queryKey: ['models', searchParams],
    queryFn: () => apiClient.searchModels(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.createModel,
    onSuccess: (newModel) => {
      // Invalidate and refetch models list
      queryClient.invalidateQueries({ queryKey: ['models'] })

      // Optimistically add to cache
      queryClient.setQueryData(['models', newModel.id], newModel)
    },
  })
}

export function useModelDetails(modelId: string) {
  return useQuery({
    queryKey: ['models', modelId],
    queryFn: () => apiClient.getModel(modelId),
    enabled: !!modelId,
  })
}

// Prefetch related data strategy
export function useModelWithVariants(modelId: string) {
  const queryClient = useQueryClient()

  const modelQuery = useModelDetails(modelId)

  // Prefetch variants when model loads
  useEffect(() => {
    if (modelQuery.data?.variants) {
      modelQuery.data.variants.forEach((variant) => {
        queryClient.setQueryData(['variants', variant.id], variant)
      })
    }
  }, [modelQuery.data, queryClient])

  return modelQuery
}
```

# File Processing Architecture

## Client-Side Metadata Extraction

```typescript
// lib/metadata-extractor.ts
interface ExtractedMetadata {
  filaments: Array<{
    type: string
    brand: string
    color: string
    colorHex: string
    amsSlot: number
    usageModel: number
    usageWaste: number
    usagePurge: number
  }>
  nozzleSize: number
  layerHeight: number
  brimWidth: number
  brimType: string
  printTime: {
    totalMinutes: number
    modelTime: number
    supportTime: number
    purgeTime: number
  }
  rawMetadata: Record<string, any>
}

export class BambuStudioExtractor {
  static async extractFromFile(file: File): Promise<ExtractedMetadata> {
    // Only process .3mf and .gcode files
    if (!file.name.endsWith('.3mf') && !file.name.endsWith('.gcode')) {
      throw new Error('Unsupported file format')
    }

    try {
      let metadataContent: string

      if (file.name.endsWith('.3mf')) {
        metadataContent = await this.extractFrom3MF(file)
      } else {
        metadataContent = await this.extractFromGCode(file)
      }

      const rawMetadata = this.parseMetadataContent(metadataContent)
      return this.transformToStructured(rawMetadata)
    } catch (error) {
      console.error('Metadata extraction failed:', error)
      throw new Error('Failed to extract metadata from file')
    }
  }

  private static async extractFrom3MF(file: File): Promise<string> {
    const JSZip = await import('jszip')
    const zip = new JSZip.default()

    const contents = await zip.loadAsync(file)
    const metadataFile = contents.file('metadata/slic3r_pe.config')

    if (!metadataFile) {
      throw new Error('No Bambu Studio metadata found in .3mf file')
    }

    return await metadataFile.async('text')
  }

  private static async extractFromGCode(file: File): Promise<string> {
    const text = await file.text()
    const lines = text.split('\n')

    // Find metadata section in G-code comments
    const metadataLines = lines
      .filter((line) => line.startsWith('; '))
      .map((line) => line.substring(2))

    return metadataLines.join('\n')
  }

  private static parseMetadataContent(content: string): Record<string, any> {
    const metadata: Record<string, any> = {}
    const lines = content.split('\n')

    for (const line of lines) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        metadata[key.trim()] = this.parseValue(value)
      }
    }

    return metadata
  }

  private static parseValue(value: string): any {
    // Parse different value types
    if (value === 'true' || value === 'false') {
      return value === 'true'
    }

    if (!isNaN(Number(value))) {
      return Number(value)
    }

    // Check for arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    return value
  }

  private static transformToStructured(
    raw: Record<string, any>,
  ): ExtractedMetadata {
    // Transform raw metadata into structured format
    // This is where we extract the specific fields we need
    return {
      filaments: this.extractFilamentInfo(raw),
      nozzleSize: raw.nozzle_diameter || 0.4,
      layerHeight: raw.layer_height || 0.2,
      brimWidth: raw.brim_width || 0,
      brimType: raw.brim_type || 'no_brim',
      printTime: this.extractPrintTime(raw),
      rawMetadata: raw,
    }
  }

  private static extractFilamentInfo(raw: Record<string, any>) {
    // Extract filament information from raw metadata
    // Bambu Studio stores this in specific fields
    const filaments = []
    const filamentCount = raw.filament_count || 1

    for (let i = 0; i < filamentCount; i++) {
      filaments.push({
        type: raw[`filament_type_${i}`] || 'PLA',
        brand: raw[`filament_brand_${i}`] || 'Generic',
        color: raw[`filament_colour_${i}`] || 'Unknown',
        colorHex: raw[`filament_colour_hex_${i}`] || '#FFFFFF',
        amsSlot: raw[`filament_ams_slot_${i}`] || i,
        usageModel: raw[`filament_used_model_${i}`] || 0,
        usageWaste: raw[`filament_used_waste_${i}`] || 0,
        usagePurge: raw[`filament_used_purge_${i}`] || 0,
      })
    }

    return filaments
  }

  private static extractPrintTime(raw: Record<string, any>) {
    return {
      totalMinutes: Math.round((raw.estimated_printing_time || 0) / 60),
      modelTime: Math.round((raw.model_printing_time || 0) / 60),
      supportTime: Math.round((raw.support_printing_time || 0) / 60),
      purgeTime: Math.round((raw.purge_printing_time || 0) / 60),
    }
  }

  // Validation and sanitization
  static validateAndSanitize(metadata: ExtractedMetadata): ExtractedMetadata {
    // Basic validation and sanitization
    const sanitized = { ...metadata }

    // Ensure filaments array is valid
    sanitized.filaments = metadata.filaments.filter(
      (f) => f.type && f.brand && f.color,
    )

    // Validate numeric values
    sanitized.nozzleSize = Math.max(0.1, Math.min(2.0, metadata.nozzleSize))
    sanitized.layerHeight = Math.max(0.05, Math.min(1.0, metadata.layerHeight))
    sanitized.brimWidth = Math.max(0, Math.min(50, metadata.brimWidth))

    // Sanitize print time values
    sanitized.printTime = {
      totalMinutes: Math.max(0, metadata.printTime.totalMinutes),
      modelTime: Math.max(0, metadata.printTime.modelTime),
      supportTime: Math.max(0, metadata.printTime.supportTime),
      purgeTime: Math.max(0, metadata.printTime.purgeTime),
    }

    // Sanitize raw metadata (remove potentially dangerous keys)
    const dangerousKeys = ['eval', 'function', 'script', 'onclick']
    sanitized.rawMetadata = Object.fromEntries(
      Object.entries(metadata.rawMetadata).filter(
        ([key]) =>
          !dangerousKeys.some((dangerous) =>
            key.toLowerCase().includes(dangerous),
          ),
      ),
    )

    return sanitized
  }
}
```

## Enhanced File Upload with Retry Logic

```typescript
// hooks/useFileUpload.ts - Updated with retry functionality
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BambuStudioExtractor } from '@/lib/metadata-extractor';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'extracting' | 'uploading' | 'processing' | 'completed' | 'error';
  extractedData?: ExtractedMetadata;
  error?: string;
  retryable?: boolean;
}

interface UploadState {
  originalFile?: File;
  extractedMetadata?: ExtractedMetadata;
  sanitizedMetadata?: ExtractedMetadata;
}

export function useFileUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [uploadStates, setUploadStates] = useState<Map<string, UploadState>>(new Map());

  const uploadFiles = useMutation({
    mutationFn: async (files: FileList) => {
      const results = [];

      for (const file of Array.from(files)) {
        const fileId = crypto.randomUUID();

        try {
          // Step 1: Extract metadata on client
          setUploadProgress(prev => new Map(prev.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 10,
            status: 'extracting'
          })));

          const extractedData = await BambuStudioExtractor.extractFromFile(file);
          const sanitizedData = BambuStudioExtractor.validateAndSanitize(extractedData);

          // Store state for potential retry
          setUploadStates(prev => new Map(prev.set(fileId, {
            originalFile: file,
            extractedMetadata: extractedData,
            sanitizedMetadata: sanitizedData
          })));

          // Step 2: Upload file to Cloudflare R2
          setUploadProgress(prev => new Map(prev.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 30,
            status: 'uploading',
            extractedData: sanitizedData
          })));

          const uploadResponse = await trpc.files.upload.mutate({
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type
          });

          // Upload to R2 using signed URL
          await uploadToR2(uploadResponse.uploadUrl, file, {
            onProgress: (progress) => {
              setUploadProgress(prev => new Map(prev.set(fileId, {
                ...prev.get(fileId)!,
                progress: 30 + (progress * 0.4) // 30-70%
              })));
            }
          });

          // Step 3: Submit to server with extracted metadata
          setUploadProgress(prev => new Map(prev.set(fileId, {
            ...prev.get(fileId)!,
            progress: 80,
            status: 'processing'
          })));

          const result = await trpc.variants.create.mutate({
            modelId: '', // Will be set by user in form
            variantData: {
              name: extractVariantName(file.name),
              slicedFileUrl: uploadResponse.fileUrl,
              layerHeight: sanitizedData.layerHeight,
              nozzleTemperature: sanitizedData.nozzleTemperature,
              bedTemperature: sanitizedData.bedTemperature,
              printDurationMinutes: sanitizedData.printTime.totalMinutes,
              bambuMetadata: sanitizedData.rawMetadata,
            },
            filamentRequirements: sanitizedData.filaments.map(f => ({
              filamentId: '', // Will be matched/created based on specs
              amsSlot: f.amsSlot,
              usageModel: f.usageModel,
              usageWaste: f.usageWaste,
              usagePurge: f.usagePurge,
            }))
          });

          setUploadProgress(prev => new Map(prev.set(fileId, {
            ...prev.get(fileId)!,
            progress: 100,
            status: 'completed'
          })));

          results.push({ fileId, result });

        } catch (error) {
          setUploadProgress(prev => new Map(prev.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error.message,
            retryable: true, // Most errors are retryable
            extractedData: uploadStates.get(fileId)?.sanitizedMetadata
          })));

          results.push({ fileId, error });
        }
      }

      return results;
    },
    onSuccess: () => {
      // Invalidate relevant collections
      modelsCollection.invalidate();
      filamentsCollection.invalidate();
    }
  });

  // Retry upload with preserved metadata
  const retryUpload = useMutation({
    mutationFn: async (fileId: string) => {
      const state = uploadStates.get(fileId);
      const progress = uploadProgress.get(fileId);

      if (!state || !progress) {
        throw new Error('Upload state not found');
      }

      try {
        // Reset progress but keep extracted data
        setUploadProgress(prev => new Map(prev.set(fileId, {
          ...progress,
          progress: 30,
          status: 'uploading',
          error: undefined
        })));

        // Use preserved metadata and file
        const uploadResponse = await trpc.files.retry.mutate({
          jobId: fileId, // Reuse original job ID
          preserveMetadata: true
        });

        if (state.originalFile) {
          await uploadToR2(uploadResponse.uploadUrl, state.originalFile, {
            onProgress: (progress) => {
              setUploadProgress(prev => new Map(prev.set(fileId, {
                ...prev.get(fileId)!,
                progress: 30 + (progress * 0.7) // 30-100%
              })));
            }
          });
        }

        setUploadProgress(prev => new Map(prev.set(fileId, {
          ...prev.get(fileId)!,
          progress: 100,
          status: 'completed',
          error: undefined
        })));

        return { fileId, success: true };

      } catch (error) {
        setUploadProgress(prev => new Map(prev.set(fileId, {
          ...prev.get(fileId)!,
          status: 'error',
          error: error.message,
          retryable: true
        })));

        throw error;
      }
    }
  });

  const clearUpload = (fileId: string) => {
    setUploadProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    setUploadStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return {
    uploadFiles: uploadFiles.mutate,
    retryUpload: retryUpload.mutate,
    isUploading: uploadFiles.isPending,
    uploadProgress: Array.from(uploadProgress.values()),
    clearUpload,
    clearAllUploads: () => {
      setUploadProgress(new Map());
      setUploadStates(new Map());
    }
  };
}

// Component usage with retry functionality
export function FileUploadProgress({ uploads, onRetry, onClear }) {
  return (
    <div className="space-y-3">
      {uploads.map(upload => (
        <div key={upload.fileId} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{upload.fileName}</span>
            {upload.status === 'error' && upload.retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(upload.fileId)}
              >
                Retry Upload
              </Button>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                upload.status === 'error' ? 'bg-red-500' :
                upload.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={`capitalize ${
              upload.status === 'error' ? 'text-red-600' :
              upload.status === 'completed' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {upload.status === 'error' ? upload.error : upload.status}
            </span>

            {upload.extractedData && (
              <span className="text-gray-600">
                Metadata: {upload.extractedData.filaments.length} filaments,
                {upload.extractedData.printTime.totalMinutes}min
              </span>
            )}
          </div>

          {upload.status === 'completed' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onClear(upload.fileId)}
              className="mt-2"
            >
              Clear
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Updated Docker Configuration

```yaml

```
