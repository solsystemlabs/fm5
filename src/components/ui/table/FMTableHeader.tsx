import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Row, TableHeader } from "react-aria-components";
import { twMerge } from "tailwind-merge";

const FMTableHeader = ({
  children,
  className,
}: PropsWithChildren & { className?: string }): ReactNode => {
  return (
    <TableHeader className={twMerge(clsx("bg-pewter-100", className))}>
      {children}
    </TableHeader>
  );
};

FMTableHeader.Row = ({
  children,
  className,
}: PropsWithChildren & { className?: string }): ReactNode => {
  return (
    <Row
      className={twMerge(
        clsx("divide-pewter-300 divide-y dark:divide-white/15", className),
      )}
    >
      {children}
    </Row>
  );
};

export default FMTableHeader;
