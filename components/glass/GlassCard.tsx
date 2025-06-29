import React from "react";
import {
  combineGlassClasses,
  glassGradient,
} from "@/components/design-system/glass/utils";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  intensity?: "light" | "medium" | "strong";
  gradient?: boolean;
  gradientDirection?:
    | "top-bottom"
    | "bottom-top"
    | "left-right"
    | "right-left"
    | "diagonal-br"
    | "diagonal-bl"
    | "diagonal-tr"
    | "diagonal-tl";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      hover = true,
      intensity = "medium",
      gradient = false,
      gradientDirection = "diagonal-br",
      ...props
    },
    ref
  ) => {
    const glassClasses = combineGlassClasses(className, hover);

    return (
      <div
        ref={ref}
        className={cn(
          glassClasses,
          gradient && glassGradient({ intensity, direction: gradientDirection })
        )}
        {...props}
      >
        {/* Noise texture overlay for more realistic glass effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay">
          <svg width="100%" height="100%">
            <filter id="noiseFilter">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.9"
                numOctaves="4"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
