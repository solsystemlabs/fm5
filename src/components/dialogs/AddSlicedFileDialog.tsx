import { useUploadSlicedFileWithProgress } from "@/lib/api-hooks";
import { useModelFilesByModelTRPC } from "@/lib/trpc-hooks";
import { useForm } from "@tanstack/react-form";
import clsx from "clsx";
import { type ReactNode, useState } from "react";
import {
  Button,
  Dialog,
  FieldError,
  FileTrigger,
  Form,
  Heading,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
  Popover,
  Select,
  SelectValue,
  TextField,
} from "react-aria-components";
import { z } from "zod";
import FMButton from "../ui/FMButton";
import { XMarkIcon, DocumentIcon, CubeIcon } from "@heroicons/react/24/outline";

type AddSlicedFileDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  modelId: number;
  preSelectedThreeMFFileId?: number; // Pre-select a specific file if coming from file row
  onSuccess?: () => void;
};

// Form validation schema
const uploadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  files: z.array(z.instanceof(File, { message: "File is required" })).min(1, "At least one file is required"),
  threeMFFileId: z.number().min(1, "Please select a model file to attach this sliced file to"),
});

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: string;
  timeRemaining?: string;
}

export default function AddSlicedFileDialog({
  isOpen,
  onOpenChange,
  modelId,
  preSelectedThreeMFFileId,
  onSuccess,
}: AddSlicedFileDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const { uploadWithProgress } = useUploadSlicedFileWithProgress();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch available model files for this model (both .stl and .3mf files)
  const { data: modelFilesData, isLoading: modelFilesLoading } = useModelFilesByModelTRPC(modelId);
  
  // Combine both model files and threeMF files into a single list for selection
  const modelFiles = [
    ...(modelFilesData?.modelFiles || []).map(file => ({ ...file, fileType: 'modelFile' as const })),
    ...(modelFilesData?.threeMFFiles || []).map(file => ({ ...file, fileType: 'threeMFFile' as const }))
  ];

  const form = useForm({
    defaultValues: {
      name: "",
      files: [] as File[],
      threeMFFileId: preSelectedThreeMFFileId || 0,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsUploading(true);
        setUploadError(null);
        setCurrentFileIndex(0);

        // Upload files sequentially
        for (let i = 0; i < value.files.length; i++) {
          const file = value.files[i];
          setCurrentFileIndex(i);
          setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

          const formData = new FormData();
          formData.append("file", file);
          
          // Use the provided name or derive from filename
          const fileName = value.name || file.name.replace(/\.(gcode\.)?3mf$/i, "").replace(/\.gcode$/i, "");
          const finalName = value.files.length > 1 ? `${fileName} (${i + 1})` : fileName;
          
          formData.append("name", finalName);
          formData.append("modelId", modelId.toString());
          formData.append("threeMFFileId", value.threeMFFileId.toString());

          await uploadWithProgress(formData, (progress) => {
            setUploadProgress({
              ...progress,
              // Adjust progress to account for multiple files
              percentage: Math.round(((i + progress.percentage / 100) / value.files.length) * 100),
            });
          });
        }

        setUploadProgress(null);
        setIsUploading(false);
        form.reset();
        setSelectedFiles([]);
        onSuccess?.();
        onOpenChange(false);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError(
          error instanceof Error ? error.message : "Upload failed",
        );
        setUploadProgress(null);
        setIsUploading(false);
      }
    },
    validators: {
      onChange: uploadFormSchema,
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach(file => {
      if (file.name.endsWith(".gcode") || file.name.endsWith(".3mf") || file.name.endsWith(".gcode.3mf")) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Invalid file types: ${invalidFiles.join(", ")}. Please select .gcode, .3mf, or .gcode.3mf files.`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      form.setFieldValue("files", validFiles);

      // Auto-populate name from first filename if empty
      if (!form.getFieldValue("name") && validFiles.length === 1) {
        const baseName = validFiles[0].name
          .replace(/\.(gcode\.)?3mf$/i, "")
          .replace(/\.gcode$/i, "");
        form.setFieldValue("name", baseName);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    form.setFieldValue("files", newFiles);
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isUploading}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm transition-opacity"
    >
      <Modal className="bg-card border-border relative transform overflow-hidden rounded-lg border px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <Dialog className="bg-card text-card-foreground outline-hidden">
          {({ close }) => (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Heading className="text-foreground text-lg font-semibold">
                    Add Sliced Files
                  </Heading>
                  <p className="text-muted-foreground text-sm mt-1">
                    Upload .gcode or .gcode.3mf files to this model
                  </p>
                </div>
                <Button
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                  onPress={close}
                  isDisabled={isUploading}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* File Upload Area */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Sliced Files
          </Label>
          <div
            className={clsx(
              "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              {
                "border-primary bg-primary/5": isDragOver,
                "border-green-500 bg-green-50 dark:bg-green-950/20": selectedFiles.length > 0,
                "border-muted-foreground/25 hover:border-muted-foreground/50": selectedFiles.length === 0,
              }
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="font-medium text-green-600 dark:text-green-400">
                  ✓ {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                </div>
                
                {/* File List */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                      <div className="text-left min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{file.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive ml-2 px-1"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="text-muted-foreground text-sm">
                  Total: {(totalSize / (1024 * 1024)).toFixed(2)} MB
                </div>
                
                <FileTrigger
                  acceptedFileTypes={[".gcode", ".3mf"]}
                  allowsMultiple
                  onSelect={handleFileSelect}
                >
                  <FMButton variant="outline" size="sm">
                    Add More Files
                  </FMButton>
                </FileTrigger>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-muted-foreground text-4xl">🗂️</div>
                <div className="space-y-2">
                  <div className="text-foreground font-medium">
                    Drag and drop your sliced files here
                  </div>
                  <div className="text-muted-foreground text-sm">
                    or click to browse (.gcode, .3mf, .gcode.3mf)
                  </div>
                </div>
                <FileTrigger
                  acceptedFileTypes={[".gcode", ".3mf"]}
                  allowsMultiple
                  onSelect={handleFileSelect}
                >
                  <FMButton variant="outline">Browse Files</FMButton>
                </FileTrigger>
              </div>
            )}
          </div>
          <form.Field name="files">
            {(field) => (
              <FieldError className="text-destructive text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            )}
          </form.Field>
        </div>

        {/* Name Field */}
        <form.Field name="name">
          {(field) => (
            <TextField className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Name {selectedFiles.length > 1 && "(optional - will be auto-numbered)"}
              </Label>
              <Input
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                placeholder={selectedFiles.length > 1 ? "Base name for files (optional)" : "Enter a descriptive name"}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError className="text-destructive text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* ThreeMF File Selection */}
        <form.Field name="threeMFFileId">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Attach to Model File *
              </Label>
              {modelFilesLoading ? (
                <div className="border-input bg-muted animate-pulse h-10 rounded-md"></div>
              ) : modelFiles.length === 0 ? (
                <div className="border-border bg-muted/50 rounded-md p-3 text-sm">
                  <p className="text-muted-foreground">
                    No model files found. Please upload a .stl or .3mf file first.
                  </p>
                </div>
              ) : (
                <Select
                  selectedKey={field.state.value || null}
                  onSelectionChange={(key) => field.handleChange(Number(key))}
                  className="flex w-full"
                  isDisabled={modelFilesLoading}
                >
                  <Button className="border-input bg-background text-foreground focus:ring-primary flex w-full items-center justify-between rounded-md border px-3 py-2 hover:bg-muted focus:ring-2 focus:outline-none">
                    <SelectValue className="flex-1 text-left flex items-center space-x-2">
                      {field.state.value
                        ? (() => {
                            const selectedFile = modelFiles.find((f) => f.id === field.state.value);
                            return selectedFile ? (
                              <>
                                {selectedFile.name.endsWith('.3mf') ? (
                                  <CubeIcon className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <DocumentIcon className="h-4 w-4 text-gray-600" />
                                )}
                                <span>{selectedFile.name}</span>
                              </>
                            ) : "Select a model file";
                          })()
                        : "Select a model file"}
                    </SelectValue>
                    <span className="ml-2">▼</span>
                  </Button>
                  <Popover className="w-full max-w-80">
                    <ListBox className="border-border bg-popover max-h-60 overflow-auto rounded-md border shadow-lg">
                      {modelFiles.map((file) => (
                        <ListBoxItem
                          key={file.id}
                          id={file.id}
                          className="hover:bg-accent focus:bg-accent cursor-pointer px-3 py-2 focus:outline-none flex items-center space-x-2"
                        >
                          {file.name.endsWith('.3mf') ? (
                            <CubeIcon className="h-4 w-4 text-blue-600" />
                          ) : (
                            <DocumentIcon className="h-4 w-4 text-gray-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                          </div>
                        </ListBoxItem>
                      ))}
                    </ListBox>
                  </Popover>
                </Select>
              )}
              <FieldError className="text-destructive text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
              <p className="text-muted-foreground text-xs">
                This sliced file will be associated with the selected model file.
              </p>
            </div>
          )}
        </form.Field>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Uploading file {currentFileIndex + 1} of {selectedFiles.length}...
              </span>
              <span className="text-muted-foreground">
                {uploadProgress.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="bg-muted h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>

            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                {(uploadProgress.loaded / (1024 * 1024)).toFixed(1)} MB of{" "}
                {(uploadProgress.total / (1024 * 1024)).toFixed(1)} MB
              </span>
              {uploadProgress.speed && (
                <span>
                  {uploadProgress.speed}
                  {uploadProgress.timeRemaining &&
                    ` • ${uploadProgress.timeRemaining} remaining`}
                </span>
              )}
            </div>
            
            {selectedFiles.length > 1 && (
              <div className="text-muted-foreground text-xs">
                Current file: {selectedFiles[currentFileIndex]?.name}
              </div>
            )}
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm">
            Upload failed: {uploadError}
          </div>
        )}
      </Form>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button
          className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors focus:ring-2 focus:ring-primary/20 focus:outline-none"
          onPress={() => {
            form.reset();
            setSelectedFiles([]);
            setUploadError(null);
            close();
          }}
          isDisabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          onPress={() => form.handleSubmit()}
          isDisabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? `Uploading ${currentFileIndex + 1}/${selectedFiles.length}...` : "Upload Files"}
        </Button>
      </div>
      </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}