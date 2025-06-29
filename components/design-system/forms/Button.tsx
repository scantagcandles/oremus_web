import React from "react";
import { buttonBase, iconButtonBase } from "./buttonUtils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof buttonBase> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      rounded = "lg",
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          buttonBase({ variant, size, rounded, fullWidth }),
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export interface IconButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "size" | "children"
    >,
    VariantProps<typeof iconButtonBase> {
  loading?: boolean;
  icon: React.ReactNode;
  tooltip?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      rounded = "lg",
      loading,
      icon,
      tooltip,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          iconButtonBase({ variant, size, rounded }),
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        title={tooltip}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
