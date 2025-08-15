import * as React from "react"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"

const avatarVariants = tv({
  base: "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
})

const avatarImageVariants = tv({
  base: "aspect-square h-full w-full object-cover",
})

const avatarFallbackVariants = tv({
  base: "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium",
})

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn(avatarVariants(), className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      className={cn(avatarImageVariants(), className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants(), className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }