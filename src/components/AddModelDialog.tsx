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
import {
  useModelCategories,
  useCreateModel,
} from "@/lib/api-hooks";

interface AddModelDialogProps {
  children: React.ReactNode;
}

export function AddModelDialog({ children }: AddModelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: modelCategories = [] } = useModelCategories();
  const createModel = useCreateModel();

  const form = useForm({
    defaultValues: {
      name: "",
      modelCategoryId: 0,
    },
    onSubmit: async ({ value }) => {
      try {
        await createModel.mutateAsync(value);
        // Reset form and close dialog on success
        form.reset();
        setIsOpen(false);
      } catch (error) {
        console.error("Error creating model:", error);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
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
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return "Name is required";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Model Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Benchy, Miniature Dragon, Phone Case"
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
              name="modelCategoryId"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value === 0) {
                    return "Category is required";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Category</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value={0}>Select category...</option>
                    {modelCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onPress={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isDisabled={createModel.isPending}>
              {createModel.isPending ? "Adding..." : "Add Model"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}