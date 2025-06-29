import React from "react";
import { twMerge } from "tailwind-merge";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        "rounded-2xl border border-white/20 shadow-xl",
        "bg-white/10 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
