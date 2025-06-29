import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const glassEffect = cva(
  [
    "backdrop-blur-xl",
    "bg-white/10",
    "border border-white/20",
    "shadow-lg shadow-black/25",
    "rounded-xl",
    "transition-all duration-300",
  ].join(" ")
);

export const glassHover = cva(
  [
    "hover:backdrop-blur-2xl",
    "hover:bg-white/15",
    "hover:border-white/30",
    "hover:shadow-xl hover:shadow-black/40",
    "hover:transform hover:-translate-y-1",
  ].join(" ")
);

export const glassGradient = cva(
  "bg-gradient-to-br from-white/20 via-white/10 to-transparent",
  {
    variants: {
      intensity: {
        light: "from-white/10 via-white/5 to-transparent",
        medium: "from-white/20 via-white/10 to-transparent",
        strong: "from-white/30 via-white/15 to-transparent",
      },
      direction: {
        "top-bottom": "bg-gradient-to-b",
        "bottom-top": "bg-gradient-to-t",
        "left-right": "bg-gradient-to-r",
        "right-left": "bg-gradient-to-l",
        "diagonal-br": "bg-gradient-to-br",
        "diagonal-bl": "bg-gradient-to-bl",
        "diagonal-tr": "bg-gradient-to-tr",
        "diagonal-tl": "bg-gradient-to-tl",
      },
    },
    defaultVariants: {
      intensity: "medium",
      direction: "diagonal-br",
    },
  }
);

export const combineGlassClasses = (
  className?: string,
  includeHover = true
) => {
  return cn(glassEffect(), includeHover && glassHover(), className);
};
