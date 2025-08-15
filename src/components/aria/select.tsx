import * as React from "react"
import { 
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  type SelectProps as AriaSelectProps,
  type SelectValueProps as AriaSelectValueProps,
  type ButtonProps,
  type ListBoxProps,
  type ListBoxItemProps,
  type PopoverProps,
} from "react-aria-components"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const selectTriggerVariants = tv({
  base: [
    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
    "placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "invalid:border-destructive invalid:ring-destructive/20",
  ],
})

const selectContentVariants = tv({
  base: [
    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
    "entering:animate-in entering:fade-in-0 entering:zoom-in-95",
    "exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95",
    "placement-bottom:slide-in-from-top-2 placement-top:slide-in-from-bottom-2",
  ],
})

const selectItemVariants = tv({
  base: [
    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
})

export interface SelectProps extends AriaSelectProps<any> {
  className?: string | ((states: any) => string)
  placeholder?: string
  children?: React.ReactNode
}

export interface SelectTriggerProps extends ButtonProps {
  className?: string | ((states: any) => string)
  children?: React.ReactNode
}

export interface SelectContentProps extends PopoverProps {
  className?: string | ((states: any) => string)
  children?: React.ReactNode
}

export interface SelectItemProps extends ListBoxItemProps {
  className?: string | ((states: any) => string)
  children?: React.ReactNode
}

export interface SelectValueProps extends AriaSelectValueProps<any> {
  className?: string | ((states: any) => string)
  placeholder?: string
}

function Select({ className, placeholder, children, ...props }: SelectProps) {
  return (
    <AriaSelect
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn("group", computedClassName)
      }}
      {...props}
    >
      {children}
    </AriaSelect>
  )
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <Button
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(selectTriggerVariants(), computedClassName)
      }}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 opacity-50" aria-hidden="true" />
    </Button>
  )
}

function SelectValue({ className, placeholder, ...props }: SelectValueProps) {
  return (
    <AriaSelectValue
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn("flex-1 truncate", computedClassName)
      }}
      {...props}
    >
      {({ selectedText }) => selectedText || placeholder}
    </AriaSelectValue>
  )
}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  return (
    <Popover
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(selectContentVariants(), computedClassName)
      }}
      {...props}
    >
      <ListBox className="p-1">
        {children}
      </ListBox>
    </Popover>
  )
}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <ListBoxItem
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(selectItemVariants(), computedClassName)
      }}
      {...props}
    >
      {({ isSelected }) => (
        <>
          {children}
          {isSelected && (
            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
              <CheckIcon className="h-4 w-4" />
            </span>
          )}
        </>
      )}
    </ListBoxItem>
  )
}

// Simple wrapper components for compatibility
function SelectGroup({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props}>{children}</div>
}

function SelectLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}