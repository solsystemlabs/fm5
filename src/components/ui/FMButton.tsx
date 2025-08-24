import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "react-aria-components";
import { twMerge } from "tailwind-merge";

type FMButtonProps = {
  secondary?: boolean;
  soft?: boolean;
  rounded?: boolean;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
} & PropsWithChildren;

export default function FMButton({
  secondary = false,
  soft,
  rounded,
  children,
  className,
  size = "lg",
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
          "rounded-md text-sm font-semibold text-white shadow-md hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 dark:shadow-none cursor-pointer",
          secondary
            ? "bg-white text-pewter-900 inset-ring inset-ring-pewter-300 hover:bg-pewter-50 dark:bg-white/10 dark:inset-ring-white/5 dark:hover:bg-white/20"
            : "bg-pewter-400 hover:bg-pewter-500 focus-visible:outline-pewter-600 dark:bg-pewter-500 dark:hover:bg-pewter-400 dark:focus-visible:outline-pewter-500",
          soft
            ? "bg-pewter-100 text-pewter-700 hover:bg-pewter-200 dark:bg-pewter-500/20 dark:text-pewter-400 dark:hover:bg-pewter-500/30"
            : "",
          rounded ? "rounded-full" : "",
          sizeClass,
          className,
        ),
      )}
    >
      {children}
    </Button>
  );
}
