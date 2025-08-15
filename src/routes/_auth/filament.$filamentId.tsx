import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/aria/button";
import { Filament } from "@/lib/types";
import {
  useBrands,
  useMaterialTypes,
  useCreateBrand,
  useCreateMaterialType,
} from "@/lib/api-hooks";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/filaments">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Filaments
            </Button>
          </Link>
          
          {!isEditing ? (
            <Button onPress={handleEdit} size="lg">
              <Edit className="h-4 w-4 mr-2" />
              Edit Filament
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button onPress={handleSave} isDisabled={isLoading} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onPress={handleCancel} isDisabled={isLoading} size="lg">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-800 text-sm font-medium">{error}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {!isEditing ? (
            <>
              {/* Readonly Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">{filament.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: filament.color }}
                    />
                    <span className="text-sm text-gray-600 font-mono">{filament.color}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filament.Brand.name} • {filament.Material.name}
                  </div>
                </div>
              </div>

              {/* Readonly Content */}
              <div className="p-8 space-y-8">
                {/* Specifications Grid */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Diameter</div>
                      <div className="text-lg font-semibold text-gray-900">{filament.diameter}mm</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Weight</div>
                      <div className="text-lg font-semibold text-gray-900">{filament.grams || 0}g</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Cost</div>
                      <div className="text-lg font-semibold text-gray-900">${filament.cost || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Associated Models */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Associated Models</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {filament.Models && filament.Models.length > 0 ? (
                      <div className="space-y-3">
                        {filament.Models.map((model) => (
                          <div key={model.id} className="flex items-center justify-between bg-white rounded-md p-3 shadow-sm">
                            <div className="font-medium text-gray-900">{model.name}</div>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                              {model.Category.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No associated models
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Edit Header */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Edit Filament</h1>
                <p className="text-sm text-gray-600 mt-1">Make changes to the filament details below</p>
              </div>

              {/* Edit Form */}
              <div className="p-8 space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                  <div className="space-y-6">
                    <EditableFormField
                      label="Name"
                      value={formData.name}
                      onChange={(value) => updateFormField('name', value)}
                      className="max-w-md"
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
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <EditableFormField
                      label="Diameter"
                      value={formData.diameter}
                      type="number"
                      suffix="mm"
                      onChange={(value) => updateFormField('diameter', value)}
                    />
                    <EditableFormField
                      label="Weight"
                      value={formData.grams}
                      type="number"
                      suffix="g"
                      onChange={(value) => updateFormField('grams', value)}
                    />
                    <EditableFormField
                      label="Cost"
                      value={formData.cost}
                      type="number"
                      suffix=" USD"
                      onChange={(value) => updateFormField('cost', value)}
                    />
                  </div>
                </div>

                {/* Associated Models */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Associated Models</h2>
                  <EditableModelsFormField
                    label="Select Models"
                    selectedModelIds={formData.modelIds}
                    onChange={(value) => updateFormField('modelIds', value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
