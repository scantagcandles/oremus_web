'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OremusLogo from '@/components/common/logo/OremusLogo'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

export default function SplashScreen({ onComplete, duration = 3500 }: SplashScreenProps) { // Zwiększone z 2500 na 3500ms
  const [isVisible, setIsVisible] = useState(true)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Opóźnij start animacji żeby splash był widoczny
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowContent(true)
    }, 100) // Krótkie opóźnienie żeby zapewnić renderowanie

    return () => clearTimeout(showTimer)
  }, [])

  // Preload głównych zasobów w tle podczas splash screen
  useEffect(() => {
    const preloadResources = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Preload next.js chunks
          const preloadPromises = [
            import('@/components/layout/Navigation'),
          ]

          // Preload obrazków
          const imagePromises = [
            '/logo.png',
            '/logo-icon.png'
          ].map(src => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = resolve // Nie blokuj na błędach
              img.src = src
            })
          })

          // Minimum 1 sekunda preload żeby splash był widoczny
          const minTime = new Promise(resolve => setTimeout(resolve, 1000))

          Promise.all([...preloadPromises, ...imagePromises, minTime])
            .then(() => setIsPreloaded(true))
            .catch(() => setIsPreloaded(true))
        }
      } catch (error) {
        console.log('Preload completed')
        setIsPreloaded(true)
      }
    }

    preloadResources()
  }, [])

  useEffect(() => {
    // Dłuższy timer - bardziej widoczny splash
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Dłuższa animacja wyjścia
      setTimeout(onComplete, 500) // Zwiększone z 300ms na 500ms
    }, duration)

    return () => clearTimeout(timer)
  }, [onComplete, duration])

  if (!showContent) {
    // Pokaż prosty loader podczas inicjalizacji
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-gray-900">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-yellow-400 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }} // Dłuższa animacja wejścia
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-gray-900"
        >
          {/* Animowane tło */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Mniej cząsteczek ale widocznych */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400/30 rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  scale: 0
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
          </div>

          {/* Główna zawartość */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo z dłuższą animacją */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, // Zwiększone z 0.6s na 0.8s
                ease: "easeOut",
                delay: 0.2
              }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <OremusLogo 
                  size="xl" 
                  variant="full" 
                  effect="glow"
                  priority={true}
                  className="drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Tekst powitalny */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8,
                delay: 1.0, // Zwiększone opóźnienie
                ease: "easeOut"
              }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-light text-yellow-400/90 mb-2 tracking-wide">
                Witaj w
              </h1>
              <h2 className="text-lg md:text-xl text-white/70 font-light tracking-wider">
                Wspólnocie Modlitwy
              </h2>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }} // Zwiększone opóźnienie
              className="mt-12 flex flex-col items-center gap-4"
            >
              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: duration / 1000 - 0.5,
                    ease: "easeInOut" // Płynne wypełnianie
                  }}
                />
              </div>
              
              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-yellow-400/70 rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>

              {/* Status preloadingu */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: isPreloaded ? 1 : 0.6 }}
                className="text-white/50 text-sm mt-2"
              >
                {isPreloaded ? 'Gotowe!' : 'Ładowanie zasobów...'}
              </motion.p>
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-white/40 text-sm tracking-wide">
              OREMUS © 2024
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}