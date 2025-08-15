import * as React from "react"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const cardVariants = tv({
  base: [
    "rounded-xl border bg-card text-card-foreground shadow-sm",
    "flex flex-col gap-6 py-6",
  ],
})

const cardHeaderVariants = tv({
  base: [
    "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
    "has-[data-slot=card-action]:grid-cols-[1fr_auto]",
    "[&.border-b]:border-b [&.border-b]:pb-6",
  ],
})

const cardTitleVariants = tv({
  base: "font-semibold leading-none",
})

const cardDescriptionVariants = tv({
  base: "text-sm text-muted-foreground",
})

const cardActionVariants = tv({
  base: "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
})

const cardContentVariants = tv({
  base: "px-6",
})

const cardFooterVariants = tv({
  base: [
    "flex items-center px-6",
    "[&.border-t]:border-t [&.border-t]:pt-6",
  ],
})

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants(), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants(), className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants(), className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn(cardDescriptionVariants(), className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(cardActionVariants(), className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants(), className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants(), className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}