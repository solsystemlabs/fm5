import clsx from "clsx";
import type { ReactNode } from "react";
import { Row, type RowProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface FMRowProps extends Omit<RowProps<object>, "className"> {
  children: ReactNode;
  className?: string;
}

export default function FMRow({
  children,
  className,
  ...props
}: FMRowProps): ReactNode {
  return (
    <Row
      className={twMerge(clsx("border-border not-last:border-b", className))}
      {...props}
    >
      {children}
    </Row>
  );
}
