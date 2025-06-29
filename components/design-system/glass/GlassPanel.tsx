import React from "react";
import { glassEffect, glassGradient } from "./utils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";

export interface GlassPanelProps extends VariantProps<typeof glassEffect> {
  children: React.ReactNode;
  className?: string;
  opacity?: "light" | "medium" | "dark";
  gradient?: "default" | "dark" | "primary";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      className,
      children,
      blur = "md",
      rounded = "2xl",
      opacity = "medium",
      gradient = "default",
      padding = "md",
      animate = true,
      onClick,
      onMouseEnter,
      onMouseLeave,
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

    const commonProps = {
      ref,
      className: twMerge(
        glassEffect({ blur, rounded }),
        opacityClasses[opacity],
        paddingClasses[padding],
        className
      ),
      onClick,
      onMouseEnter,
      onMouseLeave,
    };

    const content = (
      <>
        <div className={glassGradient({ type: gradient })} />
        <div className="relative z-10">{children}</div>
      </>
    );

    if (animate) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            {...commonProps}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      );
    }

    return <div {...commonProps}>{content}</div>;
  }
);

GlassPanel.displayName = "GlassPanel";

GlassPanel.displayName = "GlassPanel";
