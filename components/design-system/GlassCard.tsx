import React from "react";
import { twMerge } from "tailwind-merge";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg";
  opacity?: "light" | "medium" | "dark";
  hover?: boolean;
  onClick?: () => void;
}

const blurValues = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
};

const opacityValues = {
  light: "bg-opacity-10",
  medium: "bg-opacity-20",
  dark: "bg-opacity-30",
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  blur = "md",
  opacity = "medium",
  hover = false,
  onClick,
}) => {
  const baseClasses = "rounded-2xl bg-white border border-white/20 shadow-xl";
  const blurClass = blurValues[blur];
  const opacityClass = opacityValues[opacity];
  const hoverClass = hover
    ? "hover:scale-105 transition-transform duration-300"
    : "";

  return (
    <div
      className={twMerge(
        baseClasses,
        blurClass,
        opacityClass,
        hoverClass,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
