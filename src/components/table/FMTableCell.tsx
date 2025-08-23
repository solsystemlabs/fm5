import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { Cell } from "react-aria-components";

export default function FMTableCell({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <Cell
      className={clsx(
        "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell dark:text-gray-400",
        className,
      )}
    >
      {children}
    </Cell>
  );
}
