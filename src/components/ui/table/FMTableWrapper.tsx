import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function FMTableWrapper({
  children,
  className,
}: PropsWithChildren & { className?: string }): ReactNode {
  return (
    <div
      className={twMerge(
        clsx(
          "-mx-4 mt-10 shadow-lg ring-1 ring-pewter-200 dark:ring-pewter-800 sm:mx-0 sm:rounded-lg",
          className,
        ),
      )}
    >
      {children}
    </div>
  );
}
