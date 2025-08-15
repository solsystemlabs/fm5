import { Input } from '@/components/aria/input'

interface EditableFormFieldProps {
  label?: string
  value: string | number
  type?: 'text' | 'number'
  suffix?: string
  className?: string
  onChange: (value: string | number) => void
}

export function EditableFormField({ 
  label, 
  value, 
  type = 'text', 
  suffix, 
  className, 
  onChange 
}: EditableFormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center">
        <Input
          type={type}
          value={value}
          onChange={(e) => {
            const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
            onChange(newValue)
          }}
        />
        {suffix && <span className="ml-2 text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  )
}