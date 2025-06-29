import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  error?: boolean
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {Icon && (
            <Icon className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors",
              error ? "text-red-400" : "text-white/50"
            )} />
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white/10 backdrop-blur-md",
              "border transition-all duration-200",
              "text-white placeholder:text-white/50",
              "focus:outline-none focus:ring-2 focus:ring-white/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              Icon && "pl-10",
              error 
                ? "border-red-400/50 focus:border-red-400" 
                : "border-white/20 hover:border-white/30 focus:border-white/40",
              className
            )}
            {...props}
          />
        </div>
        {helperText && (
          <p className={cn(
            "mt-1 text-sm",
            error ? "text-red-400" : "text-white/60"
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
