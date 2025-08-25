import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Table } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export default function FMTable({
  children,
  wrapperClassName,
  tableClassName,
}: PropsWithChildren & {
  wrapperClassName?: string;
  tableClassName?: string;
}): ReactNode {
  return (
    <div
      className={twMerge(
        clsx(
          "-mx-4 mt-10 rounded-lg shadow-lg ring-1 ring-pewter-200 dark:ring-pewter-800 sm:mx-0 sm:rounded-lg",
          wrapperClassName,
        ),
      )}
    >
      <Table
        className={twMerge(
          clsx(
            "relative min-w-full divide-y divide-border",
            tableClassName,
          ),
        )}
      >
        {children}
      </Table>
    </div>
  );
}
