import { forwardRef } from "react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  Ref,
  MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-emphasis focus-visible:ring-primary",
  secondary:
    "bg-surface-tinted text-text hover:bg-surface focus-visible:ring-primary",
  success:
    "bg-success text-white hover:bg-success/90 focus-visible:ring-success",
  danger: "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
  ghost:
    "bg-transparent text-text-subtle hover:bg-surface/60 hover:text-text focus-visible:ring-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type PolymorphicButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "className" | "disabled">;

function ButtonBase<T extends ElementType = "button">(
  props: PolymorphicButtonProps<T>,
  ref: Ref<Element>
): ReactElement | null {
  const {
    as,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    className,
    children,
    ...rest
  } = props;

  const Component = (as || "button") as ElementType;
  const isButtonElement = Component === "button";
  const isDisabled = Boolean(disabled || isLoading);
  const { onClick, tabIndex, ...restProps } =
    rest as ComponentPropsWithoutRef<T> & {
      onClick?: (event: ReactMouseEvent<Element>) => void;
      tabIndex?: number;
    };

  const handleClick = (event: ReactMouseEvent<Element>) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Component
      ref={ref as never}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isButtonElement ? isDisabled : undefined}
      {...(isButtonElement
        ? {
            type: (rest as ComponentPropsWithoutRef<"button">).type ?? "button",
          }
        : {
            "aria-disabled": isDisabled || undefined,
            tabIndex: isDisabled ? -1 : tabIndex,
          })}
      onClick={handleClick}
      {...restProps}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      <span>{children}</span>
    </Component>
  );
}

export const Button = forwardRef(ButtonBase) as <
  T extends ElementType = "button"
>(
  props: PolymorphicButtonProps<T> & { ref?: Ref<Element> }
) => ReactElement | null;
