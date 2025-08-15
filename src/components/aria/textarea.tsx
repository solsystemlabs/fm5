import * as React from "react"
import { TextArea as AriaTextArea, type TextAreaProps as AriaTextAreaProps } from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const textareaVariants = tv({
  base: [
    "flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "invalid:border-destructive invalid:ring-destructive/20",
    "resize-none",
    "md:text-sm",
  ],
})

export interface TextareaProps 
  extends Omit<AriaTextAreaProps, "className"> {
  className?: string | ((states: any) => string)
}

function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <AriaTextArea
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(textareaVariants(), computedClassName)
      }}
      data-slot="textarea"
      {...props}
    />
  )
}

export { Textarea, textareaVariants }