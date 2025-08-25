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
          "ring-pewter-300 -mx-4 mt-10 shadow-lg ring-1 sm:mx-0 sm:rounded-lg dark:ring-white/15",
          className,
        ),
      )}
    >
      {children}
    </div>
  );
}
