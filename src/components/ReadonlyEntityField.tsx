interface ReadonlyEntityFieldProps {
  label: string
  value: string
}

export function ReadonlyEntityField({ label, value }: ReadonlyEntityFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="p-2 text-gray-900">
        {value}
      </div>
    </div>
  )
}