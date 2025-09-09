import {
  Select as AriaSelect,
  SelectValue,
  Button,
  Label,
  Popover,
  ListBox,
  ListBoxItem,
  Text,
  type SelectProps as AriaSelectProps,
  type Key,
} from 'react-aria-components'
import { cn } from '../../utils/cn'

export interface SelectOption {
  key: string
  label: string
  value: any
  disabled?: boolean
}

export interface SelectProps<T = any> extends Omit<AriaSelectProps<SelectOption>, 'className' | 'children'> {
  variant?: 'default' | 'filled' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  label: string
  placeholder?: string
  description?: string
  errorMessage?: string
  items: SelectOption[]
  className?: string
}

export function Select<T = any>({
  variant = 'default',
  size = 'md',
  label,
  placeholder = 'Select an option...',
  description,
  errorMessage,
  items,
  className,
  ...props
}: SelectProps<T>) {
  const baseFieldClasses = ['flex flex-col gap-1']

  const labelClasses = [
    'text-sm font-medium text-gray-700',
    'group-disabled:text-gray-500',
  ]

  const triggerClasses = [
    'flex items-center justify-between gap-2 border transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'data-[pressed]:scale-[0.98]',
  ]

  const valueClasses = [
    'flex-1 text-left truncate',
    'data-[placeholder]:text-gray-400',
  ]

  const iconClasses = ['w-4 h-4 text-gray-500 shrink-0 transition-transform', 'group-data-[open]:rotate-180']

  const variantClasses = {
    default: {
      trigger: [
        'bg-white border-gray-300 hover:border-gray-400',
        'focus:border-primary-500',
        'group-invalid:border-red-500 group-invalid:focus:ring-red-500',
      ],
    },
    filled: {
      trigger: [
        'bg-gray-50 border-gray-200 hover:border-gray-300',
        'focus:bg-white focus:border-primary-500',
        'group-invalid:border-red-500 group-invalid:focus:ring-red-500',
      ],
    },
    minimal: {
      trigger: [
        'bg-transparent border-0 border-b border-gray-300',
        'hover:border-gray-400 focus:border-primary-500',
        'rounded-none focus:ring-0 focus:ring-offset-0',
        'group-invalid:border-red-500',
      ],
    },
  }

  const sizeClasses = {
    sm: {
      trigger: 'h-8 px-3 rounded text-sm',
      value: 'text-sm',
    },
    md: {
      trigger: 'h-10 px-4 rounded-md text-base',
      value: 'text-base',
    },
    lg: {
      trigger: 'h-12 px-5 rounded-lg text-lg',
      value: 'text-lg',
    },
  }

  return (
    <AriaSelect className={cn(baseFieldClasses, className)} {...props}>
      <Label className={cn(labelClasses)}>{label}</Label>
      
      <Button className={cn(triggerClasses, variantClasses[variant].trigger, sizeClasses[size].trigger)}>
        <SelectValue className={cn(valueClasses, sizeClasses[size].value)} />
        <div className={cn(iconClasses)}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </Button>

      <Popover className="w-[--trigger-width] bg-white border border-gray-200 rounded-md shadow-lg">
        <ListBox className="max-h-60 overflow-auto py-1">
          {items.map((item) => (
            <ListBoxItem
              key={item.key}
              id={item.key}
              textValue={item.label}
              className={cn(
                'flex items-center px-3 py-2 text-sm cursor-pointer',
                'hover:bg-gray-100 focus:bg-primary-100 focus:text-primary-900 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'data-[selected]:bg-primary-100 data-[selected]:text-primary-900'
              )}
              isDisabled={item.disabled}
            >
              {item.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>

      {description && (
        <Text slot="description" className="text-sm text-gray-600">
          {description}
        </Text>
      )}

      {errorMessage && (
        <Text slot="errorMessage" className="text-sm text-red-600">
          {errorMessage}
        </Text>
      )}
    </AriaSelect>
  )
}