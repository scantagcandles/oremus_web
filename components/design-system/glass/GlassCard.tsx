import React from "react";
import { glassEffect, glassGradient } from "./utils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassEffect> {
  children: React.ReactNode;
  opacity?: "light" | "medium" | "dark";
  gradient?: "default" | "dark" | "primary";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      children,
      blur = "md",
      rounded = "2xl",
      opacity = "medium",
      gradient = "default",
      padding = "md",
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };

    const opacityClasses = {
      light: "bg-white/5",
      medium: "bg-white/10",
      dark: "bg-white/20",
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          glassEffect({ blur, rounded }),
          opacityClasses[opacity],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        <div className={glassGradient({ type: gradient })} />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
