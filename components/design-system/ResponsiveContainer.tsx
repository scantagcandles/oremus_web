import React from "react";
import { twMerge } from "tailwind-merge";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

const maxWidthValues = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = "",
  maxWidth = "xl",
  padding = true,
}) => {
  const baseClasses = "w-full mx-auto";
  const maxWidthClass = maxWidthValues[maxWidth];
  const paddingClass = padding ? "px-4 sm:px-6 lg:px-8" : "";

  return (
    <div
      className={twMerge(baseClasses, maxWidthClass, paddingClass, className)}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
