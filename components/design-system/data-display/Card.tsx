import React from "react";
import { GlassCard, type GlassCardProps } from "../glass";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CardProps extends Omit<GlassCardProps, "children" | "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
  footerActions?: React.ReactNode;
  children?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  loading?: boolean;
  error?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      description,
      headerContent,
      headerActions,
      footerContent,
      footerActions,
      children,
      collapsible,
      defaultCollapsed = false,
      loading,
      error,
      className,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

    const hasHeader = title || description || headerContent || headerActions;
    const hasFooter = footerContent || footerActions;

    const toggleCollapse = () => {
      if (collapsible) {
        setIsCollapsed(!isCollapsed);
      }
    };

    return (
      <GlassCard
        ref={ref}
        className={twMerge("overflow-hidden", className)}
        padding="none"
        {...props}
      >
        {/* Header */}
        {hasHeader && (
          <div
            className={twMerge(
              "p-4 border-b border-white/10",
              collapsible && "cursor-pointer select-none"
            )}
            onClick={toggleCollapse}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                )}
                {description && (
                  <p className="mt-1 text-sm text-white/70">{description}</p>
                )}
                {headerContent}
              </div>
              <div className="flex items-center gap-2">
                {headerActions}
                {collapsible && (
                  <ChevronDown
                    className={twMerge(
                      "w-5 h-5 transition-transform duration-200",
                      isCollapsed && "rotate-180"
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence initial={false}>
          {(!collapsible || !isCollapsed) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8 text-red-400">
                    {error}
                  </div>
                ) : (
                  children
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {hasFooter && (
          <div className="flex items-center justify-between gap-4 p-4 border-t border-white/10">
            <div className="flex-1">{footerContent}</div>
            {footerActions && (
              <div className="flex items-center gap-2">{footerActions}</div>
            )}
          </div>
        )}
      </GlassCard>
    );
  }
);

Card.displayName = "Card";
