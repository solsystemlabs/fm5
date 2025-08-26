import clsx from "clsx";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function FMTableWrapper({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div
      className={twMerge(
        clsx(
          "ring-pewter-200 dark:ring-pewter-800 -mx-4 mt-10 shadow-lg ring-1 sm:mx-0 sm:rounded-lg",
          className,
        ),
      )}
    >
      {children}
    </div>
  );
}
