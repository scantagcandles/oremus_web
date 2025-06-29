import { forwardRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, className, size = 'md' }, ref) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl'
    }

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2",
                "w-full p-4 z-50",
                sizeClasses[size]
              )}
            >
              <div className={cn(
                "relative overflow-hidden rounded-2xl",
                "bg-white/10 backdrop-blur-md",
                "border border-white/20",
                "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
                className
              )}>
                {title && (
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="h-5 w-5 text-white/70" />
                    </button>
                  </div>
                )}
                <div className="p-6">
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }
)

Modal.displayName = 'Modal'
