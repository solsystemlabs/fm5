import clsx from "clsx";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface FMButtonProps extends Omit<ButtonProps, "className"> {
  secondary?: boolean;
  soft?: boolean;
  rounded?: boolean;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "outline" | "ghost" | "destructive";
}

export default function FMButton({
  secondary = false,
  soft,
  rounded,
  children,
  className,
  size = "lg",
  variant,
  ...props
}: FMButtonProps): ReactNode {
  let sizeClass = "";

  switch (size) {
    case "xs":
      sizeClass = "rounded-sm px-2 py-1 text-xs";
      break;
    case "sm":
      sizeClass = "rounded-sm px-2 py-1";
      break;
    case "md":
      sizeClass = "px-2.5 py-1.5";
      break;
    case "lg":
      sizeClass = "px-3 py-2";
      break;
    case "xl":
      sizeClass = "px-3.5 py-2.5";
  }

  // Determine variant styles - variant prop takes precedence over legacy secondary/soft
  let variantClass = "";
  if (variant === "outline" || (secondary && !variant)) {
    variantClass = "text-pewter-700 bg-pewter-100 hover:bg-pewter-200 border border-pewter-300 dark:text-pewter-200 dark:bg-pewter-800 dark:hover:bg-pewter-700 dark:border-pewter-600";
  } else if (variant === "ghost" || (soft && !variant)) {
    variantClass = "bg-satin-linen-200 text-satin-linen-800 hover:bg-satin-linen-300 dark:bg-satin-linen-800 dark:text-satin-linen-200 dark:hover:bg-satin-linen-700";
  } else if (variant === "destructive") {
    variantClass = "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600";
  } else {
    // Default/primary variant
    variantClass = "bg-pewter-700 hover:bg-pewter-800 focus-visible:outline-ring cursor-pointer text-white shadow-md hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.25)] dark:bg-pewter-500 dark:hover:bg-pewter-400 dark:text-pewter-950";
  }

  return (
    <Button
      className={twMerge(
        clsx(
          "rounded-md text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer",
          variantClass,
          rounded ? "rounded-full" : "",
          sizeClass,
          className,
        ),
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
