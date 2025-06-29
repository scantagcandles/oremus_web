import { cva } from "class-variance-authority";

export const navigationBase = cva(
  ["fixed z-50", "transition-all duration-300 ease-in-out"],
  {
    variants: {
      variant: {
        default: [
          "bg-slate-900/80",
          "border-b border-white/10",
          "backdrop-blur-xl",
        ],
        glass: ["bg-white/5", "border-b border-white/20", "backdrop-blur-xl"],
        transparent: ["bg-transparent", "border-b border-transparent"],
      },
      position: {
        top: "top-0 inset-x-0",
        bottom: "bottom-0 inset-x-0",
        left: "left-0 inset-y-0",
        right: "right-0 inset-y-0",
      },
      size: {
        sm: "h-12",
        md: "h-16",
        lg: "h-20",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "top",
      size: "md",
    },
  }
);

export const navigationItemBase = cva(
  [
    "relative",
    "inline-flex items-center",
    "transition-all duration-200",
    "focus:outline-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-white/70 hover:text-white",
          "focus-visible:ring-2 focus-visible:ring-white/50",
        ],
        active: [
          "text-white",
          "after:absolute after:bottom-0 after:left-0 after:right-0",
          "after:h-0.5 after:bg-primary-500",
          "focus-visible:ring-2 focus-visible:ring-primary-500/50",
        ],
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isExternal?: boolean;
}

export interface NavigationSection {
  label?: string;
  items: NavigationItem[];
}
