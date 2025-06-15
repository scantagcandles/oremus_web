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

// Export także jako named export dla kompatybilności
export { Logo as OremusLogo }