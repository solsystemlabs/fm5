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
          "ring-pewter-300 -mx-4 mt-10 rounded-lg shadow-lg ring-1 sm:mx-0 sm:rounded-lg dark:ring-white/15",
          wrapperClassName,
        ),
      )}
    >
      <Table
        className={twMerge(
          clsx(
            "divide-pewter-300 relative min-w-full divide-y dark:divide-white/15",
            tableClassName,
          ),
        )}
      >
        {children}
      </Table>
    </div>
  );
}
