import type { HTMLAttributes } from "react";
import { cn } from "@/ui/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  /** Litt tettere padding for kompakte lister/dashbord-celler. */
  compact?: boolean;
}

export default function Card({ selected, compact, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        compact ? "p-4" : "p-5",
        selected
          ? "bg-primary-subtle border border-primary"
          : "bg-surface border border-border shadow-card",
        className
      )}
      {...props}
    />
  );
}

export { Card };
