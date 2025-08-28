import FMInput from "@/components/ui/FMInput";
import { useCreateModel, useModelCategories, useCreateModelCategory, useUploadModelFilesWithProgress } from "@/lib/api-hooks";
import { processUploadedFiles, cleanupPreviews, formatFileSize, type ProcessedFiles } from "@/lib/file-processing-service";
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

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: string;
  timeRemaining?: string;
}

export default function AddModelDialog({
  triggerElement,
}: AddModelDialogProps): ReactNode {
  const createModelMutation = useCreateModel();
  const createModelCategoryMutation = useCreateModelCategory();
  const { uploadWithProgress } = useUploadModelFilesWithProgress();
  
  const {
    data: modelCategories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useModelCategories();

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFiles | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

        // If we have files, upload them
        if (selectedFiles.length > 0) {
          setIsUploading(true);
          setUploadError(null);

          const formData = new FormData();
          selectedFiles.forEach((file) => {
            formData.append('files', file);
          });

          try {
            await uploadWithProgress(createdModel.id, formData, (progress) => {
              setUploadProgress(progress);
            });
          } catch (uploadErr) {
            setUploadError(uploadErr instanceof Error ? uploadErr.message : 'Upload failed');
            throw uploadErr;
          } finally {
            setIsUploading(false);
            setUploadProgress(null);
          }
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
    setUploadError(null);
    
    try {
      const processed = await processUploadedFiles(files);
      setProcessedFiles(processed);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process files');
      console.error('Error processing files:', error);
    }
  }, []);

  const handleClearFiles = useCallback(() => {
    if (processedFiles) {
      cleanupPreviews(processedFiles);
    }
    setSelectedFiles([]);
    setProcessedFiles(null);
    setUploadError(null);
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
    if (isUploading) return "Uploading...";
    if (createModelMutation.isPending) return "Creating...";
    if (selectedFiles.length > 0) return "Create Model & Upload Files";
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
        isDisabled: createModelMutation.isPending || isUploading,
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
              onCreateItem={createModelCategoryMutation.mutateAsync}
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
                    {processedFiles.images.length} images, {processedFiles.modelFiles.length} model files
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

          {uploadError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-destructive text-sm">{uploadError}</p>
            </div>
          )}

          {uploadProgress && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Uploading files...</span>
                <span className="text-sm text-muted-foreground">
                  {uploadProgress.percentage}%
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              {uploadProgress.speed && uploadProgress.timeRemaining && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{uploadProgress.speed}</span>
                  <span>{uploadProgress.timeRemaining} remaining</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Form>
    </FMModal>
  );
}
