"use client";

import React from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";

const listBase = cva(["divide-y", "transition-colors duration-200"], {
  variants: {
    variant: {
      default: ["divide-white/10"],
      glass: ["divide-white/20", "bg-white/5", "backdrop-blur-md"],
    },
    rounded: {
      none: "",
      sm: "rounded-sm overflow-hidden",
      md: "rounded-md overflow-hidden",
      lg: "rounded-lg overflow-hidden",
    },
    bordered: {
      true: "border border-white/20",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    rounded: "lg",
    bordered: true,
  },
});

const listItemBase = cva(["relative", "transition-colors duration-200"], {
  variants: {
    variant: {
      default: ["hover:bg-white/5"],
      glass: ["hover:bg-white/10"],
    },
    padding: {
      none: "",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
    interactive: {
      true: "cursor-pointer",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    interactive: false,
  },
});

export interface ListProps extends VariantProps<typeof listBase> {
  children: React.ReactNode;
  className?: string;
}

export const List = React.forwardRef<HTMLDivElement, ListProps>(
  (
    {
      variant = "default",
      rounded = "lg",
      bordered = true,
      className,
      children,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={twMerge(listBase({ variant, rounded, bordered }), className)}
      >
        {children}
      </div>
    );
  }
);

List.displayName = "List";

export interface ListItemProps extends VariantProps<typeof listItemBase> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  icon?: React.ReactNode;
  chevron?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      variant = "default",
      padding = "md",
      interactive = false,
      className,
      children,
      onClick,
      href,
      target,
      icon,
      chevron,
      selected,
      disabled,
    },
    ref
  ) => {
    const isInteractive = interactive || !!onClick || !!href;

    const baseClasses = twMerge(
      listItemBase({ variant, padding, interactive: isInteractive }),
      selected && "bg-primary-500/20 hover:bg-primary-500/30",
      disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    );

    const contentJSX = (
      <div className="flex items-center gap-4">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">{children}</div>
        {chevron && <ChevronRight className="w-5 h-5 shrink-0 text-white/50" />}
      </div>
    );

    // Jeśli jest href, użyj Next.js Link
    if (href && !disabled) {
      return (
        <Link
          href={href}
          target={target}
          className={baseClasses}
          onClick={disabled ? undefined : onClick}
          ref={ref as any}
        >
          {contentJSX}
        </Link>
      );
    }

    // W przeciwnym razie użyj div
    return (
      <div
        ref={ref}
        className={baseClasses}
        onClick={disabled ? undefined : onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
      >
        {contentJSX}
      </div>
    );
  }
);

ListItem.displayName = "ListItem";
