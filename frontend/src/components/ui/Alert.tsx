import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type AlertVariant = "info" | "success" | "warning" | "error";

const variantClasses: Record<AlertVariant, string> = {
  info: "border-primary/40 bg-primary/10 text-primary-foreground",
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  error: "border-danger/40 bg-danger/10 text-danger",
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  withIcon?: boolean;
}

export function Alert({
  variant = "info",
  className,
  withIcon = false,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {withIcon && (
        <span aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0">
          {variant === "success" && "✓"}
          {variant === "warning" && "!"}
          {variant === "error" && "⚠"}
          {variant === "info" && "ℹ"}
        </span>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

