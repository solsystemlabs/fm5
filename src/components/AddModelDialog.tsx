import { useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  useCreateModel,
  useModelCategories,
} from "@/lib/api-hooks";
import {
  Form,
  TextField,
  Label,
  FieldError,
  Select,
  SelectValue,
  Button as AriaButton,
  Popover,
  ListBox,
  ListBoxItem,
  ColorSwatch,
} from "react-aria-components";
import FMInput from "@/components/ui/FMInput";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import FMModal from "./FMModal";
import FilamentSelect from "./dropdowns/FilamentSelect";
import FMFormLabel from "./ui/FMFormLabel";

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
  const {
    data: modelCategories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useModelCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      modelCategoryId: 0,
      filamentIds: [],
    } as ModelFormData,
    onSubmit: async ({ value }) => {
      try {
        await createModelMutation.mutateAsync(value);

        // Reset form and close modal on success
        form.reset();
        setIsModalOpen(false);
        // Note: The useCreateModel hook automatically invalidates the models query
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
          setIsModalOpen(false);
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
            <div>
              <FMFormLabel>Category *</FMFormLabel>
              <Select
                isRequired
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="border-input bg-background focus:border-ring focus:ring-ring text-foreground relative mt-1 w-full cursor-default rounded-md border py-2 pr-10 pl-3 text-left shadow-sm focus:ring-1 focus:outline-none sm:text-sm">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a category" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="text-muted-foreground pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 bg-popover border-border mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md border py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm">
                  <ListBox>
                    {categoriesLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="dark:text-muted-foreground relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none"
                      >
                        Loading categories...
                      </ListBoxItem>
                    ) : modelCategories.length > 0 ? (
                      modelCategories.map((category) => (
                        <ListBoxItem
                          key={category.id}
                          id={category.id}
                          className="text-popover-foreground hover:bg-accent hover:text-accent-foreground relative cursor-default py-2 pr-9 pl-3 select-none"
                        >
                          {category.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-categories"
                        id="no-categories"
                        className="dark:text-muted-foreground relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none"
                      >
                        No categories available
                      </ListBoxItem>
                    )}
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

        {/* Filaments Field */}
        <form.Field name="filamentIds">
          {(field) => (
            <div>
              <FilamentSelect 
                label="Available Filaments"
                selectedFilamentIds={field.state.value || []}
                onSelectionChange={(filamentIds) => field.handleChange(filamentIds)}
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

