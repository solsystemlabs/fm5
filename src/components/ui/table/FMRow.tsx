import clsx from "clsx";
import type { ReactNode } from "react";
import { Row } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export default function FMRow({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Row
      className={twMerge(clsx("border-border not-last:border-b", className))}
    >
      {children}
    </Row>
  );
}
