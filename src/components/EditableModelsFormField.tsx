import { useModels } from '@/lib/api-hooks'

interface EditableModelsFormFieldProps {
  label: string
  selectedModelIds: number[]
  onChange: (modelIds: number[]) => void
}

export function EditableModelsFormField({ 
  label, 
  selectedModelIds, 
  onChange 
}: EditableModelsFormFieldProps) {
  const { data: allModels = [] } = useModels()

  const toggleModel = (modelId: number) => {
    const newIds = selectedModelIds.includes(modelId)
      ? selectedModelIds.filter(id => id !== modelId)
      : [...selectedModelIds, modelId]
    onChange(newIds)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
        {allModels.map((model) => (
          <div key={model.id} className="flex items-center space-x-3 py-2">
            <input
              type="checkbox"
              checked={selectedModelIds.includes(model.id)}
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
    </div>
  )
}