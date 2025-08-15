import * as React from "react"
import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const labelVariants = tv({
  base: [
    "text-sm font-medium leading-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  ],
})

export interface LabelProps 
  extends Omit<AriaLabelProps, "className"> {
  className?: string | ((states: any) => string)
}

function Label({
  className,
  ...props
}: LabelProps) {
  return (
    <AriaLabel
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(labelVariants(), computedClassName)
      }}
      data-slot="label"
      {...props}
    />
  )
}

export { Label, labelVariants }