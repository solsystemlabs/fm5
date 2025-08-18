import * as React from "react"
import { 
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Heading,
  type DialogProps as AriaDialogProps,
  type DialogTriggerProps as AriaDialogTriggerProps,
  type ModalOverlayProps as AriaModalOverlayProps,
  type HeadingProps
} from "react-aria-components"
import { XIcon } from "lucide-react"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"
import { Button } from "./button"

const overlayVariants = tv({
  base: [
    "fixed inset-0 z-50 bg-black/50",
    "entering:animate-in entering:fade-in-0",
    "exiting:animate-out exiting:fade-out-0",
  ],
})

const contentVariants = tv({
  base: [
    "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4",
    "border bg-background p-6 shadow-lg duration-200 rounded-lg",
    "entering:animate-in entering:fade-in-0 entering:zoom-in-95",
    "exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95",
    "sm:max-w-lg",
  ],
})

const headerVariants = tv({
  base: "flex flex-col space-y-1.5 text-center sm:text-left",
})

const footerVariants = tv({
  base: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
})

const titleVariants = tv({
  base: "text-lg font-semibold leading-none tracking-tight",
})

const descriptionVariants = tv({
  base: "text-sm text-muted-foreground",
})

export interface DialogProps extends AriaDialogTriggerProps {
  className?: string
}

export interface DialogTriggerProps extends AriaDialogTriggerProps {}

export interface ModalOverlayProps extends AriaModalOverlayProps {
  className?: string | ((states: any) => string)
}

export interface DialogContentProps extends AriaModalOverlayProps {
  className?: string | ((states: any) => string)
  showCloseButton?: boolean
  children?: React.ReactNode | ((props: any) => React.ReactNode)
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogTitleProps extends HeadingProps {
  className?: string
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function Dialog({ children, ...props }: DialogProps) {
  return (
    <AriaDialogTrigger {...props}>
      {children}
    </AriaDialogTrigger>
  )
}

function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  return <>{children}</>
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <AriaModalOverlay
      className={(renderProps) => {
        return cn(overlayVariants())
      }}
      {...props}
    >
      <AriaModal
        className={(renderProps) => {
          const computedClassName = typeof className === "function" 
            ? className(renderProps)
            : className
          
          return cn(contentVariants(), computedClassName)
        }}
      >
        <AriaDialog className="outline-none">
          {(props) => (
            <>
              {typeof children === 'function' ? children(props) : children}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none h-6 w-6"
                  onPress={props.close}
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}
            </>
          )}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  )
}

function DialogHeader({
  className,
  ...props
}: DialogHeaderProps) {
  return (
    <div
      className={cn(headerVariants(), className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={cn(footerVariants(), className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: DialogTitleProps) {
  return (
    <Heading
      slot="title"
      className={cn(titleVariants(), className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <p
      className={cn(descriptionVariants(), className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}