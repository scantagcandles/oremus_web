"use client";

import React from "react";
import {
  navigationBase,
  navigationItemBase,
  type NavigationSection,
} from "./utils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

export interface SidebarProps extends VariantProps<typeof navigationBase> {
  sections: NavigationSection[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  width?: {
    expanded: string;
    collapsed: string;
  };
}

export const Sidebar = ({
  variant = "default",
  position = "left",
  sections,
  header,
  footer,
  isCollapsible = true,
  defaultCollapsed = false,
  className,
  width = {
    expanded: "w-64",
    collapsed: "w-16",
  },
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const pathname = usePathname();

  const toggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <aside
      className={twMerge(
        navigationBase({ variant, position }),
        "flex flex-col",
        isCollapsible && "transition-[width] duration-300 ease-in-out",
        isCollapsed ? width.collapsed : width.expanded,
        className
      )}
    >
      {/* Header */}
      {header && <div className="p-4 border-b border-white/10">{header}</div>}

      {/* Navigation Sections */}
      <div className="flex-1 py-4 overflow-y-auto">
        {sections.map((section, index) => (
          <div key={section.label || index} className="px-2 mb-6 last:mb-0">
            {section.label && !isCollapsed && (
              <h3 className="px-3 mb-2 text-sm font-medium text-white/50">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={twMerge(
                    navigationItemBase({
                      variant: pathname === item.href ? "active" : "default",
                      size: "md",
                    }),
                    "flex w-full",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon && (
                    <span className={!isCollapsed ? "mr-3" : undefined}>
                      {item.icon}
                    </span>
                  )}
                  {!isCollapsed && item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && <div className="p-4 border-t border-white/10">{footer}</div>}

      {/* Collapse Button */}
      {isCollapsible && (
        <button
          onClick={toggleCollapse}
          className={twMerge(
            "absolute -right-3 top-1/2 -translate-y-1/2",
            "w-6 h-6 rounded-full",
            "bg-primary-500 text-white",
            "flex items-center justify-center",
            "transition-transform duration-300",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            isCollapsed && "rotate-180"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
};
