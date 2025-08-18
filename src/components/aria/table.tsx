import * as React from "react"
import { 
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Column as AriaColumn,
  Row as AriaRow,
  Cell as AriaCell,
  type TableProps as AriaTableProps,
  type TableHeaderProps as AriaTableHeaderProps,
  type TableBodyProps as AriaTableBodyProps,
  type ColumnProps as AriaColumnProps,
  type RowProps as AriaRowProps,
  type CellProps as AriaCellProps
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const tableVariants = tv({
  base: "w-full caption-bottom text-sm",
})

const tableHeaderVariants = tv({
  base: "[&_tr]:border-b",
})

const tableBodyVariants = tv({
  base: "[&_tr:last-child]:border-0",
})

const tableFooterVariants = tv({
  base: "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
})

const tableRowVariants = tv({
  base: [
    "border-b transition-colors",
    "hover:bg-muted/50",
    "selected:bg-muted",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ],
})

const tableHeadVariants = tv({
  base: [
    "h-10 px-2 text-left align-middle font-medium text-foreground",
    "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  ],
})

const tableCellVariants = tv({
  base: [
    "p-2 align-middle",
    "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  ],
})

const tableCaptionVariants = tv({
  base: "mt-4 text-sm text-muted-foreground",
})

// For cases where React Aria Table isn't needed, provide basic styled components
export interface TableProps extends React.ComponentProps<"table"> {
  className?: string
}

export interface TableHeaderProps extends React.ComponentProps<"thead"> {
  className?: string
}

export interface TableBodyProps extends React.ComponentProps<"tbody"> {
  className?: string
}

export interface TableFooterProps extends React.ComponentProps<"tfoot"> {
  className?: string
}

export interface TableRowProps extends React.ComponentProps<"tr"> {
  className?: string
}

export interface TableHeadProps extends React.ComponentProps<"th"> {
  className?: string
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  className?: string
}

export interface TableCaptionProps extends React.ComponentProps<"caption"> {
  className?: string
}

// Simple styled table components (for backward compatibility)
function Table({ className, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-x-auto" data-slot="table-container">
      <table
        data-slot="table"
        className={cn(tableVariants(), className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(tableHeaderVariants(), className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(tableBodyVariants(), className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(tableFooterVariants(), className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants(), className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants(), className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants(), className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(tableCaptionVariants(), className)}
      {...props}
    />
  )
}

// React Aria Table components (for interactive tables)
export interface ReactAriaTableProps extends AriaTableProps {
  className?: string | ((states: any) => string)
}

function AriaTableComponent({ className, ...props }: ReactAriaTableProps) {
  return (
    <div className="relative w-full overflow-x-auto">
      <AriaTable
        className={(renderProps) => {
          const computedClassName = typeof className === "function" 
            ? className(renderProps)
            : className
          
          return cn(tableVariants(), computedClassName)
        }}
        {...props}
      />
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  AriaTableComponent as AriaTable,
  AriaTableHeader,
  AriaTableBody,
  AriaColumn,
  AriaRow,
  AriaCell,
}