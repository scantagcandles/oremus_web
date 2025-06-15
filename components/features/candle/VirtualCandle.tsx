'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface VirtualCandleProps {
  intention?: string
  duration: number // in hours
  onComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function VirtualCandle({ 
  intention = '', 
  duration, 
  onComplete,
  size = 'md' 
}: VirtualCandleProps) {
  const [isLit, setIsLit] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration * 3600) // convert to seconds

  useEffect(() => {
    if (!isLit) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete?.()
          setIsLit(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLit, onComplete])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        className={`relative ${sizeClasses[size]} cursor-pointer`}
        onClick={() => setIsLit(prev => !prev)}
        whileHover={{ scale: 1.05 }}
      >
        {/* Candle Body */}
        <div className="absolute bottom-0 w-full h-4/5 bg-gray-100 rounded-lg shadow-md">
          {/* Wick */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-gray-800" />
          
          {/* Flame */}
          {isLit && (
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-6 h-8 bg-yellow-500 rounded-full filter blur-sm" />
              <div className="w-4 h-6 bg-orange-500 rounded-full absolute top-1 left-1 filter blur-sm" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {intention && (
        <p className="text-center text-sm text-gray-600 max-w-xs">
          Intencja: {intention}
        </p>
      )}

      {isLit && (
        <p className="text-sm font-medium">
          Pozostało: {formatTime(timeLeft)}
        </p>
      )}
    </div>
  )
}
