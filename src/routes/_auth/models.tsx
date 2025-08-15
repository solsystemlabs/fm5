import { createFileRoute } from '@tanstack/react-router'
import { ModelsTable } from '@/components/ModelsTable'
import { AddModelDialog } from '@/components/AddModelDialog'
import { Button } from '@/components/aria/button'
import { useModels } from '@/lib/api-hooks'

export const Route = createFileRoute('/_auth/models')({
  component: ModelsPage,
})

function ModelsPage() {
  const { data: models = [], isLoading, error } = useModels()

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Models</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600">Error loading models: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Models</h1>
        <AddModelDialog>
          <Button>Add Model</Button>
        </AddModelDialog>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading models...</p>
          </div>
        ) : (
          <div className="p-6">
            <ModelsTable data={models} />
          </div>
        )}
      </div>
    </div>
  )
}
