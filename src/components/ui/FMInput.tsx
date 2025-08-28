import clsx from "clsx";
import type { ReactNode } from "react";
import { Input, type InputProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

type FMInputProps = {
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
} & Omit<InputProps, "className">;

export default function FMInput({
  size = "md" as const,
  fullWidth = true,
  className,
  ...props
}: FMInputProps): ReactNode {
  let sizeClass = "";

  switch (size) {
    case "sm":
      sizeClass = "px-2 py-1 text-sm";
      break;
    case "md":
      sizeClass = "px-3 py-2 text-sm";
      break;
    case "lg":
      sizeClass = "px-4 py-3 text-base";
      break;
  }

  return (
    <Input
      className={twMerge(
        clsx(
          "border-input bg-background focus:border-ring focus:ring-ring text-foreground rounded-md border shadow-sm",
          fullWidth ? "w-full" : "",
          sizeClass,
          className,
        ),
      )}
      {...props}
    />
  );
}
