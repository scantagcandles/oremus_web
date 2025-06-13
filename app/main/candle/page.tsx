// web/app/(main)/candle/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, Wifi, WifiOff, Heart, Clock, MapPin, 
  ChevronRight, Sparkles, Volume2, VolumeX
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassTextarea } from '@/components/glass/GlassTextarea'
import GlassModal from '@/components/glass/GlassModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface CandleState {
  isLit: boolean
  id: string | null
  startTime: Date | null
  intention: string
  isPublic: boolean
}

export default function CandlePage() {
  const [candle, setCandle] = useState<CandleState>({
    isLit: false,
    id: null,
    startTime: null,
    intention: '',
    isPublic: false
  })
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [showIntentionModal, setShowIntentionModal] = useState(false)
  const [showVirtualCandle, setShowVirtualCandle] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [prayerTime, setPrayerTime] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    // Check for Web NFC API support
    if ('NDEFReader' in window) {
      setIsNFCSupported(true)
    }

    // Load saved candle state
    loadCandleState()

    // Timer for prayer duration
    const interval = setInterval(() => {
      if (candle.isLit && candle.startTime) {
        const duration = Math.floor((new Date().getTime() - candle.startTime.getTime()) / 1000)
        setPrayerTime(duration)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [candle.isLit, candle.startTime])

  const loadCandleState = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (data && !error) {
      setCandle({
        isLit: true,
        id: data.id,
        startTime: new Date(data.started_at),
        intention: data.intention || '',
        isPublic: data.is_public || false
      })
    }
  }

  const scanNFC = async () => {
    if (!isNFCSupported) {
      setShowVirtualCandle(true)
      return
    }

    setIsScanning(true)
    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.scan()

      ndef.addEventListener('reading', async ({ message }: any) => {
        // Process NFC tag
        const decoder = new TextDecoder()
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const candleId = decoder.decode(record.data)
            await lightCandle(candleId)
            setIsScanning(false)
          }
        }
      })

      ndef.addEventListener('readingerror', () => {
        toast.error('Błąd odczytu NFC. Spróbuj ponownie.')
        setIsScanning(false)
      })

    } catch (error) {
      console.error('NFC Error:', error)
      toast.error('Nie udało się uruchomić skanera NFC')
      setIsScanning(false)
      setShowVirtualCandle(true)
    }
  }

  const lightCandle = async (candleId?: string) => {
    setShowIntentionModal(true)
  }

  const confirmIntention = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Musisz być zalogowany')
      return
    }

    try {
      // Create prayer session
      const { data: session, error: sessionError } = await supabase
        .from('prayer_sessions')
        .insert({
          user_id: user.id,
          candle_id: candle.id || 'virtual',
          started_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Create intention if provided
      if (candle.intention) {
        const { error: intentionError } = await supabase
          .from('prayer_intentions')
          .insert({
            user_id: user.id,
            session_id: session.id,
            content: candle.intention,
            is_public: candle.isPublic
          })

        if (intentionError) throw intentionError
      }

      setCandle({
        ...candle,
        isLit: true,
        id: session.id,
        startTime: new Date()
      })

      setShowIntentionModal(false)
      toast.success('Świeca została zapalona!')

      // Play sound if enabled
      if (soundEnabled) {
        const audio = new Audio('/sounds/candle-light.mp3')
        audio.play().catch(() => {})
      }

    } catch (error) {
      console.error('Error lighting candle:', error)
      toast.error('Nie udało się zapalić świecy')
    }
  }

  const extinguishCandle = async () => {
    if (!candle.id) return

    try {
      const { error } = await supabase
        .from('prayer_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', candle.id)

      if (error) throw error

      setCandle({
        isLit: false,
        id: null,
        startTime: null,
        intention: '',
        isPublic: false
      })

      toast.success('Świeca została zgaszona')

      // Play sound if enabled
      if (soundEnabled) {
        const audio = new Audio('/sounds/candle-extinguish.mp3')
        audio.play().catch(() => {})
      }

    } catch (error) {
      console.error('Error extinguishing candle:', error)
      toast.error('Nie udało się zgasić świecy')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Święta Świeca
          </h1>
          <p className="text-lg text-white/70">
            Zapal świecę i módl się razem ze wspólnotą
          </p>
        </motion.div>

        {/* Main Candle Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-8 md:p-12">
            <div className="flex flex-col items-center">
              {/* Candle Animation */}
              <motion.div
                className="relative mb-8"
                animate={candle.isLit ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 relative">
                  {/* Candle body */}
                  <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-yellow-900 to-yellow-700 rounded-t-lg" />
                  
                  {/* Flame */}
                  <AnimatePresence>
                    {candle.isLit && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2"
                      >
                        <motion.div
                          className="relative"
                          animate={{
                            scaleY: [1, 1.1, 0.95, 1],
                            scaleX: [1, 0.95, 1.05, 1]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Flame className="w-16 h-16 text-secondary drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
                          <div className="absolute inset-0 bg-secondary/20 blur-xl" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Glow effect */}
                  {candle.isLit && (
                    <motion.div
                      className="absolute inset-0 bg-secondary/10 blur-3xl"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>

              {/* Status */}
              <div className="text-center mb-6">
                {candle.isLit ? (
                  <>
                    <h2 className="text-2xl font-bold text-secondary mb-2">
                      Świeca płonie
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-white/70">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(prayerTime)}</span>
                      </div>
                      {candle.intention && (
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span>Z intencją</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Świeca zgaszona
                    </h2>
                    <p className="text-white/70">
                      Zapal świecę, aby rozpocząć modlitwę
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {candle.isLit ? (
                  <GlassButton
                    size="lg"
                    variant="secondary"
                    onClick={extinguishCandle}
                  >
                    Zgaś świecę
                  </GlassButton>
                ) : (
                  <>
                    {isNFCSupported && (
                      <GlassButton
                        size="lg"
                        onClick={scanNFC}
                        loading={isScanning}
                        className="gap-2"
                      >
                        <Wifi className="w-5 h-5" />
                        Skanuj świecę NFC
                      </GlassButton>
                    )}
                    <GlassButton
                      size="lg"
                      variant={isNFCSupported ? "secondary" : "primary"}
                      onClick={() => setShowVirtualCandle(true)}
                      className="gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Wirtualna świeca
                    </GlassButton>
                  </>
                )}
              </div>

              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="mt-6 p-2 rounded-lg hover:bg-glass-white transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-white/50" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/50" />
                )}
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-3">
                Jak to działa?
              </h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>Zbliż telefon do świecy z chipem NFC lub użyj wirtualnej świecy</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>Podaj swoją intencję modlitewną (opcjonalnie)</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>Twoja świeca dołączy do globalnej sieci modlitwy</span>
                </li>
              </ul>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-3">
                Dlaczego warto?
              </h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-prayer flex-shrink-0 mt-0.5" />
                  <span>Połącz się duchowo z tysiącami modlących się</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-prayer flex-shrink-0 mt-0.5" />
                  <span>Zobacz na mapie, gdzie płoną inne świece</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-prayer flex-shrink-0 mt-0.5" />
                  <span>Śledź czas swojej modlitwy i duchowy rozwój</span>
                </li>
              </ul>
            </GlassCard>
          </motion.div>
        </div>

        {/* Intention Modal */}
        <GlassModal
          isOpen={showIntentionModal}
          onClose={() => setShowIntentionModal(false)}
          title="Podaj intencję modlitwy"
          size="md"
        >
          <div className="space-y-6">
            <GlassTextarea
              label="Twoja intencja (opcjonalnie)"
              placeholder="W jakiej intencji chcesz się modlić?"
              value={candle.intention}
              onChange={(e) => setCandle({ ...candle, intention: e.target.value })}
              rows={4}
            />
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={candle.isPublic}
                onChange={(e) => setCandle({ ...candle, isPublic: e.target.checked })}
                className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary"
              />
              <span className="text-white">
                Udostępnij intencję publicznie (anonimowo)
              </span>
            </label>

            <div className="flex gap-4">
              <GlassButton
                onClick={confirmIntention}
                className="flex-1"
              >
                Zapal świecę
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => setShowIntentionModal(false)}
                className="flex-1"
              >
                Anuluj
              </GlassButton>
            </div>
          </div>
        </GlassModal>

        {/* Virtual Candle Modal */}
        <GlassModal
          isOpen={showVirtualCandle}
          onClose={() => setShowVirtualCandle(false)}
          title="Wirtualna Świeca"
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                className="inline-block mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-24 h-24 text-secondary mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]" />
              </motion.div>
              <p className="text-white/70">
                Nie masz świecy z chipem NFC? Nie martw się! 
                Możesz zapalić wirtualną świecę i modlić się razem ze wspólnotą.
              </p>
            </div>

            <div className="flex gap-4">
              <GlassButton
                onClick={() => {
                  setShowVirtualCandle(false)
                  lightCandle('virtual')
                }}
                className="flex-1"
              >
                Zapal wirtualną świecę
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => setShowVirtualCandle(false)}
                className="flex-1"
              >
                Anuluj
              </GlassButton>
            </div>

            <div className="text-center">
              <a
                href="/shop"
                className="text-secondary hover:text-secondary/80 transition-colors text-sm"
              >
                Kup prawdziwą świecę z chipem NFC →
              </a>
            </div>
          </div>
        </GlassModal>
      </div>
    </div>
  )
}