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