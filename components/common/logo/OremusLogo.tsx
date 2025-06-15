// components/common/logo/OremusLogo.tsx
'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { memo } from 'react'
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
  // Rozmiary dla pełnego logo (proporcje ~2.5:1)
  const fullSizes = {
    xs: { width: 100, height: 40 },
    sm: { width: 150, height: 60 },
    md: { width: 200, height: 80 },
    lg: { width: 250, height: 100 },
    xl: { width: 350, height: 140 },
  }

  // Rozmiary dla samej ikony
  const iconSizes = {
    xs: { width: 32, height: 32 },
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 80, height: 80 },
    xl: { width: 120, height: 120 },
  }

  const currentSize = variant === 'icon' ? iconSizes[size] : fullSizes[size]

  const effects = {
    none: '',
    glow: 'drop-shadow(0_0_20px_rgba(255,215,0,0.5)) drop-shadow(0_0_40px_rgba(26,35,126,0.3))',
    'subtle-glow': 'drop-shadow(0_2px_8px_rgba(0,0,0,0.5)) drop-shadow(0_0_20px_rgba(255,215,0,0.2))',
    shadow: 'drop-shadow(0_2px_10px_rgba(0,0,0,0.4))'
  }

  // Określ które logo użyć
  const logoSrc = variant === 'icon' ? '/logo-icon.png' : '/logo.png'

  const logoElement = (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={logoSrc}
        alt="OREMUS - Wspólnota Modlitwy"
        width={currentSize.width}
        height={currentSize.height}
        className="object-contain"
        style={{ filter: effects[effect] }}
        priority={priority}
      />
    </div>
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {logoElement}
      </motion.div>
    )
  }

  return logoElement
}

export default memo(OremusLogo)

// components/common/logo/OremusLogoAnimated.tsx

import { motion } from 'framer-motion'
import OremusLogo from './OremusLogo'

interface OremusLogoAnimatedProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'pulse' | 'glow' | 'fade' | 'bounce'
}

export default function OremusLogoAnimated({ 
  size = 'lg',
  variant = 'glow'
}: OremusLogoAnimatedProps) {
  const animations = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    glow: {
      filter: [
        'drop-shadow(0 0 20px rgba(255,215,0,0.3))',
        'drop-shadow(0 0 40px rgba(255,215,0,0.6))',
        'drop-shadow(0 0 20px rgba(255,215,0,0.3))'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    fade: {
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Efekt tła */}
      {variant === 'glow' && (
        <motion.div
          className="absolute inset-0 blur-3xl"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-t from-secondary/30 via-primary/20 to-transparent" />
        </motion.div>
      )}
      
      {/* Logo */}
      <motion.div animate={animations[variant]} className="relative z-10">
        <OremusLogo size={size} priority />
      </motion.div>
    </motion.div>
  )
}

// components/common/logo/OremusLogoLoading.tsx

import { motion } from 'framer-motion'
import OremusLogo from './OremusLogo'

export default function OremusLogoLoading() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <OremusLogo size="lg" effect="subtle-glow" priority />
      </motion.div>
      
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-secondary rounded-full"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )
}

// components/common/logo/index.ts
export { default as OremusLogo } from './OremusLogo'
export { default as OremusLogoAnimated } from './OremusLogoAnimated'
export { default as OremusLogoLoading } from './OremusLogoLoading'