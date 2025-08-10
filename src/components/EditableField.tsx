import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface EditableFieldProps {
  label: string
  value: string | number
  type?: 'text' | 'number'
  suffix?: string
  onSave: (value: string | number) => Promise<void>
}

export function EditableField({ label, value, type = 'text', suffix, onSave }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const [optimisticValue, setOptimisticValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)

  // Sync optimistic value when the prop changes (from route data refresh)
  useEffect(() => {
    setOptimisticValue(value)
  }, [value])

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(optimisticValue.toString())
  }

  const handleSave = async () => {
    const finalValue = type === 'number' ? parseFloat(editValue) : editValue
    
    // Optimistically update the display
    setOptimisticValue(finalValue)
    setIsEditing(false)
    setIsLoading(true)
    
    try {
      await onSave(finalValue)
    } catch (error) {
      // Revert on error
      setOptimisticValue(value)
      setEditValue(value.toString())
      setIsEditing(true)
      console.error('Failed to save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlur = () => {
    if (editValue !== optimisticValue.toString()) {
      handleSave()
    } else {
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value.toString())
      setIsEditing(false)
    }
  }

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {isEditing ? (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
            className="pr-8"
          />
        ) : (
          <div 
            className="flex items-center justify-between p-2 rounded border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={handleEdit}
          >
            <span className="text-gray-900">
              {optimisticValue}{suffix}
            </span>
            <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  )
}