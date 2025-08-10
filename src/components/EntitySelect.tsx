import { useState, useEffect } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Entity {
  id: number
  name: string
}

interface EntitySelectProps {
  label: string
  value: string
  entities: Entity[]
  onSave: (value: string) => Promise<void>
  onCreateNew?: (name: string) => Promise<Entity>
  allowCreateNew?: boolean
}

export function EntitySelect({ 
  label, 
  value, 
  entities, 
  onSave, 
  onCreateNew, 
  allowCreateNew = false 
}: EntitySelectProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newEntityName, setNewEntityName] = useState('')
  const [showNewEntityInput, setShowNewEntityInput] = useState(false)
  const [optimisticValue, setOptimisticValue] = useState(value)

  // Sync optimistic value when the prop changes (from route data refresh)
  useEffect(() => {
    setOptimisticValue(value)
  }, [value])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async (selectedValue: string) => {
    if (selectedValue === 'CREATE_NEW' && allowCreateNew) {
      setShowNewEntityInput(true)
      return
    }
    
    // Optimistically update the display
    setOptimisticValue(selectedValue)
    setIsEditing(false)
    setIsLoading(true)
    
    try {
      await onSave(selectedValue)
    } catch (error) {
      // Revert on error
      setOptimisticValue(value)
      console.error('Failed to save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = async () => {
    if (!newEntityName.trim() || !onCreateNew) return
    
    // Optimistically update the display
    setOptimisticValue(newEntityName.trim())
    setIsEditing(false)
    setShowNewEntityInput(false)
    setIsLoading(true)
    
    try {
      // Create the entity using the provided function
      const newEntity = await onCreateNew(newEntityName.trim())
      // Update the filament with the new entity name
      await onSave(newEntity.name)
      setNewEntityName('')
    } catch (error) {
      // Revert on error
      setOptimisticValue(value)
      setShowNewEntityInput(true)
      setIsEditing(true)
      console.error('Failed to create entity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowNewEntityInput(false)
    setNewEntityName('')
  }

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {isEditing ? (
          <div className="space-y-3">
            {showNewEntityInput ? (
              <div className="flex gap-2">
                <Input
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  placeholder={`Enter new ${label.toLowerCase()}`}
                  disabled={isLoading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNew()
                    if (e.key === 'Escape') handleCancel()
                  }}
                />
                <Button onClick={handleCreateNew} disabled={isLoading || !newEntityName.trim()}>
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={optimisticValue} onValueChange={handleSave} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.name}>
                        {entity.name}
                      </SelectItem>
                    ))}
                    {allowCreateNew && (
                      <SelectItem value="CREATE_NEW">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create new {label.toLowerCase()}
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="flex items-center justify-between p-2 rounded border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={handleEdit}
          >
            <span className="text-gray-900">{optimisticValue}</span>
            <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  )
}