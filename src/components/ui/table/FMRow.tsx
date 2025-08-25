import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Row } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export default function FMRow({
  children,
  className,
}: PropsWithChildren & { className?: string }): ReactNode {
  return (
    <Row
      className={twMerge(
        clsx("not-last:border-b border-border", className),
      )}
    >
      {children}
    </Row>
  );
}
