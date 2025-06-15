import { FC, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: string
  label?: string
}

export const GlassSelect: FC<GlassSelectProps> = ({
  options,
  error,
  label,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-white font-medium mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-2 bg-glass-black text-white rounded-lg border border-glass-white',
          'focus:border-secondary focus:ring-1 focus:ring-secondary outline-none',
          'placeholder:text-white/50',
          error && 'border-error focus:border-error focus:ring-error',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
