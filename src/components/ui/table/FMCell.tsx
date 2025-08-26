import clsx from "clsx";
import type { ReactNode } from "react";
import { Cell } from "react-aria-components";

export default function FMCell({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Cell
      className={clsx("text-muted-foreground px-3 py-3.5 text-sm", className)}
    >
      {children}
    </Cell>
  );
}
