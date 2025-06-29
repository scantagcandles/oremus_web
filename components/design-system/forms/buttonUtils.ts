import { cva } from "class-variance-authority";

export const buttonBase = cva(
  [
    "inline-flex items-center justify-center",
    "font-medium",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "active:scale-95",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-500 hover:bg-primary-600",
          "text-white",
          "border border-transparent",
          "focus:ring-primary-500/50",
        ],
        secondary: [
          "bg-secondary-500 hover:bg-secondary-600",
          "text-white",
          "border border-transparent",
          "focus:ring-secondary-500/50",
        ],
        outline: [
          "bg-transparent",
          "border border-white/20",
          "text-white hover:text-primary-500",
          "hover:border-primary-500",
          "focus:ring-primary-500/50",
        ],
        glass: [
          "bg-white/10 hover:bg-white/20",
          "backdrop-blur-md",
          "border border-white/20",
          "text-white",
          "focus:ring-white/50",
        ],
        ghost: [
          "bg-transparent hover:bg-white/10",
          "text-white",
          "border border-transparent",
          "focus:ring-white/50",
        ],
      },
      size: {
        xs: "px-2.5 py-1.5 text-xs",
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "lg",
      fullWidth: false,
    },
  }
);

export const iconButtonBase = cva(
  [
    "inline-flex items-center justify-center",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "active:scale-95",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-500 hover:bg-primary-600",
          "text-white",
          "focus:ring-primary-500/50",
        ],
        secondary: [
          "bg-secondary-500 hover:bg-secondary-600",
          "text-white",
          "focus:ring-secondary-500/50",
        ],
        outline: [
          "bg-transparent",
          "border border-white/20",
          "text-white hover:text-primary-500",
          "hover:border-primary-500",
          "focus:ring-primary-500/50",
        ],
        glass: [
          "bg-white/10 hover:bg-white/20",
          "backdrop-blur-md",
          "border border-white/20",
          "text-white",
          "focus:ring-white/50",
        ],
        ghost: [
          "bg-transparent hover:bg-white/10",
          "text-white",
          "focus:ring-white/50",
        ],
      },
      size: {
        sm: "p-1",
        md: "p-2",
        lg: "p-3",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "lg",
    },
  }
);
