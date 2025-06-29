import React from "react";
import { twMerge } from "tailwind-merge";

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
}

const colsToGridClass = (cols: number) => `grid-cols-${cols}`;

const gapValues = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className = "",
  cols = {
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
  },
  gap = "md",
}) => {
  const baseClasses = "grid w-full";
  const gapClass = gapValues[gap];
  const gridCols = [
    cols.base && colsToGridClass(cols.base),
    cols.sm && `sm:${colsToGridClass(cols.sm)}`,
    cols.md && `md:${colsToGridClass(cols.md)}`,
    cols.lg && `lg:${colsToGridClass(cols.lg)}`,
    cols.xl && `xl:${colsToGridClass(cols.xl)}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={twMerge(baseClasses, gapClass, gridCols, className)}>
      {children}
    </div>
  );
};

export default AdaptiveGrid;
