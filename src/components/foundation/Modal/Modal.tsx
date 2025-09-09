import type { ModalOverlayProps } from 'react-aria-components'
import {
  Modal as AriaModal,
  Dialog,
  DialogTrigger,
  Heading,
  ModalOverlay,
} from 'react-aria-components'
import { cn } from '../../utils/cn'
import { Button } from '../Button'
import type { ButtonProps } from '../Button'

export interface ModalProps extends Omit<ModalOverlayProps, 'className'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title: string
  children: React.ReactNode
  primaryAction?: {
    label: string
    onPress: () => void
    isLoading?: boolean
    variant?: ButtonProps['variant']
  }
  secondaryAction?: {
    label: string
    onPress: () => void
  }
  className?: string
}

export function Modal({
  size = 'md',
  title,
  children,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: ModalProps) {
  const overlayClasses = [
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    'bg-black/50 backdrop-blur-sm',
    'entering:animate-in entering:fade-in-0',
    'exiting:animate-out exiting:fade-out-0',
  ]

  const modalClasses = [
    'relative bg-white rounded-lg shadow-xl',
    'max-h-[85vh] flex flex-col',
    'entering:animate-in entering:zoom-in-95 entering:slide-in-from-bottom-2',
    'exiting:animate-out exiting:zoom-out-95 exiting:slide-out-to-bottom-2',
  ]

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    full: 'w-full max-w-none h-full max-h-none rounded-none',
  }

  const headerClasses = [
    'flex items-center justify-between p-6 border-b border-gray-200',
    'shrink-0',
  ]

  const contentClasses = ['flex-1 p-6 overflow-y-auto']

  const footerClasses = [
    'flex items-center justify-end gap-3 p-6 border-t border-gray-200',
    'shrink-0',
  ]

  const hasFooter = primaryAction || secondaryAction

  return (
    <ModalOverlay className={cn(overlayClasses)} {...props}>
      <AriaModal className={cn(modalClasses, sizeClasses[size], className)}>
        <Dialog className="flex flex-col h-full outline-none">
          <div className={cn(headerClasses)}>
            <Heading
              slot="title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </Heading>
            <button
              className={cn(
                'p-1 rounded-md text-gray-400 hover:text-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
              )}
              onPress={() => props.onOpenChange?.(false)}
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className={cn(contentClasses)}>{children}</div>

          {hasFooter && (
            <div className={cn(footerClasses)}>
              {secondaryAction && (
                <Button variant="tertiary" onPress={secondaryAction.onPress}>
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'primary'}
                  isLoading={primaryAction.isLoading}
                  onPress={primaryAction.onPress}
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}

// Export a trigger wrapper for convenience
export interface ModalTriggerProps {
  children: React.ReactNode
  modal: React.ReactElement<ModalProps>
}

export function ModalTrigger({ children, modal }: ModalTriggerProps) {
  return (
    <DialogTrigger>
      {children}
      {modal}
    </DialogTrigger>
  )
}

