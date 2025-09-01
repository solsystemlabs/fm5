import FMInput from "@/components/ui/FMInput";
import { useCreateModelTRPC, useModelCategoriesTRPC, useCreateModelCategoryTRPC } from "@/lib/trpc-hooks";
import { processUploadedFiles, cleanupPreviews, formatFileSize, type ProcessedFiles, type ExtractionProgress } from "@/lib/file-processing-service";
import { useBackgroundUpload } from "@/lib/background-upload-context";
import { toastService } from "@/components/ui/ToastProvider";
import { useForm } from "@tanstack/react-form";
import { type ReactNode, useState, useCallback } from "react";
import {
  FieldError,
  Form,
  TextField,
  DropZone,
  FileTrigger,
  Button,
  Text,
  ListBox,
  ListBoxItem,
  ProgressBar,
  Label,
} from "react-aria-components";
import { z } from "zod";
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import FilamentSelect from "../dropdowns/FilamentSelect";
import FMModal from "../FMModal";
import FMFormLabel from "../ui/FMFormLabel";
import CreatableSelect from "../ui/CreatableSelect";

type AddModelDialogProps = {
  triggerElement: ReactNode;
};

// Form validation schema - matches API schema
const modelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelCategoryId: z.number().min(1, "Category is required"),
  filamentIds: z.array(z.number()).optional(),
});

type ModelFormData = z.infer<typeof modelFormSchema>;

export default function AddModelDialog({
  triggerElement,
}: AddModelDialogProps): ReactNode {
  const createModelMutation = useCreateModelTRPC();
  const createModelCategoryMutation = useCreateModelCategoryTRPC();
  const { queueUpload } = useBackgroundUpload();
  
  const {
    data: modelCategories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useModelCategoriesTRPC();

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFiles | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      modelCategoryId: 0,
      filamentIds: [],
    } as ModelFormData,
    onSubmit: async ({ value }) => {
      try {
        // Create the model first
        const createdModel = await createModelMutation.mutateAsync(value);

        if (!createdModel) {
          throw new Error("Failed to create model");
        }

        // If we have processed files, queue them for background upload
        if (processedFiles && (processedFiles.images.length > 0 || processedFiles.modelFiles.length > 0 || processedFiles.threeMFFiles.length > 0)) {
          // Convert processed files back to File objects for upload
          const filesToUpload = [
            ...processedFiles.images.map(img => img.file),
            ...processedFiles.modelFiles.map(model => model.file),
            ...processedFiles.threeMFFiles.map(threeMF => threeMF.file)
          ];
          
          const taskId = queueUpload(createdModel.id, createdModel.name, filesToUpload);
          
          // Show toast notification for the background upload
          const task = {
            id: taskId,
            modelId: createdModel.id,
            modelName: createdModel.name,
            files: filesToUpload,
            status: 'pending' as const,
            uploadedCount: 0,
            failedCount: 0,
            totalCount: filesToUpload.length
          };
          
          toastService.showUploadProgress(task);
        }

        // Reset form and file state
        form.reset();
        handleClearFiles();
      } catch (error: any) {
        console.error("Error adding model:", error);
        alert(`Error: ${error.message || "Failed to add model"}`);
      }
    },
  });

  // File handling functions
  const handleFilesSelected = useCallback(async (files: File[]) => {
    setSelectedFiles(files);
    setProcessingError(null);
    setIsProcessing(true);
    setExtractionProgress(null);
    
    try {
      const processed = await processUploadedFiles(files, (progress) => {
        setExtractionProgress(progress);
      });
      setProcessedFiles(processed);
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'Failed to process files');
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
      setExtractionProgress(null);
    }
  }, []);

  const handleClearFiles = useCallback(() => {
    if (processedFiles) {
      cleanupPreviews(processedFiles);
    }
    setSelectedFiles([]);
    setProcessedFiles(null);
    setProcessingError(null);
    setExtractionProgress(null);
    setIsProcessing(false);
  }, [processedFiles]);

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(f => f !== fileToRemove);
    setSelectedFiles(updatedFiles);
    
    if (updatedFiles.length === 0) {
      handleClearFiles();
    } else {
      // Re-process remaining files
      handleFilesSelected(updatedFiles);
    }
  }, [selectedFiles, handleFilesSelected, handleClearFiles]);

  // Determine primary action label based on state
  const getPrimaryActionLabel = () => {
    if (isProcessing) return "Processing files...";
    if (createModelMutation.isPending) return "Creating...";
    if (selectedFiles.length > 0) return "Create Model & Queue Upload";
    return "Add Model";
  };

  return (
    <FMModal
      triggerElement={triggerElement}
      title="Add Model"
      description="Create a new 3D model entry for your inventory."
      primaryAction={{
        label: getPrimaryActionLabel(),
        onPress: () => form.handleSubmit(),
        isDisabled: createModelMutation.isPending || isProcessing,
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: () => {
          form.reset();
          handleClearFiles();
        },
      }}
    >
      <Form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {createModelMutation.error && (
          <div className="bg-destructive/10 rounded-md p-4">
            <div className="text-destructive text-sm">
              Error: {createModelMutation.error.message}
            </div>
          </div>
        )}
        {categoriesError && (
          <div className="bg-accent/20 rounded-md p-4">
            <div className="text-accent-foreground text-sm">
              Warning: Unable to load categories. {categoriesError.message}
            </div>
          </div>
        )}

        {/* Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.length < 1) {
                return "Name is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              isRequired
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              isInvalid={field.state.meta.errors.length > 0}
            >
              <FMFormLabel>Name *</FMFormLabel>
              <FMInput placeholder="e.g., Miniature Dragon" className="mt-1" />
              <FieldError className="text-destructive mt-1 text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* Category Field */}
        <form.Field
          name="modelCategoryId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0) {
                return "Category is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <CreatableSelect
              items={modelCategories}
              isLoading={categoriesLoading}
              selectedKey={field.state.value}
              onSelectionChange={(key) => field.handleChange(key as number)}
              onCreateItem={(name) => createModelCategoryMutation.mutateAsync({ name })}
              isCreating={createModelCategoryMutation.isPending}
              placeholder="Select a category"
              label="Category"
              isRequired={true}
              isInvalid={field.state.meta.errors.length > 0}
              createLabel="Create new category"
            >
              {field.state.meta.errors.length > 0 && (
                <div className="text-destructive mt-1 text-sm">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </CreatableSelect>
          )}
        </form.Field>

        {/* Filaments Field */}
        <form.Field name="filamentIds">
          {(field) => (
            <div>
              <FilamentSelect
                label="Available Filaments"
                selectedFilamentIds={field.state.value || []}
                onSelectionChange={(filamentIds) =>
                  field.handleChange(filamentIds)
                }
              />
              {field.state.meta.errors.length > 0 && (
                <div className="text-destructive mt-1 text-sm">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* File Upload Section */}
        <div className="space-y-3">
          <FMFormLabel>Files (Optional)</FMFormLabel>
          <p className="text-muted-foreground text-sm">
            Upload ZIP archives, 3MF files, STL files, and images for this model.
          </p>

          {selectedFiles.length === 0 ? (
            <DropZone
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors data-[drop-target]:border-primary data-[drop-target]:bg-primary/5"
              onDrop={(e) => {
                const files = e.items
                  .filter((item) => item.kind === 'file')
                  .map((item: any) => item.getFile());
                Promise.all(files).then(handleFilesSelected);
              }}
              getDropOperation={(types) => 
                types.has('application/zip') || 
                types.has('application/vnd.ms-3mfdocument') ||
                types.has('model/stl') ||
                types.has('image/png') || 
                types.has('image/jpeg') ? 'copy' : 'cancel'
              }
            >
              <div className="flex flex-col items-center space-y-2">
                <CloudArrowUpIcon className="h-10 w-10 text-gray-400" />
                <Text slot="label" className="text-base font-medium">
                  Drop files here or click to select
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Supports ZIP, 3MF, STL, PNG, JPG files
                </Text>
              </div>
              
              <FileTrigger
                acceptedFileTypes={['.zip', '.3mf', '.stl', '.gcode.3mf', 'image/*']}
                allowsMultiple
                onSelect={(e) => {
                  if (e) {
                    const filesArray = Array.from(e);
                    handleFilesSelected(filesArray);
                  }
                }}
              >
                <Button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Select Files
                </Button>
              </FileTrigger>
            </DropZone>
          ) : (
            <div className="space-y-3">
              {/* File Summary */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Selected Files</h4>
                  <button
                    type="button"
                    onClick={handleClearFiles}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Clear All
                  </button>
                </div>
                {processedFiles && (
                  <div className="text-sm text-muted-foreground">
                    {processedFiles.images.length} images, {processedFiles.modelFiles.length} model files, {processedFiles.threeMFFiles.length} 3MF files
                    {processedFiles.totalSize > 0 && (
                      <span> • {formatFileSize(processedFiles.totalSize)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* File List */}
              <div className="max-h-48 overflow-y-auto">
                <ListBox 
                  aria-label="Selected files"
                  className="space-y-2"
                  items={selectedFiles.map((file, index) => ({ 
                    id: `${file.name}-${file.size}-${index}`, 
                    file, 
                    index 
                  }))}
                >
                  {({ id, file, index }) => (
                    <ListBoxItem
                      key={id}
                      id={id}
                      textValue={file.name}
                      className="flex items-center justify-between p-2 bg-background border border-border rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center space-x-3">
                        {file.type.startsWith('image/') ? (
                          <PhotoIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <DocumentIcon className="h-5 w-5 text-gray-500" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </ListBoxItem>
                  )}
                </ListBox>
              </div>

              {/* Add more files */}
              <FileTrigger
                acceptedFileTypes={['.zip', '.3mf', '.stl', '.gcode.3mf', 'image/*']}
                allowsMultiple
                onSelect={(e) => {
                  if (e) {
                    const filesArray = Array.from(e);
                    const allFiles = [...selectedFiles, ...filesArray];
                    handleFilesSelected(allFiles);
                  }
                }}
              >
                <Button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Add More Files
                </Button>
              </FileTrigger>
            </div>
          )}

          {processingError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-destructive text-sm">{processingError}</p>
            </div>
          )}

          {extractionProgress && (
            <div className="bg-muted rounded-lg p-4">
              <ProgressBar 
                value={extractionProgress.percentage} 
                maxValue={100}
                className="w-full"
              >
                {({ percentage, valueText }) => (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">
                        {extractionProgress.currentFile ? 'Extracting files...' : 'Processing files...'}
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {valueText}
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {extractionProgress.currentFile && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Processing: {extractionProgress.currentFile}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {extractionProgress.extractedCount} of {extractionProgress.totalCount} files processed
                    </div>
                  </div>
                )}
              </ProgressBar>
            </div>
          )}
        </div>
      </Form>
    </FMModal>
  );
}
