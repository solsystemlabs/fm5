interface ReadonlyModelsFieldProps {
  label: string
  models: { id: number; name: string; Category: { name: string } }[]
}

export function ReadonlyModelsField({ label, models }: ReadonlyModelsFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="p-2">
        {models.length > 0 ? (
          <div className="space-y-2">
            {models.map((model) => (
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
    </div>
  )
}