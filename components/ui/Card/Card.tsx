import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface CardProps extends HTMLMotionProps<"div"> {
  className?: string
  children?: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-white/10 backdrop-blur-md",
          "border border-white/20",
          "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
          "transition-all duration-300",
          "hover:bg-white/20 hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.5)]",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
