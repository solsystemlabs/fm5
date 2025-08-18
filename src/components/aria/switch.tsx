import * as React from "react"
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const switchVariants = tv({
  base: [
    "group inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
    "bg-input shadow-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "selected:bg-primary",
    "data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
  ],
})

const switchThumbVariants = tv({
  base: [
    "pointer-events-none block h-3 w-3 rounded-full bg-background shadow-lg ring-0 transition-transform",
    "group-selected:translate-x-3 group-selected:bg-background",
    "translate-x-0",
  ],
})

export interface SwitchProps 
  extends Omit<AriaSwitchProps, "className"> {
  className?: string | ((states: any) => string)
}

function Switch({
  className,
  children,
  ...props
}: SwitchProps) {
  return (
    <AriaSwitch
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(switchVariants(), computedClassName)
      }}
      data-slot="switch"
      {...props}
    >
      {(renderProps) => (
        <>
          <div className={switchThumbVariants()} data-slot="switch-thumb" />
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </AriaSwitch>
  )
}

export { Switch, switchVariants }