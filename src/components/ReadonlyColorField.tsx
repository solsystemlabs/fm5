interface ReadonlyColorFieldProps {
  label: string
  value: string
}

export function ReadonlyColorField({ label, value }: ReadonlyColorFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3 p-2">
        <div 
          className="w-8 h-8 rounded border border-gray-200 shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-gray-900 font-mono">{value}</span>
      </div>
    </div>
  )
}