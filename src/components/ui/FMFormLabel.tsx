import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Label, LabelProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface FMFormLabelProps extends Omit<LabelProps, "className"> {
  className?: string;
}

export default function FMFormLabel({
  className,
  children,
  ...props
}: FMFormLabelProps & PropsWithChildren): ReactNode {
  return (
    <Label
      className={twMerge(
        clsx("text-foreground block text-sm font-medium", className),
      )}
      {...props}
    >
      {children}
    </Label>
  );
}
