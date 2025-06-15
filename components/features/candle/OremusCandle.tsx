'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface OremusCandle {
  id: string
  nfcId: string
  activationDate?: Date
  expiryDate?: Date
  intention?: string
  isActive: boolean
  type: 'standard' | 'premium' | 'deluxe'
}

interface OremusCandleProps {
  candle?: OremusCandle
  onNfcDetected: (nfcId: string) => Promise<OremusCandle>
  onActivate: (candleId: string) => Promise<void>
}

export default function OremusCandle({ 
  candle,
  onNfcDetected,
  onActivate 
}: OremusCandleProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  // Obsługa skanowania NFC
  const handleNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      setError('Twoje urządzenie nie obsługuje NFC')
      return
    }

    try {
      setIsScanning(true)
      setError(null)
      
      const ndef = new (window as any).NDEFReader()
      await ndef.scan()
      
      ndef.addEventListener("reading", async ({ serialNumber }: { serialNumber: string }) => {
        try {
          const candleData = await onNfcDetected(serialNumber)
          if (!candleData.isActive) {
            await onActivate(candleData.id)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Błąd podczas aktywacji świecy')
        }
      })
    } catch (err) {
      setError('Nie udało się zeskanować świecy. Spróbuj ponownie.')
    } finally {
      setIsScanning(false)
    }
  }

  // Obliczanie pozostałego czasu
  useEffect(() => {
    if (!candle?.activationDate || !candle.isActive) return

    const calculateTimeLeft = () => {
      if (!candle.expiryDate) return ''

      const now = new Date()
      const expiry = new Date(candle.expiryDate)
      const diff = expiry.getTime() - now.getTime()

      if (diff <= 0) return 'Świeca zgasła'

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      return `${days}d ${hours}h ${minutes}m`
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // Aktualizacja co minutę

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [candle])

  const typeStyles = {
    standard: 'bg-yellow-100',
    premium: 'bg-yellow-200',
    deluxe: 'bg-yellow-300'
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-lg">
      {/* Status świecy */}
      <motion.div
        className={`relative w-32 h-40 ${candle ? typeStyles[candle.type] : 'bg-gray-100'} rounded-lg shadow-md`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Płomień dla aktywnej świecy */}
        {candle?.isActive && (
          <motion.div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-6 h-8 bg-orange-400 rounded-full filter blur-sm" />
            <div className="w-4 h-6 bg-yellow-300 rounded-full absolute top-1 left-1 filter blur-sm" />
          </motion.div>
        )}

        {/* Logo Oremus na świecy */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="font-semibold text-gray-600">Oremus</span>
        </div>

        {/* Wskaźnik NFC */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <span className="material-icons text-gray-400">nfc</span>
        </div>
      </motion.div>

      {/* Informacje o świecy */}
      {candle ? (
        <div className="text-center space-y-2">
          <p className="font-medium">{candle.type.charAt(0).toUpperCase() + candle.type.slice(1)}</p>
          {candle.intention && (
            <p className="text-sm text-gray-600">
              Intencja: {candle.intention}
            </p>
          )}
          {candle.isActive && (
            <p className="text-sm font-medium text-green-600">
              Pozostało: {timeLeft}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleNfcScan}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isScanning ? 'Skanowanie...' : 'Zeskanuj świecę'}
        </button>
      )}

      {/* Komunikat błędu */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
