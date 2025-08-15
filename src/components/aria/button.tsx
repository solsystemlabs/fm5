import * as React from "react"
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "pressed:scale-95",
  ],
  variants: {
    variant: {
      default: [
        "bg-primary text-primary-foreground shadow-sm",
        "hover:bg-primary/90",
        "focus-visible:ring-primary/50",
      ],
      destructive: [
        "bg-destructive text-white shadow-sm",
        "hover:bg-destructive/90",
        "focus-visible:ring-destructive/50",
      ],
      outline: [
        "border border-input bg-background shadow-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-ring/50",
      ],
      secondary: [
        "bg-secondary text-secondary-foreground shadow-sm",
        "hover:bg-secondary/80",
        "focus-visible:ring-secondary/50",
      ],
      ghost: [
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-accent/50",
      ],
      link: [
        "text-primary underline-offset-4",
        "hover:underline",
        "focus-visible:ring-primary/50",
      ],
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps 
  extends Omit<AriaButtonProps, "className">, 
          VariantProps<typeof buttonVariants> {
  className?: string | ((states: any) => string)
}

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(buttonVariants({ variant, size }), computedClassName)
      }}
      data-slot="button"
      {...props}
    />
  )
}

export { Button, buttonVariants }