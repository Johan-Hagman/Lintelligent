import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type CardTone = "default" | "muted" | "subtle";

const toneClasses: Record<CardTone, string> = {
  default: "bg-surface-raised/60 border-divider/60",
  muted: "bg-surface border-divider/70",
  subtle: "bg-surface-tinted/60 border-divider/70",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  tone = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border shadow-surface transition",
        toneClasses[tone],
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  );
}
