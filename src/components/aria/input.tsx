import * as React from "react"
import { Input as AriaInput, type InputProps as AriaInputProps } from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const inputVariants = tv({
  base: [
    "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "invalid:border-destructive invalid:ring-destructive/20",
    "md:text-sm",
  ],
})

export interface InputProps 
  extends Omit<AriaInputProps, "className"> {
  className?: string | ((states: any) => string)
}

function Input({
  className,
  ...props
}: InputProps) {
  return (
    <AriaInput
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(inputVariants(), computedClassName)
      }}
      data-slot="input"
      {...props}
    />
  )
}

export { Input, inputVariants }