import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Row, TableHeader } from "react-aria-components";
import { twMerge } from "tailwind-merge";

const FMTableHeader = ({
  children,
  className,
}: PropsWithChildren & { className?: string }): ReactNode => {
  return (
    <TableHeader className={twMerge(clsx("bg-secondary", className))}>
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
        clsx("divide-y divide-border", className),
      )}
    >
      {children}
    </Row>
  );
};

export default FMTableHeader;
