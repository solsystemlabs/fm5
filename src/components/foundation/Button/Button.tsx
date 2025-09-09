import {
  Button as AriaButton
  
} from 'react-aria-components'
import { cn } from '../../utils/cn'
import type {ButtonProps as AriaButtonProps} from 'react-aria-components';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'children'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  children?: React.ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = [
    // Base button styles
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'border',
  ]

  const variantClasses = {
    primary: [
      'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
      'text-white border-primary-600 hover:border-primary-700',
    ],
    secondary: [
      'bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800',
      'text-white border-secondary-600 hover:border-secondary-700',
    ],
    tertiary: [
      'bg-white hover:bg-gray-50 active:bg-gray-100',
      'text-gray-700 border-gray-300 hover:border-gray-400',
    ],
    danger: [
      'bg-red-600 hover:bg-red-700 active:bg-red-800',
      'text-white border-red-600 hover:border-red-700',
    ],
    ghost: [
      'bg-transparent hover:bg-gray-100 active:bg-gray-200',
      'text-gray-700 border-transparent',
    ],
  }

  const sizeClasses = {
    sm: ['h-8 px-3 text-sm rounded'],
    md: ['h-10 px-4 text-base rounded-md'],
    lg: ['h-12 px-6 text-lg rounded-lg'],
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <AriaButton
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isLoading && 'cursor-wait',
        className,
      )}
      isDisabled={props.isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              iconSizeClasses[size],
            )}
          />
          {children && <span className="sr-only">{children}</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={cn('shrink-0', iconSizeClasses[size])} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={cn('shrink-0', iconSizeClasses[size])} />
          )}
        </>
      )}
    </AriaButton>
  )
}
