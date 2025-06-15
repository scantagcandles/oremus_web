import { FC, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const GlassCard: FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = false,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(
        'bg-glass-black backdrop-blur-lg rounded-xl',
        hover && 'hover:bg-glass-black/80 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
