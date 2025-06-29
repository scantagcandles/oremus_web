import { cva } from "class-variance-authority";

export const inputBase = cva(
  [
    "w-full",
    "transition-all duration-200 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white/10",
          "border border-white/20",
          "text-white",
          "placeholder:text-white/50",
        ],
        solid: [
          "bg-white",
          "border border-gray-300",
          "text-gray-900",
          "placeholder:text-gray-500",
        ],
        glass: [
          "bg-white/5",
          "backdrop-blur-md",
          "border border-white/20",
          "text-white",
          "placeholder:text-white/50",
        ],
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
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
      state: {
        error: "border-red-500 focus:ring-red-500/50",
        success: "border-green-500 focus:ring-green-500/50",
        warning: "border-yellow-500 focus:ring-yellow-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "lg",
    },
  }
);

export const labelBase = cva(
  ["block", "font-medium", "transition-colors duration-200"],
  {
    variants: {
      variant: {
        default: "text-white/90",
        solid: "text-gray-700",
        glass: "text-white/90",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export const errorMessageBase = cva(
  ["mt-1", "text-sm", "transition-all duration-200"],
  {
    variants: {
      variant: {
        default: "text-red-400",
        solid: "text-red-600",
        glass: "text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
