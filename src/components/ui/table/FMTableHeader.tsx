import clsx from "clsx";
import type { ReactNode } from "react";
import { Row, TableHeader } from "react-aria-components";
import { twMerge } from "tailwind-merge";

const FMTableHeader = ({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode => {
  return (
    <TableHeader className={twMerge(clsx("bg-secondary", className))}>
      {children}
    </TableHeader>
  );
};

FMTableHeader.Row = ({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode => {
  return (
    <Row className={twMerge(clsx("divide-border divide-y", className))}>
      {children}
    </Row>
  );
};

export default FMTableHeader;
