import type { ReactNode } from "react";
import Container from "./Container";
import { cn } from "@/ui/cn";

export default function Section({
  children,
  id,
  className = "",
  containerClassName = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
