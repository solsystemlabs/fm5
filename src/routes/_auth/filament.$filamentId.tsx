import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Filament } from '@/lib/types'
import { useBrands, useMaterialTypes, useCreateBrand, useCreateMaterialType } from '@/lib/api-hooks'
import { EditableField } from '@/components/EditableField'
import { ColorField } from '@/components/ColorField'
import { EntitySelect } from '@/components/EntitySelect'
import { ModelsSelect } from '@/components/ModelsSelect'

export const Route = createFileRoute('/_auth/filament/$filamentId')({
  component: FilamentDetailsPage,
  loader: async ({ params }) => {
    const response = await fetch(`/api/filaments/${params.filamentId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch filament details')
    }
    const filament: Filament = await response.json()
    return { filament }
  },
})

function FilamentDetailsPage() {
  const { filament } = Route.useLoaderData()
  const router = useRouter()
  const { data: brands = [] } = useBrands()
  const { data: materialTypes = [] } = useMaterialTypes()
  const createBrandMutation = useCreateBrand()
  const createMaterialTypeMutation = useCreateMaterialType()
  
  const updateField = async (field: string, value: string | number) => {
    const response = await fetch(`/api/filaments/${filament.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    })
    if (!response.ok) {
      throw new Error('Failed to update filament')
    }
    
    // Invalidate the current route to refetch with updated data
    await router.invalidate()
  }

  const updateModels = async (modelIds: number[]) => {
    const response = await fetch(`/api/filaments/${filament.id}/models`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelIds })
    })
    if (!response.ok) {
      throw new Error('Failed to update models')
    }
    
    // Invalidate the current route to refetch with updated data
    await router.invalidate()
  }

  const handleCreateBrand = async (name: string) => {
    return await createBrandMutation.mutateAsync(name)
  }

  const handleCreateMaterialType = async (name: string) => {
    return await createMaterialTypeMutation.mutateAsync(name)
  }

  const updateMaterialType = async (materialTypeName: string) => {
    // Find the material type ID by name
    const materialType = materialTypes.find(mt => mt.name === materialTypeName)
    if (!materialType) {
      throw new Error('Material type not found')
    }
    await updateField('materialTypeId', materialType.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/filaments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Filaments
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{filament.name}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="max-w-2xl space-y-6">
            <ColorField
              label="Color"
              value={filament.color}
              onSave={(value) => updateField('color', value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField
                label="Name"
                value={filament.name}
                onSave={(value) => updateField('name', value)}
              />
              
              <EntitySelect
                label="Brand"
                value={filament.Brand.name}
                entities={brands}
                onSave={(value) => updateField('brandName', value)}
                onCreateNew={handleCreateBrand}
                allowCreateNew={true}
              />
              
              <EntitySelect
                label="Material"
                value={filament.Material.name}
                entities={materialTypes}
                onSave={updateMaterialType}
                onCreateNew={handleCreateMaterialType}
                allowCreateNew={true}
              />
              
              <EditableField
                label="Diameter"
                value={filament.diameter}
                type="number"
                suffix="mm"
                onSave={(value) => updateField('diameter', value)}
              />
              
              <EditableField
                label="Cost"
                value={filament.cost || 0}
                type="number"
                suffix=" USD"
                onSave={(value) => updateField('cost', value)}
              />
              
              <EditableField
                label="Weight"
                value={filament.grams || 0}
                type="number"
                suffix="g"
                onSave={(value) => updateField('grams', value)}
              />
            </div>
            
            <ModelsSelect
              label="Associated Models"
              selectedModels={filament.Models || []}
              onSave={updateModels}
            />
          </div>
        </div>
      </div>
    </div>
  )
}