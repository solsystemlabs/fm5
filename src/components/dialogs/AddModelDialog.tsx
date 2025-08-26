import FMInput from "@/components/ui/FMInput";
import { useCreateModel, useModelCategories, useCreateModelCategory } from "@/lib/api-hooks";
import { useForm } from "@tanstack/react-form";
import { type ReactNode } from "react";
import {
  FieldError,
  Form,
  TextField,
} from "react-aria-components";
import { z } from "zod";
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
  const createModelMutation = useCreateModel();
  const createModelCategoryMutation = useCreateModelCategory();
  const {
    data: modelCategories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useModelCategories();

  const form = useForm({
    defaultValues: {
      name: "",
      modelCategoryId: 0,
      filamentIds: [],
    } as ModelFormData,
    onSubmit: async ({ value }) => {
      try {
        await createModelMutation.mutateAsync(value);

        form.reset();
      } catch (error: any) {
        console.error("Error adding model:", error);
        alert(`Error: ${error.message || "Failed to add model"}`);
      }
    },
  });

  return (
    <FMModal
      triggerElement={triggerElement}
      title="Add Model"
      description="Create a new 3D model entry for your inventory."
      primaryAction={{
        label: createModelMutation.isPending ? "Adding..." : "Add Model",
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
      </Form>
    </FMModal>
  );
}
