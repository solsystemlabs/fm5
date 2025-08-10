import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ColorFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
}

export function ColorField({ label, value, onSave }: ColorFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [optimisticValue, setOptimisticValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)

  // Sync optimistic value when the prop changes (from route data refresh)
  useEffect(() => {
    setOptimisticValue(value)
  }, [value])

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(optimisticValue)
  }

  const handleSave = async () => {
    // Optimistically update the display
    setOptimisticValue(editValue)
    setIsEditing(false)
    setIsLoading(true)
    
    try {
      await onSave(editValue)
    } catch (error) {
      // Revert on error
      setOptimisticValue(value)
      setEditValue(value)
      setIsEditing(true)
      console.error('Failed to save color:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlur = () => {
    if (editValue !== optimisticValue) {
      handleSave()
    } else {
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value)
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
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border border-gray-200 shrink-0"
              style={{ backgroundColor: editValue }}
            />
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              placeholder="#000000"
              className="font-mono"
            />
          </div>
        ) : (
          <div 
            className="flex items-center justify-between p-2 rounded border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={handleEdit}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded border border-gray-200 shrink-0"
                style={{ backgroundColor: optimisticValue }}
              />
              <span className="text-gray-900 font-mono">{optimisticValue}</span>
            </div>
            <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  )
}