interface ReadonlyFieldProps {
  label?: string
  value: string | number
  suffix?: string
  className?: string
}

export function ReadonlyField({ label, value, suffix, className }: ReadonlyFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="p-2 text-gray-900">
        {value}{suffix}
      </div>
    </div>
  )
}