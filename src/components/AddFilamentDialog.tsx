import { type ReactNode } from "react";
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
import FMInput from "@/components/ui/FMInput";
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
      await createFilamentMutation.mutateAsync({
        ...value,
        cost: value.cost || undefined,
        grams: value.grams || undefined,
        modelIds: [], // Optional field for model associations
      });

      // Reset form on success
      form.reset();
      // Note: The useCreateFilament hook automatically invalidates the filaments query
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
          <div className="rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">
              Error: {createFilamentMutation.error.message}
            </div>
          </div>
        )}
        {(brandsError || materialTypesError || filamentTypesError) && (
          <div className="rounded-md bg-accent/20 p-4">
            <div className="text-sm text-accent-foreground">
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
              <Label className="block text-sm font-medium text-foreground">
                Name *
              </Label>
              <FMInput placeholder="e.g., Hatchbox PLA Red" className="mt-1" />
              <FieldError className="mt-1 text-sm text-destructive">
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
                  field.handleChange(color?.toString("hex") || "");
                }}
                isInvalid={field.state.meta.errors.length > 0}
                className="flex flex-col gap-2"
              >
                <Label className="block text-sm font-medium text-foreground">
                  Color *
                </Label>
                <div className="flex w-full flex-row items-center gap-2">
                  <ColorSwatch
                    color={field.state.value}
                    className="h-8 w-8 rounded"
                  />
                  <FMInput />
                </div>
                <FieldError className="mt-1 text-sm text-destructive">
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
              <Label className="block text-sm font-medium text-foreground">
                Brand *
              </Label>
              <Select
                isRequired
                selectedKey={field.state.value || null}
                onSelectionChange={(key) => field.handleChange(key as string)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-input bg-background py-2 pr-10 pl-3 text-left shadow-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none sm:text-sm text-foreground">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a brand" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm border border-border">
                  <ListBox>
                    {brandsLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                      >
                        Loading brands...
                      </ListBoxItem>
                    ) : brands.length > 0 ? (
                      brands.map((brand) => (
                        <ListBoxItem
                          key={brand.name}
                          id={brand.name}
                          className="relative cursor-default py-2 pr-9 pl-3 text-popover-foreground select-none hover:bg-accent hover:text-accent-foreground "
                        >
                          {brand.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-brands"
                        id="no-brands"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                      >
                        No brands available
                      </ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-destructive">
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
              <Label className="block text-sm font-medium text-foreground">
                Material Type *
              </Label>
              <Select
                isRequired
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-input bg-background py-2 pr-10 pl-3 text-left shadow-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none sm:text-sm text-foreground">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a material type" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm border border-border">
                  <ListBox>
                    {materialTypesLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                      >
                        Loading material types...
                      </ListBoxItem>
                    ) : materialTypes.length > 0 ? (
                      materialTypes.map((type) => (
                        <ListBoxItem
                          key={type.id}
                          id={type.id}
                          className="relative cursor-default py-2 pr-9 pl-3 text-popover-foreground select-none hover:bg-accent hover:text-accent-foreground "
                        >
                          {type.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-types"
                        id="no-types"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                      >
                        No material types available
                      </ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-destructive">
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
              <Label className="block text-sm font-medium text-foreground">
                Filament Type *
              </Label>
              <Select
                isRequired
                selectedKey={field.state.value}
                onSelectionChange={(key) => field.handleChange(key as number)}
                isInvalid={field.state.meta.errors.length > 0}
              >
                <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-input bg-background py-2 pr-10 pl-3 text-left shadow-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none sm:text-sm text-foreground">
                  <SelectValue className="block truncate">
                    {({ isPlaceholder, selectedText }) =>
                      isPlaceholder ? "Select a filament type" : selectedText
                    }
                  </SelectValue>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
                    aria-hidden="true"
                  />
                </AriaButton>
                <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm border border-border">
                  <ListBox>
                    {filamentTypesLoading ? (
                      <ListBoxItem
                        key="loading"
                        id="loading"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                      >
                        Loading filament types...
                      </ListBoxItem>
                    ) : filamentTypes.length > 0 ? (
                      filamentTypes.map((type) => (
                        <ListBoxItem
                          key={type.id}
                          id={type.id}
                          className="relative cursor-default py-2 pr-9 pl-3 text-popover-foreground select-none hover:bg-accent hover:text-accent-foreground "
                        >
                          {type.name}
                        </ListBoxItem>
                      ))
                    ) : (
                      <ListBoxItem
                        key="no-types"
                        id="no-types"
                        className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                      >
                        No filament types available
                      </ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-destructive">
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
              <Label className="block text-sm font-medium text-foreground">
                Diameter (mm) *
              </Label>
              <Group className="relative mt-1 rounded-md border border-input">
                <AriaButton
                  slot="decrement"
                  className="absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center text-muted-foreground hover:text-gray-600 dark:text-muted-foreground dark:hover:text-gray-200"
                >
                  −
                </AriaButton>
                <FMInput />
                <AriaButton
                  slot="increment"
                  className="absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center text-muted-foreground hover:text-gray-600 dark:text-muted-foreground dark:hover:text-gray-200"
                >
                  +
                </AriaButton>
              </Group>
              <FieldError className="mt-1 text-sm text-destructive">
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
              <Label className="block text-sm font-medium text-foreground">
                Cost (optional)
              </Label>
              <Group className="mt-1">
                <FMInput />
              </Group>
              <FieldError className="mt-1 text-sm text-destructive">
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
              <Label className="block text-sm font-medium text-foreground">
                Weight (g) (optional)
              </Label>
              <Group className="mt-1">
                <FMInput placeholder="1000" />
              </Group>
              <FieldError className="mt-1 text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </NumberField>
          )}
        </form.Field>
      </Form>
    </FMModal>
  );
}
