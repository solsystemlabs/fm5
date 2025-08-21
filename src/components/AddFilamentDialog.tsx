import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/aria/dialog";
import { Button } from "@/components/aria/button";
import { Input } from "@/components/aria/input";
import { Label } from "@/components/aria/label";
import { HexColorInput, validateHexColor } from "@/components/HexColorInput";
import {
  useMaterialTypes,
  useCreateFilament,
  useBrands,
} from "@/lib/api-hooks";

interface AddFilamentDialogProps {
  children: React.ReactNode;
}

export function AddFilamentDialog({ children }: AddFilamentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: materialTypes = [] } = useMaterialTypes();
  const { data: brands = [] } = useBrands();
  const createFilament = useCreateFilament();

  const form = useForm({
    defaultValues: {
      color: "",
      materialTypeId: 0,
      modelIds: [] as number[],
      cost: undefined as number | undefined,
      grams: undefined as number | undefined,
      brandName: "",
      diameter: 1.75,
    },
    onSubmit: async ({ value }) => {
      try {
        await createFilament.mutateAsync(value);
        // Reset form on success
        form.reset();
      } catch (error) {
        console.error("Error creating filament:", error);
      }
    },
  });

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Filament</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <form.Field
              name="color"
              validators={{
                onChange: ({ value }) => validateHexColor(value),
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Color (Hex)</Label>
                  <HexColorInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    placeholder="#FF0000"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name="brandName"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return "Brand is required";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Brand</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select brand...</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name="materialTypeId"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value === 0) {
                    return "Material type is required";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Material Type</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value={0}>Select material type...</option>
                    {materialTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Diameter (mm)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="1.75"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="cost"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>
                    Cost ($) <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="22.99"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name="grams"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>
                    Weight (grams){" "}
                    <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="1000"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onPress={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" isDisabled={createFilament.isPending}>
              {createFilament.isPending ? "Adding..." : "Add Filament"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

