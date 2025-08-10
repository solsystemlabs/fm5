import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Filament } from "@/lib/types";
import {
  useBrands,
  useMaterialTypes,
  useCreateBrand,
  useCreateMaterialType,
} from "@/lib/api-hooks";
import { ReadonlyField } from "@/components/ReadonlyField";
import { ReadonlyColorField } from "@/components/ReadonlyColorField";
import { ReadonlyEntityField } from "@/components/ReadonlyEntityField";
import { ReadonlyModelsField } from "@/components/ReadonlyModelsField";
import { EditableFormField } from "@/components/EditableFormField";
import { EditableColorFormField } from "@/components/EditableColorFormField";
import { EditableEntityFormField } from "@/components/EditableEntityFormField";
import { EditableModelsFormField } from "@/components/EditableModelsFormField";

export const Route = createFileRoute("/_auth/filament/$filamentId")({
  component: FilamentDetailsPage,
  loader: async ({ params }) => {
    const response = await fetch(`/api/filaments/${params.filamentId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch filament details");
    }
    const filament: Filament = await response.json();
    return { filament };
  },
});

interface FormData {
  name: string
  color: string
  brandName: string
  materialName: string
  diameter: number
  cost: number
  grams: number
  modelIds: number[]
}

function FilamentDetailsPage() {
  const { filament } = Route.useLoaderData();
  const router = useRouter();
  const { data: brands = [] } = useBrands();
  const { data: materialTypes = [] } = useMaterialTypes();
  const createBrandMutation = useCreateBrand();
  const createMaterialTypeMutation = useCreateMaterialType();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: filament.name,
    color: filament.color,
    brandName: filament.Brand.name,
    materialName: filament.Material.name,
    diameter: filament.diameter,
    cost: filament.cost || 0,
    grams: filament.grams || 0,
    modelIds: filament.Models?.map(m => m.id) || []
  });

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    // Reset form data to current filament data
    setFormData({
      name: filament.name,
      color: filament.color,
      brandName: filament.Brand.name,
      materialName: filament.Material.name,
      diameter: filament.diameter,
      cost: filament.cost || 0,
      grams: filament.grams || 0,
      modelIds: filament.Models?.map(m => m.id) || []
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data to original values
    setFormData({
      name: filament.name,
      color: filament.color,
      brandName: filament.Brand.name,
      materialName: filament.Material.name,
      diameter: filament.diameter,
      cost: filament.cost || 0,
      grams: filament.grams || 0,
      modelIds: filament.Models?.map(m => m.id) || []
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      
      // Prepare update data
      const updateData: any = {
        name: formData.name,
        color: formData.color,
        brandName: formData.brandName,
        diameter: formData.diameter,
        cost: formData.cost,
        grams: formData.grams
      };

      // Handle material type update - find ID by name
      const materialType = materialTypes.find(mt => mt.name === formData.materialName);
      if (materialType) {
        updateData.materialTypeId = materialType.id;
      } else {
        throw new Error("Selected material type not found");
      }

      // Update filament fields
      const response = await fetch(`/api/filaments/${filament.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update filament (${response.status})`);
      }

      // Update models separately
      const modelsResponse = await fetch(`/api/filaments/${filament.id}/models`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelIds: formData.modelIds }),
      });
      
      if (!modelsResponse.ok) {
        const errorData = await modelsResponse.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update models (${modelsResponse.status})`);
      }

      // Exit edit mode and refresh data
      setIsEditing(false);
      await router.invalidate();
    } catch (error) {
      console.error("Failed to save changes:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async (name: string) => {
    return await createBrandMutation.mutateAsync(name);
  };

  const handleCreateMaterialType = async (name: string) => {
    return await createMaterialTypeMutation.mutateAsync(name);
  };

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/filaments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Filaments
          </Button>
        </Link>
        
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          <div className="max-w-2xl space-y-6">
            {!isEditing ? (
              <>
                <ReadonlyField
                  className="text-xl font-semibold"
                  value={filament.name}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReadonlyColorField
                    label="Color"
                    value={filament.color}
                  />
                  <ReadonlyEntityField
                    label="Brand"
                    value={filament.Brand.name}
                  />
                  <ReadonlyEntityField
                    label="Material"
                    value={filament.Material.name}
                  />
                  <ReadonlyField
                    label="Diameter"
                    value={filament.diameter}
                    suffix="mm"
                  />
                  <ReadonlyField
                    label="Cost"
                    value={filament.cost || 0}
                    suffix=" USD"
                  />
                  <ReadonlyField
                    label="Weight"
                    value={filament.grams || 0}
                    suffix="g"
                  />
                </div>

                <ReadonlyModelsField
                  label="Associated Models"
                  models={filament.Models || []}
                />
              </>
            ) : (
              <>
                <EditableFormField
                  className="text-xl font-semibold"
                  value={formData.name}
                  onChange={(value) => updateFormField('name', value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableColorFormField
                    label="Color"
                    value={formData.color}
                    onChange={(value) => updateFormField('color', value)}
                  />
                  <EditableEntityFormField
                    label="Brand"
                    value={formData.brandName}
                    entities={brands}
                    onChange={(value) => updateFormField('brandName', value)}
                    onCreateNew={handleCreateBrand}
                    allowCreateNew={true}
                  />
                  <EditableEntityFormField
                    label="Material"
                    value={formData.materialName}
                    entities={materialTypes}
                    onChange={(value) => updateFormField('materialName', value)}
                    onCreateNew={handleCreateMaterialType}
                    allowCreateNew={true}
                  />
                  <EditableFormField
                    label="Diameter"
                    value={formData.diameter}
                    type="number"
                    suffix="mm"
                    onChange={(value) => updateFormField('diameter', value)}
                  />
                  <EditableFormField
                    label="Cost"
                    value={formData.cost}
                    type="number"
                    suffix=" USD"
                    onChange={(value) => updateFormField('cost', value)}
                  />
                  <EditableFormField
                    label="Weight"
                    value={formData.grams}
                    type="number"
                    suffix="g"
                    onChange={(value) => updateFormField('grams', value)}
                  />
                </div>

                <EditableModelsFormField
                  label="Associated Models"
                  selectedModelIds={formData.modelIds}
                  onChange={(value) => updateFormField('modelIds', value)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
