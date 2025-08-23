import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { Cell } from "react-aria-components";

export default function FMCell({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <Cell
      className={clsx(
        "px-3 py-3.5 text-sm text-gray-500  dark:text-gray-400",
        className,
      )}
    >
      {children}
    </Cell>
  );
}
