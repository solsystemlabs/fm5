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
}

export default function FMButton({
  secondary = false,
  soft,
  rounded,
  children,
  className,
  size = "lg",
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

  return (
    <Button
      className={twMerge(
        clsx(
          "bg-pewter-700 hover:bg-pewter-800 focus-visible:outline-ring cursor-pointer rounded-md text-sm font-semibold text-white shadow-md hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-pewter-500 dark:hover:bg-pewter-400 dark:text-pewter-950",
          secondary
            ? "text-pewter-700 bg-pewter-100 hover:bg-pewter-200 border border-pewter-300 dark:text-pewter-200 dark:bg-pewter-800 dark:hover:bg-pewter-700 dark:border-pewter-600"
            : "",
          soft
            ? "bg-satin-linen-200 text-satin-linen-800 hover:bg-satin-linen-300 dark:bg-satin-linen-800 dark:text-satin-linen-200 dark:hover:bg-satin-linen-700"
            : "",
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
