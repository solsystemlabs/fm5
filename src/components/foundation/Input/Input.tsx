import {
  Input as AriaInput,
  
  Label,
  Text,
  TextField
} from 'react-aria-components'
import { cn } from '../../utils/cn'
import type {TextFieldProps as AriaTextFieldProps} from 'react-aria-components';

export interface InputProps extends Omit<AriaTextFieldProps, 'className'> {
  variant?: 'default' | 'filled' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  label: string
  placeholder?: string
  description?: string
  errorMessage?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  className?: string
}

export function Input({
  variant = 'default',
  size = 'md',
  label,
  placeholder,
  description,
  errorMessage,
  prefix,
  suffix,
  className,
  ...props
}: InputProps) {
  const baseFieldClasses = ['flex flex-col gap-1']

  const labelClasses = [
    'text-sm font-medium text-gray-700',
    'group-disabled:text-gray-500',
  ]

  const controlClasses = [
    'flex items-center border transition-colors duration-200',
    'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1',
    'group-disabled:opacity-50 group-disabled:cursor-not-allowed',
  ]

  const inputClasses = [
    'flex-1 bg-transparent outline-none',
    'text-gray-800 placeholder:text-gray-400',
    'disabled:cursor-not-allowed',
  ]

  const variantClasses = {
    default: {
      control: [
        'bg-white border-gray-300 hover:border-gray-400',
        'focus-within:border-primary-500',
        'group-invalid:border-red-500 group-invalid:focus-within:ring-red-500',
      ],
    },
    filled: {
      control: [
        'bg-gray-50 border-gray-200 hover:border-gray-300',
        'focus-within:bg-white focus-within:border-primary-500',
        'group-invalid:border-red-500 group-invalid:focus-within:ring-red-500',
      ],
    },
    minimal: {
      control: [
        'bg-transparent border-0 border-b border-gray-300',
        'hover:border-gray-400 focus-within:border-primary-500',
        'rounded-none focus-within:ring-0 focus-within:ring-offset-0',
        'group-invalid:border-red-500',
      ],
    },
  }

  const sizeClasses = {
    sm: {
      control: 'h-8 px-3 rounded text-sm',
      input: 'text-sm',
      prefix: 'text-sm',
      suffix: 'text-sm',
    },
    md: {
      control: 'h-10 px-4 rounded-md text-base',
      input: 'text-base',
      prefix: 'text-base',
      suffix: 'text-base',
    },
    lg: {
      control: 'h-12 px-5 rounded-lg text-lg',
      input: 'text-lg',
      prefix: 'text-lg',
      suffix: 'text-lg',
    },
  }

  return (
    <TextField className={cn(baseFieldClasses, className)} {...props}>
      <Label className={cn(labelClasses)}>{label}</Label>

      <div
        className={cn(
          controlClasses,
          variantClasses[variant].control,
          sizeClasses[size].control,
        )}
      >
        {prefix && (
          <div
            className={cn('text-gray-500 shrink-0', sizeClasses[size].prefix)}
          >
            {prefix}
          </div>
        )}

        <AriaInput 
          className={cn(inputClasses, sizeClasses[size].input)} 
          placeholder={placeholder}
        />

        {suffix && (
          <div
            className={cn('text-gray-500 shrink-0', sizeClasses[size].suffix)}
          >
            {suffix}
          </div>
        )}
      </div>

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
    </TextField>
  )
}
