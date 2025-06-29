"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
  separator?: React.ReactNode;
}

export const Breadcrumbs = ({
  items,
  homeHref = "/",
  className,
  separator = <ChevronRight className="w-4 h-4 text-white/50" />,
}: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumbs" className={twMerge("flex", className)}>
      <ol className="flex items-center space-x-2">
        {/* Home Link */}
        <li>
          <Link
            href={homeHref}
            className={twMerge(
              "flex items-center text-white/70 hover:text-white",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
            )}
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            {/* Separator */}
            <li className="flex items-center" aria-hidden="true">
              {separator}
            </li>

            {/* Breadcrumb Item */}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className={twMerge(
                    "flex items-center",
                    "text-sm text-white/70 hover:text-white",
                    "transition-colors duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
                  )}
                >
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={twMerge(
                    "flex items-center",
                    "text-sm text-white",
                    index === items.length - 1 && "font-medium"
                  )}
                >
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};
