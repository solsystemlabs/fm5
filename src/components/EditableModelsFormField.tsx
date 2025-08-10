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
      <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
        {allModels.length > 0 ? (
          <div className="space-y-2">
            {allModels.map((model) => (
              <label
                key={model.id}
                className="flex items-center space-x-3 p-3 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedModelIds.includes(model.id)}
                  onChange={() => toggleModel(model.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{model.name}</div>
                  <div className="text-xs text-gray-500">{model.Category.name}</div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No models available
          </div>
        )}
      </div>
    </div>
  )
}