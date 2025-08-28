import CreatableSelect from "@/components/ui/CreatableSelect";
import FMInput from "@/components/ui/FMInput";
import {
  useBrandsTRPC,
  useCreateBrandTRPC,
  useCreateFilamentTRPC,
  useCreateFilamentTypeTRPC,
  useCreateMaterialTypeTRPC,
  useFilamentTypesTRPC,
  useMaterialTypesTRPC,
} from "@/lib/trpc-hooks";
import { useForm } from "@tanstack/react-form";
import { type ReactNode } from "react";
import {
  Button as AriaButton,
  ColorField,
  ColorSwatch,
  FieldError,
  Form,
  Group,
  Label,
  NumberField,
  parseColor,
  TextField,
} from "react-aria-components";
import { z } from "zod";
import FMModal from "../FMModal";

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
  const createFilamentMutation = useCreateFilamentTRPC();
  const createBrandMutation = useCreateBrandTRPC();
  const createMaterialTypeMutation = useCreateMaterialTypeTRPC();
  const createFilamentTypeMutation = useCreateFilamentTypeTRPC();

  const {
    data: brands = [],
    isLoading: brandsLoading,
    error: brandsError,
  } = useBrandsTRPC();
  const {
    data: materialTypes = [],
    isLoading: materialTypesLoading,
    error: materialTypesError,
  } = useMaterialTypesTRPC();
  const {
    data: filamentTypes = [],
    isLoading: filamentTypesLoading,
    error: filamentTypesError,
  } = useFilamentTypesTRPC();

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
          <div className="bg-destructive/10 rounded-md p-4">
            <div className="text-destructive text-sm">
              Error: {createFilamentMutation.error.message}
            </div>
          </div>
        )}
        {(brandsError || materialTypesError || filamentTypesError) && (
          <div className="bg-accent/20 rounded-md p-4">
            <div className="text-accent-foreground text-sm">
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
              <Label className="text-foreground block text-sm font-medium">
                Name *
              </Label>
              <FMInput placeholder="e.g., Hatchbox PLA Red" className="mt-1" />
              <FieldError className="text-destructive mt-1 text-sm">
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
                <Label className="text-foreground block text-sm font-medium">
                  Color *
                </Label>
                <div className="flex w-full flex-row items-center gap-2">
                  <ColorSwatch
                    color={field.state.value}
                    className="h-8 w-8 rounded"
                  />
                  <FMInput />
                </div>
                <FieldError className="text-destructive mt-1 text-sm">
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
          {(field) => {
            // Find the currently selected brand by name to get its ID for the CreatableSelect
            const selectedBrand = brands.find(
              (brand) => brand.name === field.state.value,
            );

            return (
              <CreatableSelect
                items={brands}
                isLoading={brandsLoading}
                selectedKey={selectedBrand?.id || null}
                onSelectionChange={(key) => {
                  // Convert the selected brand ID back to brand name for the form
                  const selectedBrandName =
                    brands.find((brand) => brand.id === key)?.name ||
                    (key as string);
                  field.handleChange(selectedBrandName);
                }}
                onCreateItem={(name) => createBrandMutation.mutateAsync(name)}
                isCreating={createBrandMutation.isPending}
                placeholder="Select a brand"
                label="Brand"
                isRequired
                isInvalid={field.state.meta.errors.length > 0}
                createLabel="Create new brand"
              >
                {field.state.meta.errors.length > 0 && (
                  <div className="text-destructive mt-1 text-sm">
                    {field.state.meta.errors.join(", ")}
                  </div>
                )}
              </CreatableSelect>
            );
          }}
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
            <CreatableSelect
              items={materialTypes}
              isLoading={materialTypesLoading}
              selectedKey={field.state.value}
              onSelectionChange={(key) => field.handleChange(key as number)}
              onCreateItem={(name) =>
                createMaterialTypeMutation.mutateAsync(name)
              }
              isCreating={createMaterialTypeMutation.isPending}
              placeholder="Select a material type"
              label="Material Type"
              isRequired
              isInvalid={field.state.meta.errors.length > 0}
              createLabel="Create new material type"
            >
              {field.state.meta.errors.length > 0 && (
                <div className="text-destructive mt-1 text-sm">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </CreatableSelect>
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
            <CreatableSelect
              items={filamentTypes}
              isLoading={filamentTypesLoading}
              selectedKey={field.state.value}
              onSelectionChange={(key) => field.handleChange(key as number)}
              onCreateItem={(name) =>
                createFilamentTypeMutation.mutateAsync(name)
              }
              isCreating={createFilamentTypeMutation.isPending}
              placeholder="Select a filament type"
              label="Filament Type"
              isRequired
              isInvalid={field.state.meta.errors.length > 0}
              createLabel="Create new filament type"
            >
              {field.state.meta.errors.length > 0 && (
                <div className="text-destructive mt-1 text-sm">
                  {field.state.meta.errors.join(", ")}
                </div>
              )}
            </CreatableSelect>
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
              <Label className="text-foreground block text-sm font-medium">
                Diameter (mm) *
              </Label>
              <Group className="border-input relative mt-1 rounded-md border">
                <AriaButton
                  slot="decrement"
                  className="text-muted-foreground dark:text-muted-foreground absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center hover:text-gray-600 dark:hover:text-gray-200"
                >
                  −
                </AriaButton>
                <FMInput />
                <AriaButton
                  slot="increment"
                  className="text-muted-foreground dark:text-muted-foreground absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center hover:text-gray-600 dark:hover:text-gray-200"
                >
                  +
                </AriaButton>
              </Group>
              <FieldError className="text-destructive mt-1 text-sm">
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
              <Label className="text-foreground block text-sm font-medium">
                Cost (optional)
              </Label>
              <Group className="mt-1">
                <FMInput />
              </Group>
              <FieldError className="text-destructive mt-1 text-sm">
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
              <Label className="text-foreground block text-sm font-medium">
                Weight (g) (optional)
              </Label>
              <Group className="mt-1">
                <FMInput placeholder="1000" />
              </Group>
              <FieldError className="text-destructive mt-1 text-sm">
                {field.state.meta.errors.join(", ")}
              </FieldError>
            </NumberField>
          )}
        </form.Field>
      </Form>
    </FMModal>
  );
}
