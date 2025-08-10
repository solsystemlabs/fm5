import { createFileRoute } from '@tanstack/react-router'
import { FilamentsTable } from '@/components/FilamentsTable'
import { AddFilamentDialog } from '@/components/AddFilamentDialog'
import { Button } from '@/components/ui/button'
import { useFilaments } from '@/lib/api-hooks'

export const Route = createFileRoute('/_auth/filaments')({
  component: FilamentsPage,
})

function FilamentsPage() {
  const { data: filaments = [], isLoading, error } = useFilaments()

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Filaments</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600">Error loading filaments: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Filaments</h1>
        <AddFilamentDialog>
          <Button>Add Filament</Button>
        </AddFilamentDialog>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading filaments...</p>
          </div>
        ) : (
          <div className="p-6">
            <FilamentsTable data={filaments} />
          </div>
        )}
      </div>
    </div>
  )
}
