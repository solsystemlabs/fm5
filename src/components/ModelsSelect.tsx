import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModels } from '@/lib/api-hooks'

interface ModelsSelectProps {
  label: string
  selectedModels: { id: number; name: string; Category: { name: string } }[]
  onSave: (modelIds: number[]) => Promise<void>
}

export function ModelsSelect({ label, selectedModels, onSave }: ModelsSelectProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedModels.map(m => m.id))
  const [optimisticModels, setOptimisticModels] = useState(selectedModels)
  const [isLoading, setIsLoading] = useState(false)
  const { data: allModels = [] } = useModels()

  // Sync optimistic value when the prop changes (from route data refresh)
  useEffect(() => {
    setOptimisticModels(selectedModels)
    setSelectedIds(selectedModels.map(m => m.id))
  }, [selectedModels])

  const handleEdit = () => {
    setIsEditing(true)
    setSelectedIds(optimisticModels.map(m => m.id))
  }

  const handleSave = async () => {
    // Optimistically update the display
    const newSelectedModels = allModels.filter(model => selectedIds.includes(model.id))
    setOptimisticModels(newSelectedModels)
    setIsEditing(false)
    setIsLoading(true)
    
    try {
      await onSave(selectedIds)
    } catch (error) {
      // Revert on error
      setOptimisticModels(selectedModels)
      setSelectedIds(selectedModels.map(m => m.id))
      setIsEditing(true)
      console.error('Failed to save models:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedIds(optimisticModels.map(m => m.id))
  }

  const toggleModel = (modelId: number) => {
    setSelectedIds(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="relative">
        {isEditing ? (
          <div className="space-y-3">
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
              {allModels.map((model) => (
                <div key={model.id} className="flex items-center space-x-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(model.id)}
                    onChange={() => toggleModel(model.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.Category.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading}>
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between p-2 rounded border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={handleEdit}
          >
            <div>
              {optimisticModels.length > 0 ? (
                <div className="space-y-2">
                  {optimisticModels.map((model) => (
                    <div key={model.id} className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium text-sm">{model.name}</span>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">
                        {model.Category.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No associated models</span>
              )}
            </div>
            <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  )
}