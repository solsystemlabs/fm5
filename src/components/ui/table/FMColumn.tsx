import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Column } from "react-aria-components";

export default function FMColumn({
  children,
  className,
}: PropsWithChildren & { className?: string }): ReactNode {
  return (
    <Column
      className={clsx(
        "px-3 py-3.5 text-left text-sm font-semibold text-pewter-900 dark:text-white",
        className,
      )}
    >
      {children}
    </Column>
  );
}
