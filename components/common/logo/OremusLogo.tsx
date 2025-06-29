'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { memo, useState } from 'react'
import { LogoSize, LogoVariant, LogoEffect } from '@/types/logo'

interface OremusLogoProps {
  variant?: LogoVariant
  size?: LogoSize
  effect?: LogoEffect
  className?: string
  animated?: boolean
  priority?: boolean
}

const OremusLogo = ({ 
  variant = 'full',
  size = 'md',
  effect = 'none',
  className,
  animated = false,
  priority = false
}: OremusLogoProps) => {
  const [imageError, setImageError] = useState(false)

  // WIĘKSZE rozmiary dla lepszej widoczności
  const fullSizes = {
    xs: { width: 140, height: 56 },
    sm: { width: 200, height: 80 },
    md: { width: 280, height: 112 },
    lg: { width: 380, height: 152 },   // Zwiększone jeszcze bardziej
    xl: { width: 480, height: 192 },
  }

  // Dla ikony używamy tylko logo.png
  const iconSizes = {
    xs: { width: 48, height: 48 },
    sm: { width: 64, height: 64 },
    md: { width: 88, height: 88 },
    lg: { width: 120, height: 120 },   // Zwiększone
    xl: { width: 160, height: 160 },
  }

  const currentSize = variant === 'icon' ? iconSizes[size] : fullSizes[size]

  // Używaj tylko logo.png dla wszystkich wariantów
  const logoSrc = '/logo.png'

  const effects = {
    none: '',
    glow: 'drop-shadow(0_0_20px_rgba(255,215,0,0.5)) drop-shadow(0_0_40px_rgba(26,35,126,0.3))',
    'subtle-glow': 'drop-shadow(0_2px_8px_rgba(0,0,0,0.5)) drop-shadow(0_0_20px_rgba(255,215,0,0.2))',
    shadow: 'drop-shadow(0_2px_10px_rgba(0,0,0,0.4))'
  }

  const logoElement = (
    <div className={cn(
      "relative inline-block",
      // DODATKOWE MARGINESY dla logo
      "mx-2 my-1",
      className
    )}>
      <Image
        src={logoSrc}
        alt="OREMUS - Wspólnota Modlitwy"
        width={currentSize.width}
        height={currentSize.height}
        className={cn(
          "object-contain",
          // Próby usunięcia białego tła
          "mix-blend-normal", // Zmienione z mix-blend-screen
          "bg-transparent"
        )}
        style={{ 
          filter: effects[effect],
          backgroundColor: 'transparent',
          // Dodatkowe CSS dla usunięcia białego tła
          imageRendering: 'crisp-edges'
        }}
        priority={priority}
        onError={() => {
          console.log('Logo PNG failed to load')
          setImageError(true)
        }}
        onLoad={() => setImageError(false)}
      />
    </div>
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="cursor-pointer"
      >
        {logoElement}
      </motion.div>
    )
  }

  return logoElement
}

export default memo(OremusLogo)