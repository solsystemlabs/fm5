import { Input } from '@/components/ui/input'

interface EditableColorFormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function EditableColorFormField({ label, value, onChange }: EditableColorFormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded border border-gray-200 shrink-0"
          style={{ backgroundColor: value }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
    </div>
  )
}