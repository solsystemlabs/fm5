import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Entity {
  id: number
  name: string
}

interface EditableEntityFormFieldProps {
  label: string
  value: string
  entities: Entity[]
  onChange: (value: string) => void
  onCreateNew?: (name: string) => Promise<Entity>
  allowCreateNew?: boolean
}

export function EditableEntityFormField({ 
  label, 
  value, 
  entities, 
  onChange,
  onCreateNew,
  allowCreateNew = false 
}: EditableEntityFormFieldProps) {
  const [newEntityName, setNewEntityName] = useState('')
  const [showNewEntityInput, setShowNewEntityInput] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'CREATE_NEW' && allowCreateNew) {
      setShowNewEntityInput(true)
      return
    }
    onChange(selectedValue)
  }

  const handleCreateNew = async () => {
    if (!newEntityName.trim() || !onCreateNew) return
    
    setIsCreating(true)
    try {
      const newEntity = await onCreateNew(newEntityName.trim())
      onChange(newEntity.name)
      setNewEntityName('')
      setShowNewEntityInput(false)
    } catch (error) {
      console.error('Failed to create entity:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelNew = () => {
    setShowNewEntityInput(false)
    setNewEntityName('')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {showNewEntityInput ? (
        <div className="flex gap-2">
          <Input
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            placeholder={`Enter new ${label.toLowerCase()}`}
            disabled={isCreating}
          />
          <Button 
            onClick={handleCreateNew} 
            disabled={isCreating || !newEntityName.trim()}
            size="sm"
          >
            Add
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancelNew} 
            disabled={isCreating}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Select value={value} onValueChange={handleSelectChange}>
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
      )}
    </div>
  )
}