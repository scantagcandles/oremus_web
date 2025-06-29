# create-missing-components.ps1
# Tworzy brakujące komponenty UI na podstawie przeniesionych plików Glass

Write-Host "Creating missing UI components..." -ForegroundColor Yellow

# Card Component
$cardContent = @'
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
'@

# Input Component
$inputContent = @'
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
'@

# Select Component
$selectContent = @'
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
'@

# Modal Component
$modalContent = @'
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
'@

# Zapisz komponenty
$cardContent | Out-File -FilePath "components/ui/Card/Card.tsx" -Encoding UTF8
$inputContent | Out-File -FilePath "components/ui/Input/Input.tsx" -Encoding UTF8
$selectContent | Out-File -FilePath "components/ui/Select/Select.tsx" -Encoding UTF8
$modalContent | Out-File -FilePath "components/ui/Modal/Modal.tsx" -Encoding UTF8

Write-Host "OK Created Card component" -ForegroundColor Green
Write-Host "OK Created Input component" -ForegroundColor Green
Write-Host "OK Created Select component" -ForegroundColor Green
Write-Host "OK Created Modal component" -ForegroundColor Green

# Sprawdź czy istnieją pliki index.ts
if (!(Test-Path "components/ui/Card/index.ts")) {
    "export { Card } from './Card'`nexport type { CardProps } from './Card'" | Out-File -FilePath "components/ui/Card/index.ts" -Encoding UTF8
}

if (!(Test-Path "components/ui/Input/index.ts")) {
    "export { Input } from './Input'`nexport type { InputProps } from './Input'" | Out-File -FilePath "components/ui/Input/index.ts" -Encoding UTF8
}

if (!(Test-Path "components/ui/Select/index.ts")) {
    "export { Select } from './Select'`nexport type { SelectProps } from './Select'" | Out-File -FilePath "components/ui/Select/index.ts" -Encoding UTF8
}

if (!(Test-Path "components/ui/Modal/index.ts")) {
    "export { Modal } from './Modal'`nexport type { ModalProps } from './Modal'" | Out-File -FilePath "components/ui/Modal/index.ts" -Encoding UTF8
}

Write-Host "`nAll UI components created successfully!" -ForegroundColor Green