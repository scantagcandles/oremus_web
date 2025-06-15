import { FC, InputHTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  icon?: LucideIcon
  textarea?: boolean
}

export const GlassInput: FC<GlassInputProps> = ({
  error,
  label,
  icon: Icon,
  textarea,
  className,
  ...props
}) => {
  const Component = textarea ? 'textarea' : 'input'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-white font-medium mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-white/50" />
          </div>
        )}
        <Component
          className={cn(
            'w-full bg-glass-black text-white rounded-lg border border-glass-white',
            'focus:border-secondary focus:ring-1 focus:ring-secondary outline-none',
            'placeholder:text-white/50',
            Icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error',
            textarea && 'min-h-[100px] resize-none py-2',
            !textarea && 'px-4 py-2',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
