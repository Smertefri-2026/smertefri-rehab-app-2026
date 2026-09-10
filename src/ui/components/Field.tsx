import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/ui/cn";

const controlBase =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink " +
  "placeholder:text-ink-faint " +
  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary " +
  "disabled:bg-surface-alt disabled:text-ink-faint";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="block text-[13px] font-medium text-ink-soft">{label}</label>}
      {children}
      {error ? (
        <p className="text-[13px] text-danger-ink">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlBase, "appearance-none pr-8", className)} {...props} />;
}
