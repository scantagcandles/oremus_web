import React from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-gold-400 to-gold-600 text-white hover:from-gold-500 hover:to-gold-700",
  secondary:
    "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20",
  ghost: "hover:bg-white/10 text-white",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  isLoading = false,
  icon,
}) => {
  const baseClasses =
    "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={twMerge(
        baseClasses,
        variantClass,
        sizeClass,
        disabledClass,
        className
      )}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {icon && !isLoading && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
