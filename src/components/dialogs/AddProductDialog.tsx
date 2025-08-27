import FMInput from "@/components/ui/FMInput";
import { useCreateProduct, useModels, useSlicedFiles } from "@/lib/api-hooks";
import { useForm } from "@tanstack/react-form";
import { type ReactNode } from "react";
import {
  Button,
  FieldError,
  Form,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField,
} from "react-aria-components";
import { z } from "zod";
import FilamentSelect from "../dropdowns/FilamentSelect";
import FMModal from "../FMModal";
import FMFormLabel from "../ui/FMFormLabel";

type AddProductDialogProps = {
  triggerElement: ReactNode;
};

// Form validation schema - matches API schema
const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  modelId: z.number().min(1, "Model is required"),
  filamentIds: z.array(z.number()).optional(),
  price: z.number().positive("Price must be positive").optional(),
  slicedFileId: z.number().min(1, "Sliced file is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function AddProductDialog({
  triggerElement,
}: AddProductDialogProps): ReactNode {
  const createProductMutation = useCreateProduct();
  const {
    data: models = [],
    isLoading: modelsLoading,
    error: modelsError,
  } = useModels();
  const {
    data: slicedFiles = [],
    isLoading: slicedFilesLoading,
    error: slicedFilesError,
  } = useSlicedFiles();

  const form = useForm({
    defaultValues: {
      name: "",
      modelId: 0,
      filamentIds: [],
      price: undefined,
      slicedFileId: 0,
    } as ProductFormData,
    onSubmit: async ({ value }) => {
      try {
        await createProductMutation.mutateAsync(value);
        form.reset();
      } catch (error: any) {
        console.error("Error adding product:", error);
        alert(`Error: ${error.message || "Failed to add product"}`);
      }
    },
  });

  return (
    <FMModal
      triggerElement={triggerElement}
      title="Add Product"
      description="Create a new product for your inventory."
      primaryAction={{
        label: createProductMutation.isPending ? "Adding..." : "Add Product",
        onPress: () => form.handleSubmit(),
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: () => {
          form.reset();
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
        {createProductMutation.error && (
          <div className="bg-destructive/10 rounded-md p-4">
            <div className="text-destructive text-sm">
              Error: {createProductMutation.error.message}
            </div>
          </div>
        )}
        {(modelsError || slicedFilesError) && (
          <div className="bg-accent/20 rounded-md p-4">
            <div className="text-accent-foreground text-sm">
              Warning: {modelsError?.message || slicedFilesError?.message}
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
              <FMInput placeholder="e.g., Painted Dragon Set" className="mt-1" />
              <FieldError className="text-destructive mt-1 text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* Model Field */}
        <form.Field
          name="modelId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0) {
                return "Model is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <Select
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isDisabled={modelsLoading}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <Label className="text-foreground block text-sm font-medium">Model *</Label>
                <Button className="flex items-center justify-between w-full mt-1 px-3 py-2 text-left bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50">
                  <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
                  <span aria-hidden="true">▼</span>
                </Button>
                <Popover className="w-[--trigger-width] max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg">
                  <ListBox className="outline-none p-1">
                    {models.map((model) => (
                      <ListBoxItem
                        key={model.id}
                        id={model.id}
                        className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-accent focus:bg-accent"
                      >
                        {model.name} ({model.Category.name})
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="text-destructive mt-1 text-sm">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Sliced File Field */}
        <form.Field
          name="slicedFileId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0) {
                return "Sliced file is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <Select
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isDisabled={slicedFilesLoading}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <Label className="text-foreground block text-sm font-medium">Sliced File *</Label>
                <Button className="flex items-center justify-between w-full mt-1 px-3 py-2 text-left bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50">
                  <SelectValue placeholder={slicedFilesLoading ? "Loading sliced files..." : "Select a sliced file"} />
                  <span aria-hidden="true">▼</span>
                </Button>
                <Popover className="w-[--trigger-width] max-h-60 overflow-auto bg-background border border-border rounded-md shadow-lg">
                  <ListBox className="outline-none p-1">
                    {slicedFiles.map((file) => (
                      <ListBoxItem
                        key={file.id}
                        id={file.id}
                        className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-accent focus:bg-accent"
                      >
                        {file.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="text-destructive mt-1 text-sm">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Price Field */}
        <form.Field
          name="price"
          validators={{
            onChange: ({ value }) => {
              if (value !== undefined && value <= 0) {
                return "Price must be positive";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              value={field.state.value?.toString() || ""}
              onChange={(value) => field.handleChange(value ? parseFloat(value) : undefined)}
              isInvalid={field.state.meta.errors.length > 0}
            >
              <FMFormLabel>Price</FMFormLabel>
              <FMInput 
                type="number" 
                step="0.01" 
                placeholder="e.g., 29.99" 
                className="mt-1" 
              />
              <FieldError className="text-destructive mt-1 text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* Filaments Field */}
        <form.Field name="filamentIds">
          {(field) => (
            <div>
              <FilamentSelect
                label="Compatible Filaments"
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
      </Form>
    </FMModal>
  );
}