import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaterialType } from '@/lib/types'

const createFilamentSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  materialTypeId: z.string().min(1, 'Material type is required'),
})

interface AddFilamentDialogProps {
  onFilamentAdded: () => void
  children: React.ReactNode
}

export function AddFilamentDialog({ onFilamentAdded, children }: AddFilamentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch material types when dialog opens
    if (isOpen) {
      fetch('/api/material-types')
        .then((res) => res.json())
        .then((data) => setMaterialTypes(data))
        .catch((error) => console.error('Error fetching material types:', error))
    }
  }, [isOpen])

  const form = useForm({
    defaultValues: {
      color: '',
      materialTypeId: '',
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: createFilamentSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/filaments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        })

        if (!response.ok) {
          throw new Error('Failed to create filament')
        }

        // Reset form and close dialog
        form.reset()
        setIsOpen(false)
        onFilamentAdded()
      } catch (error) {
        console.error('Error creating filament:', error)
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Filament</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div>
            <form.Field
              name="color"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Color</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Red, Blue, Transparent"
                  />
                  {field.state.meta.touchedErrors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.touchedErrors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name="materialTypeId"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Material Type</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select material type...</option>
                    {materialTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.touchedErrors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.touchedErrors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Filament'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}