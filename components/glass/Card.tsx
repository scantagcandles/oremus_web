import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import type { GlassProps } from "./types";

interface CardProps extends GlassProps {
  title?: string;
  description?: string;
  variant?: "default" | "glass" | "solid" | "outline";
  className?: string;
}

const variants = {
  default: "",
  glass: "bg-white/10 backdrop-blur-md border border-white/20",
  solid: "bg-gray-800",
  outline: "border border-white/20",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      title,
      description,
      blur = "md",
      opacity = 0.1,
      ...props
    },
    ref
  ) => {
    return (
      <GlassCard
        ref={ref}
        className={cn("p-6", className)}
        blur={blur}
        opacity={opacity}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        )}
        {description && <p className="text-white/70 mb-4">{description}</p>}
        {children}
      </GlassCard>
    );
  }
);

Card.displayName = "Card";
