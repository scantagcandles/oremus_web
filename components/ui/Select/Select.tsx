import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], placeholder, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl",
          "bg-white/10 backdrop-blur-md",
          "border border-white/20 hover:border-white/30",
          "text-white",
          "focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[&>option]:bg-gray-800 [&>option]:text-white",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'
