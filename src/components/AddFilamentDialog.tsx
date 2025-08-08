import { useState } from 'react'
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
import { useMaterialTypes, useModels, useCreateFilament } from '@/lib/api-hooks'

const createFilamentSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  materialTypeId: z.string().min(1, 'Material type is required'),
  modelIds: z.array(z.string()).optional(),
})

interface AddFilamentDialogProps {
  children: React.ReactNode
}

export function AddFilamentDialog({ children }: AddFilamentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: materialTypes = [] } = useMaterialTypes()
  const { data: models = [] } = useModels()
  const createFilament = useCreateFilament()

  const form = useForm({
    defaultValues: {
      color: '',
      materialTypeId: '',
      modelIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      try {
        await createFilament.mutateAsync(value)
        // Reset form and close dialog on success
        form.reset()
        setIsOpen(false)
      } catch (error) {
        console.error('Error creating filament:', error)
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
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Color is required'
                  }
                  return undefined
                },
              }}
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
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name="materialTypeId"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Material type is required'
                  }
                  return undefined
                },
              }}
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
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name="modelIds"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Associated Models (Optional)</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                    {models.map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`model-${model.id}`}
                          checked={field.state.value.includes(model.id)}
                          onChange={(e) => {
                            const currentIds = field.state.value
                            if (e.target.checked) {
                              field.handleChange([...currentIds, model.id])
                            } else {
                              field.handleChange(currentIds.filter(id => id !== model.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`model-${model.id}`} className="text-sm flex-1 cursor-pointer">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-gray-500 ml-2">({model.category.name})</span>
                        </label>
                      </div>
                    ))}
                    {models.length === 0 && (
                      <p className="text-sm text-gray-500">No models available</p>
                    )}
                  </div>
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
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
            <Button type="submit" disabled={createFilament.isPending}>
              {createFilament.isPending ? 'Adding...' : 'Add Filament'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}