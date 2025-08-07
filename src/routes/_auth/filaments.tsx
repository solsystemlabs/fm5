import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { FilamentsTable } from '@/components/FilamentsTable'
import { AddFilamentDialog } from '@/components/AddFilamentDialog'
import { Button } from '@/components/ui/button'
import { Filament } from '@/lib/types'

export const Route = createFileRoute('/_auth/filaments')({
  component: FilamentsPage,
})

function FilamentsPage() {
  const context = Route.useRouteContext()
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFilaments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/filaments')
      if (response.ok) {
        const data = await response.json()
        setFilaments(data)
      } else {
        console.error('Failed to fetch filaments')
      }
    } catch (error) {
      console.error('Error fetching filaments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFilaments()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Filaments</h1>
        <AddFilamentDialog onFilamentAdded={fetchFilaments}>
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
