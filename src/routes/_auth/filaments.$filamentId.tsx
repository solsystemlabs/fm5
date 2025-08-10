import { createFileRoute } from '@tanstack/react-router'
import { ColorLabel } from '@/components/color/ColorLabel'
import { Filament } from '@/lib/types'

export const Route = createFileRoute('/_auth/filaments/$filamentId')({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Filament Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color & Name
                </label>
                <ColorLabel 
                  color={filament.color.toLowerCase()} 
                  name={filament.name}
                  brand={filament.Brand.name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <div className="text-gray-900 font-medium">{filament.Brand.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <div className="text-gray-900">{filament.Material.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diameter
                </label>
                <div className="text-gray-900 font-mono text-sm">{filament.diameter}mm</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost
                </label>
                {filament.cost ? (
                  <div className="text-gray-900 font-mono">${filament.cost.toFixed(2)}</div>
                ) : (
                  <div className="text-gray-500">Not specified</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                {filament.grams ? (
                  <div className="text-gray-900 font-mono text-sm">{filament.grams}g</div>
                ) : (
                  <div className="text-gray-500">Not specified</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Models
                </label>
                {filament.Models && filament.Models.length > 0 ? (
                  <div className="space-y-2">
                    {filament.Models.map((model) => (
                      <div key={model.id}>
                        <div className="text-gray-900 font-medium text-sm">
                          {model.name}
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                            {model.Category.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">None</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}