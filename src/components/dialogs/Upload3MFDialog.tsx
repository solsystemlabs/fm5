import { useModelsTRPC } from "@/lib/trpc-hooks";
import { useUploadSlicedFileWithProgress } from "@/lib/api-hooks";
import { useForm } from "@tanstack/react-form";
import { type ReactNode, useState } from "react";
import {
  Button as AriaButton,
  FileTrigger,
  Form,
  Select,
  SelectValue,
  ListBox,
  ListBoxItem,
  Popover,
  TextField,
  Label,
  Input,
  FieldError,
} from "react-aria-components";
import { z } from "zod";
import FMModal from "../FMModal";
import FMButton from "../ui/FMButton";

type Upload3MFDialogProps = {
  triggerElement: ReactNode;
};

// Form validation schema
const uploadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().min(1, "Model selection is required"),
  file: z.instanceof(File, { message: "File is required" }),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: string;
  timeRemaining?: string;
}

export default function Upload3MFDialog({ triggerElement }: Upload3MFDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { data: models = [], isLoading: modelsLoading } = useModelsTRPC();
  const { uploadWithProgress } = useUploadSlicedFileWithProgress();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      modelId: 0,
      file: undefined as any,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsUploading(true);
        setUploadError(null);
        setUploadProgress({ loaded: 0, total: value.file.size, percentage: 0 });
        
        const formData = new FormData();
        formData.append("file", value.file);
        formData.append("name", value.name);
        formData.append("modelId", value.modelId.toString());

        await uploadWithProgress(formData, (progress) => {
          setUploadProgress(progress);
        });
        
        setUploadProgress(null);
        setIsUploading(false);
        form.reset();
        setSelectedFile(null);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
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
    
    const file = files[0];
    if (!file.name.endsWith('.3mf') && !file.name.endsWith('.gcode.3mf')) {
      alert('Please select a 3MF file (.3mf or .gcode.3mf)');
      return;
    }
    
    setSelectedFile(file);
    form.setFieldValue("file", file);
    
    // Auto-populate name from filename
    if (!form.getFieldValue("name")) {
      const baseName = file.name.replace(/\.(gcode\.)?3mf$/i, '');
      form.setFieldValue("name", baseName);
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

  return (
    <FMModal
      triggerElement={triggerElement}
      title="Upload 3MF File"
      description="Upload and process a 3MF sliced file with automatic metadata extraction"
      primaryAction={{
        label: isUploading ? "Uploading..." : "Upload & Process",
        onPress: () => form.handleSubmit(),
        isDisabled: isUploading || !selectedFile,
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: () => {
          form.reset();
          setSelectedFile(null);
          setUploadError(null);
        },
      }}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* File Upload Area */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">3MF File</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : selectedFile
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-green-600 dark:text-green-400 font-medium">
                  ✓ {selectedFile.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <FileTrigger
                  acceptedFileTypes={[".3mf"]}
                  onSelect={handleFileSelect}
                >
                  <FMButton variant="outline" size="sm">
                    Choose Different File
                  </FMButton>
                </FileTrigger>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl text-muted-foreground">📁</div>
                <div className="space-y-2">
                  <div className="text-foreground font-medium">
                    Drag and drop your 3MF file here
                  </div>
                  <div className="text-sm text-muted-foreground">
                    or click to browse (.3mf, .gcode.3mf)
                  </div>
                </div>
                <FileTrigger
                  acceptedFileTypes={[".3mf"]}
                  onSelect={handleFileSelect}
                >
                  <FMButton variant="outline">
                    Browse Files
                  </FMButton>
                </FileTrigger>
              </div>
            )}
          </div>
          <form.Field name="file">
            {(field) => (
              <FieldError className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            )}
          </form.Field>
        </div>

        {/* Name Field */}
        <form.Field name="name">
          {(field) => (
            <TextField className="space-y-2">
              <Label className="text-sm font-medium text-foreground">File Name</Label>
              <Input
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter a descriptive name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* Model Selection */}
        <form.Field name="modelId">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Associated Model</Label>
              <Select
                selectedKey={field.state.value || null}
                onSelectionChange={(key) => field.handleChange(Number(key))}
                className="w-full"
              >
                <AriaButton className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue className="flex-1 text-left">
                    {field.state.value
                      ? models.find((m) => m.id === field.state.value)?.name || "Select a model"
                      : "Select a model"}
                  </SelectValue>
                  <span className="ml-2">▼</span>
                </AriaButton>
                <Popover className="w-full">
                  <ListBox className="max-h-60 overflow-auto border border-border rounded-md bg-popover shadow-lg">
                    {modelsLoading ? (
                      <ListBoxItem className="px-3 py-2 text-muted-foreground">
                        Loading models...
                      </ListBoxItem>
                    ) : models.length === 0 ? (
                      <ListBoxItem className="px-3 py-2 text-muted-foreground">
                        No models available
                      </ListBoxItem>
                    ) : (
                      models.map((model) => (
                        <ListBoxItem
                          key={model.id}
                          id={model.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer focus:bg-accent focus:outline-none"
                        >
                          {model.name}
                        </ListBoxItem>
                      ))
                    )}
                  </ListBox>
                </Popover>
              </Select>
              <FieldError className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </div>
          )}
        </form.Field>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Uploading file...</span>
              <span className="text-muted-foreground">{uploadProgress.percentage}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {(uploadProgress.loaded / (1024 * 1024)).toFixed(1)} MB of{' '}
                {(uploadProgress.total / (1024 * 1024)).toFixed(1)} MB
              </span>
              {uploadProgress.speed && (
                <span>
                  {uploadProgress.speed}
                  {uploadProgress.timeRemaining && ` • ${uploadProgress.timeRemaining} remaining`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            Upload failed: {uploadError}
          </div>
        )}
      </Form>
    </FMModal>
  );
}