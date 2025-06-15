// components/common/Logo.tsx
'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'default' | 'inverted' | 'gold' | 'glow'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

export default function Logo({ 
  variant = 'inverted', 
  size = 'md', 
  className,
  showText = true 
}: LogoProps) {
  const sizes = {
    sm: { logo: 32, text: 'text-lg' },
    md: { logo: 40, text: 'text-xl' },
    lg: { logo: 48, text: 'text-2xl' },
    xl: { logo: 64, text: 'text-3xl' }
  }

  const variants = {
    default: '',
    inverted: 'invert brightness-0 contrast-200',
    gold: 'invert sepia saturate-200 hue-rotate-15 brightness-110',
    glow: 'invert brightness-0 contrast-200 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        {/* Główne logo */}
        <Image
          src="/logo.png" // Twoje logo PNG
          alt="OREMUS Logo"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className={cn(
            "transition-all duration-300",
            variants[variant]
          )}
          priority
        />
        
        {/* Efekt glow dla wariantu 'glow' */}
        {variant === 'glow' && (
          <div className="absolute inset-0 blur-xl opacity-50">
            <Image
              src="/logo.png"
              alt=""
              width={sizes[size].logo}
              height={sizes[size].logo}
              className="invert sepia saturate-200 hue-rotate-15 brightness-110"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold text-gradient",
          sizes[size].text
        )}>
          OREMUS
        </span>
      )}
    </div>
  )
}

// components/common/LogoAnimated.tsx
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoAnimatedProps {
  size?: number
  className?: string
}

export default function LogoAnimated({ size = 48, className }: LogoAnimatedProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Tło ze złotym gradientem */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary via-yellow-300 to-secondary opacity-20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="OREMUS Logo"
        width={size}
        height={size}
        className="relative z-10 invert brightness-0 contrast-200"
        priority
      />
    </motion.div>
  )
}