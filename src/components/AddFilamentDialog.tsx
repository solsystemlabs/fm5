import { useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateFilament } from "@/lib/api-hooks";
import {
  Form,
  TextField,
  Label,
  Input,
  FieldError,
  Select,
  ListBox,
  ListBoxItem,
  SelectValue,
  Button as AriaButton,
  Popover,
  NumberField,
  Group,
} from "react-aria-components";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import FMModal from "./FMModal";

type AddFilamentDialogProps = {
  triggerElement: ReactNode;
};

// Form validation schema - matches API schema
const filamentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required").regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  brandName: z.string().min(1, "Brand is required"),
  materialTypeId: z.number().min(1, "Material type is required"),
  diameter: z.number().positive("Diameter must be positive"),
  cost: z.number().positive("Cost must be positive").optional().or(z.literal(0).transform(() => undefined)),
  grams: z.number().positive("Weight must be positive").optional().or(z.literal(0).transform(() => undefined)),
});

type FilamentFormData = z.infer<typeof filamentFormSchema>;

// Mock data for development
const mockBrands = [
  { name: "Hatchbox" },
  { name: "SUNLU" },
  { name: "OVERTURE" },
  { name: "Polymaker" },
  { name: "Prusament" },
];

const mockMaterialTypes = [
  { id: 1, name: "PLA" },
  { id: 2, name: "ABS" },
  { id: 3, name: "PETG" },
  { id: 4, name: "TPU" },
  { id: 5, name: "ASA" },
];

export default function AddFilamentDialog({
  triggerElement,
}: AddFilamentDialogProps): ReactNode {
  const createFilamentMutation = useCreateFilament();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      color: "#000000",
      brandName: "",
      materialTypeId: 0,
      diameter: 1.75,
      cost: 0,
      grams: 0,
    } as FilamentFormData,
    onSubmit: async ({ value }) => {
      try {
        await createFilamentMutation.mutateAsync({
          ...value,
          cost: value.cost || undefined,
          grams: value.grams || undefined,
          modelIds: [], // Optional field for model associations
        });
        
        // Reset form and close modal on success
        form.reset();
        setIsModalOpen(false);
        // Note: The useCreateFilament hook automatically invalidates the filaments query
      } catch (error: any) {
        console.error("Error adding filament:", error);
        alert(`Error: ${error.message || "Failed to add filament"}`);
      }
    },
  });

  return (
    <FMModal
      triggerElement={triggerElement}
      title="Add Filament"
      description="Create a new filament entry for your 3D printing inventory."
      primaryAction={{
        label: createFilamentMutation.isPending ? "Adding..." : "Add Filament",
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
        {createFilamentMutation.error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="text-sm text-red-700 dark:text-red-400">
              Error: {createFilamentMutation.error.message}
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
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name *
              </Label>
              <Input
                placeholder="e.g., Hatchbox PLA Red"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
              <FieldError className="mt-1 text-sm text-red-600 dark:text-red-400">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* Color Field */}
        <form.Field
          name="color"
          validators={{
            onChange: ({ value }) => {
              if (!value || !value.match(/^#[0-9A-Fa-f]{6}$/)) {
                return "Must be a valid hex color";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              isInvalid={field.state.meta.errors.length > 0}
            >
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </Label>
              <div className="mt-1 flex items-center space-x-3">
                <Input
                  type="color"
                  className="h-10 w-16 rounded-md border border-gray-300 dark:border-gray-600"
                />
                <Input
                  type="text"
                  placeholder="#000000"
                  className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                />
              </div>
              <FieldError className="mt-1 text-sm text-red-600 dark:text-red-400">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </TextField>
          )}
        </form.Field>

        {/* Brand Field */}
        <form.Field
          name="brandName"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.length < 1) {
                return "Brand is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand *
              </Label>
              <Select
                isRequired
                selectedKey={field.state.value || null}
                onSelectionChange={(key) => field.handleChange(key as string)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="mt-1 relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) => 
                      isPlaceholder ? "Select a brand" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-5 w-5 text-gray-400 top-1/2 transform -translate-y-1/2 mr-2"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="w-[var(--trigger-width)] mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
                  <ListBox>
                    {mockBrands.map((brand) => (
                      <ListBoxItem
                        key={brand.name}
                        id={brand.name}
                        className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white dark:text-gray-100 dark:hover:bg-indigo-600"
                      >
                        {brand.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Material Type Field */}
        <form.Field
          name="materialTypeId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0) {
                return "Material type is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Material Type *
              </Label>
              <Select
                isRequired
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="mt-1 relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) => 
                      isPlaceholder ? "Select a material type" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-5 w-5 text-gray-400 top-1/2 transform -translate-y-1/2 mr-2"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="w-[var(--trigger-width)] mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
                  <ListBox>
                    {mockMaterialTypes.map((type) => (
                      <ListBoxItem
                        key={type.id}
                        id={type.id}
                        className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white dark:text-gray-100 dark:hover:bg-indigo-600"
                      >
                        {type.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Diameter Field */}
        <form.Field
          name="diameter"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0) {
                return "Diameter must be positive";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <NumberField
              isRequired
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              minValue={0.1}
              maxValue={10}
              step={0.05}
              formatOptions={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }}
              isInvalid={field.state.meta.errors.length > 0}
            >
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diameter (mm) *
              </Label>
              <Group className="mt-1 relative rounded-md border border-gray-300 dark:border-gray-600">
                <AriaButton
                  slot="decrement"
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  −
                </AriaButton>
                <Input className="block w-full rounded-md border-0 py-2 px-8 text-center shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                <AriaButton
                  slot="increment"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  +
                </AriaButton>
              </Group>
              <FieldError className="mt-1 text-sm text-red-600 dark:text-red-400">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </NumberField>
          )}
        </form.Field>

        {/* Cost Field */}
        <form.Field
          name="cost"
          validators={{
            onChange: ({ value }) => {
              if (value && value < 0) {
                return "Cost must be positive";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <NumberField
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              minValue={0}
              step={0.01}
              formatOptions={{
                style: "currency",
                currency: "USD",
              }}
              isInvalid={field.state.meta.errors.length > 0}
            >
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost (optional)
              </Label>
              <Group className="mt-1">
                <Input className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2" />
              </Group>
              <FieldError className="mt-1 text-sm text-red-600 dark:text-red-400">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </NumberField>
          )}
        </form.Field>

        {/* Weight Field */}
        <form.Field
          name="grams"
          validators={{
            onChange: ({ value }) => {
              if (value && value < 0) {
                return "Weight must be positive";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <NumberField
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              minValue={0}
              step={1}
              isInvalid={field.state.meta.errors.length > 0}
            >
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight (g) (optional)
              </Label>
              <Group className="mt-1">
                <Input
                  placeholder="1000"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                />
              </Group>
              <FieldError className="mt-1 text-sm text-red-600 dark:text-red-400">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </NumberField>
          )}
        </form.Field>
      </Form>
    </FMModal>
  );
}
