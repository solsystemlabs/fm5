import { useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  useCreateFilament,
  useBrands,
  useMaterialTypes,
  useFilamentTypes,
} from "@/lib/api-hooks";
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
  ColorField,
  ColorSwatch,
  parseColor,
} from "react-aria-components";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import FMModal from "./FMModal";

type AddFilamentDialogProps = {
  triggerElement: ReactNode;
};

// Form validation schema - matches API schema
const filamentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z
    .string()
    .min(1, "Color is required")
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  brandName: z.string().min(1, "Brand is required"),
  materialTypeId: z.number().min(1, "Material type is required"),
  filamentTypeId: z.number().min(1, "Filament type is required"),
  diameter: z.number().positive("Diameter must be positive"),
  cost: z
    .number()
    .positive("Cost must be positive")
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  grams: z
    .number()
    .positive("Weight must be positive")
    .optional()
    .or(z.literal(0).transform(() => undefined)),
});

type FilamentFormData = z.infer<typeof filamentFormSchema>;

export default function AddFilamentDialog({
  triggerElement,
}: AddFilamentDialogProps): ReactNode {
  const createFilamentMutation = useCreateFilament();
  const {
    data: brands = [],
    isLoading: brandsLoading,
    error: brandsError,
  } = useBrands();
  const {
    data: materialTypes = [],
    isLoading: materialTypesLoading,
    error: materialTypesError,
  } = useMaterialTypes();
  const {
    data: filamentTypes = [],
    isLoading: filamentTypesLoading,
    error: filamentTypesError,
  } = useFilamentTypes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      color: "#000000",
      brandName: "",
      materialTypeId: 0,
      filamentTypeId: 0,
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
        {(brandsError || materialTypesError || filamentTypesError) && (
          <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              Warning: Unable to load some form data. {brandsError?.message}{" "}
              {materialTypesError?.message} {filamentTypesError?.message}
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
          {(field) => {
            // Parse string to Color object for ColorField, with safe fallback
            let colorValue: ReturnType<typeof parseColor> | null = null;
            try {
              if (field.state.value) {
                colorValue = parseColor(field.state.value);
              }
            } catch {
              // Invalid color string - leave as null
            }

            return (
              <ColorField
                value={colorValue}
                onChange={(color) => {
                  // Convert Color object back to hex string for form
                  field.handleChange(color?.toString('hex') || '');
                }}
                isInvalid={field.state.meta.errors.length > 0}
                className="flex flex-col gap-2"
              >
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color *
                </Label>
                <div className="flex w-full flex-row items-center gap-2">
                  <ColorSwatch
                    color={field.state.value}
                    className="h-8 w-8 rounded"
                  />
                  <Input className="block grow rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <FieldError className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors.join(", ")}
                </FieldError>
              </ColorField>
            );
          }}
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
                <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a brand" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
                  <ListBox>
                    {brandsLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-gray-400"
                      >
                        Loading brands...
                      </ListBoxItem>
                    ) : brands.length > 0 ? (
                      brands.map((brand) => (
                        <ListBoxItem
                          key={brand.name}
                          id={brand.name}
                          className="relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-indigo-600 hover:text-white dark:text-gray-100 dark:hover:bg-indigo-600"
                        >
                          {brand.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-brands"
                        id="no-brands"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-gray-400"
                      >
                        No brands available
                      </ListBoxItem>
                    )}
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
                <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a material type" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
                  <ListBox>
                    {materialTypesLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-gray-400"
                      >
                        Loading material types...
                      </ListBoxItem>
                    ) : materialTypes.length > 0 ? (
                      materialTypes.map((type) => (
                        <ListBoxItem
                          key={type.id}
                          id={type.id}
                          className="relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-indigo-600 hover:text-white dark:text-gray-100 dark:hover:bg-indigo-600"
                        >
                          {type.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-types"
                        id="no-types"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-gray-400"
                      >
                        No material types available
                      </ListBoxItem>
                    )}
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

        {/* Filament Type Field */}
        <form.Field
          name="filamentTypeId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value <= 0) {
                return "Filament type is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Filament Type *
              </Label>
              <Select
                isRequired
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a filament type" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
                  <ListBox>
                    {filamentTypesLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-gray-400"
                      >
                        Loading filament types...
                      </ListBoxItem>
                    ) : filamentTypes.length > 0 ? (
                      filamentTypes.map((type) => (
                        <ListBoxItem
                          key={type.id}
                          id={type.id}
                          className="relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-indigo-600 hover:text-white dark:text-gray-100 dark:hover:bg-indigo-600"
                        >
                          {type.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-types"
                        id="no-types"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-gray-400"
                      >
                        No filament types available
                      </ListBoxItem>
                    )}
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
              <Group className="relative mt-1 rounded-md border border-gray-300 dark:border-gray-600">
                <AriaButton
                  slot="decrement"
                  className="absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  −
                </AriaButton>
                <Input className="block w-full rounded-md border-0 px-8 py-2 text-center shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                <AriaButton
                  slot="increment"
                  className="absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
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
                <Input className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
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
                  className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
