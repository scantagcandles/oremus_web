import { ButtonHTMLAttributes, FC } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const GlassButton: FC<GlassButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg font-medium transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && [
          'bg-secondary text-primary hover:bg-secondary/90',
          'focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-glass-black'
        ],
        variant === 'secondary' && [
          'bg-glass-white text-white hover:bg-glass-secondary',
          'focus:outline-none focus:ring-2 focus:ring-white/20'
        ],
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      )}
      {children}
    </button>
  )
}
