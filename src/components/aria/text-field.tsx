import * as React from "react"
import { 
  TextField as AriaTextField, 
  type TextFieldProps as AriaTextFieldProps,
  FieldError,
  Text
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Label } from "./label"

const textFieldVariants = tv({
  base: "space-y-2",
})

const fieldErrorVariants = tv({
  base: "text-sm text-destructive",
})

const descriptionVariants = tv({
  base: "text-sm text-muted-foreground",
})

export interface TextFieldProps 
  extends Omit<AriaTextFieldProps, "className"> {
  className?: string | ((states: any) => string)
  label?: string
  description?: string
  errorMessage?: string
  placeholder?: string
  inputClassName?: string | ((states: any) => string)
  labelClassName?: string | ((states: any) => string)
}

function TextField({
  className,
  label,
  description,
  errorMessage,
  placeholder,
  inputClassName,
  labelClassName,
  children,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      className={(renderProps) => {
        const computedClassName = typeof className === "function" 
          ? className(renderProps)
          : className
        
        return cn(textFieldVariants(), computedClassName)
      }}
      {...props}
    >
      {(renderProps) => (
        <>
          {label && (
            <Label className={labelClassName}>
              {label}
            </Label>
          )}
          <Input 
            placeholder={placeholder}
            className={inputClassName}
          />
          {description && (
            <Text className={descriptionVariants()}>
              {description}
            </Text>
          )}
          <FieldError className={fieldErrorVariants()}>
            {errorMessage}
          </FieldError>
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </AriaTextField>
  )
}

export { TextField, textFieldVariants }