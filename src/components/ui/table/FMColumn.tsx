import clsx from "clsx";
import type { ReactNode } from "react";
import { Column } from "react-aria-components";

export default function FMColumn({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Column
      className={clsx(
        "text-secondary-foreground px-3 py-3.5 text-left text-sm font-semibold",
        className,
      )}
    >
      {children}
    </Column>
  );
}
