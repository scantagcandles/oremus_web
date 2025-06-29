import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const combineClasses = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 hover:bg-white/20 text-white border-white/20",
      primary: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30",
      secondary: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-400/30",
      ghost: "bg-transparent hover:bg-white/10 text-white/80 border-transparent",
      outline: "bg-transparent hover:bg-white/10 text-white border border-white/40 hover:border-white/60"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base", 
      lg: "px-6 py-3 text-lg"
    };

    return (
      <button
        ref={ref}
        className={combineClasses(
          "inline-flex items-center justify-center rounded-xl",
          "border backdrop-blur-md",
          "font-medium transition-all duration-200",
          "hover:shadow-lg hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-white/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
