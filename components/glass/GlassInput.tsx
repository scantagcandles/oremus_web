import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2 bg-white/5 border rounded-lg transition-colors",
          "text-white placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/20",
          error
            ? "border-red-500/20 focus:border-red-500/40 focus:ring-red-500/20"
            : "border-white/10",
          className
        )}
        {...props}
      />
    );
  }
);

GlassInput.displayName = 'GlassInput';

export { GlassInput };
