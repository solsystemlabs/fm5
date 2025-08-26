import clsx from "clsx";
import type { ReactNode } from "react";
import { Table } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export default function FMTable({
  children,
  wrapperClassName,
  tableClassName,
}: {
  children: ReactNode;
  wrapperClassName?: string;
  tableClassName?: string;
}): ReactNode {
  return (
    <div
      className={twMerge(
        clsx(
          "ring-pewter-200 dark:ring-pewter-800 -mx-4 mt-10 rounded-lg shadow-lg ring-1 sm:mx-0 sm:rounded-lg",
          wrapperClassName,
        ),
      )}
    >
      <Table
        className={twMerge(
          clsx("divide-border relative min-w-full divide-y", tableClassName),
        )}
      >
        {children}
      </Table>
    </div>
  );
}
