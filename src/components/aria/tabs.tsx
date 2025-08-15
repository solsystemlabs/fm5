import * as React from "react"
import { 
  Tabs as AriaTabsRoot, 
  TabList, 
  Tab, 
  TabPanel,
  type TabsProps as AriaTabsProps,
  type TabListProps,
  type TabProps,
  type TabPanelProps
} from "react-aria-components"
import { tv } from "tailwind-variants"
import { cn } from "@/lib/utils"

const tabsVariants = tv({
  base: "w-full",
})

const tabsListVariants = tv({
  base: [
    "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
    "w-full"
  ],
})

const tabsTriggerVariants = tv({
  base: [
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
    "ring-offset-background transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "selected:bg-background selected:text-foreground selected:shadow-sm",
    "flex-1",
  ],
})

const tabsContentVariants = tv({
  base: [
    "mt-2 ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ],
})

export interface TabsProps extends AriaTabsProps {
  className?: string | ((states: any) => string)
}

export interface TabsListProps extends TabListProps<any> {
  className?: string | ((states: any) => string)
}

export interface TabsTriggerProps extends TabProps {
  className?: string | ((states: any) => string)
  value: string
}

export interface TabsContentProps extends TabPanelProps {
  className?: string | ((states: any) => string)
  value: string
}

function Tabs({ className, ...props }: TabsProps) {
  return (
    <AriaTabsRoot
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(tabsVariants(), computedClassName)
      }}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabList
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(tabsListVariants(), computedClassName)
      }}
      {...props}
    />
  )
}

function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  return (
    <Tab
      id={value}
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(tabsTriggerVariants(), computedClassName)
      }}
      {...props}
    />
  )
}

function TabsContent({ className, value, ...props }: TabsContentProps) {
  return (
    <TabPanel
      id={value}
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(tabsContentVariants(), computedClassName)
      }}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }