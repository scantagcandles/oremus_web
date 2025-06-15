'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AudioTrack, PrayerSegment } from '@/lib/supabase/client'

type PlayerMode = 'standard' | 'interactive' | 'meditation' | 'study' | 'sleep' | 'focus'

interface ODBPlayerProps {
  track: AudioTrack
  userType: 'free' | 'premium'
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export default function ODBPlayer({
  track,
  userType,
  onProgress,
  onComplete
}: ODBPlayerProps) {
  // Stan playera
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [mode, setMode] = useState<PlayerMode>('standard')
  const [currentSegment, setCurrentSegment] = useState<PrayerSegment | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [backgroundSound, setBackgroundSound] = useState<string | null>(null)

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const backgroundAudioRef = useRef<HTMLAudioElement>(null)
  const recognitionRef = useRef<any>(null)
  const responseTimeoutRef = useRef<NodeJS.Timeout>()

  // Speech Recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'pl-PL'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        handleUserResponse(transcript)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  // Segment tracking
  useEffect(() => {
    if (!isPlaying || !track.prayerSegments) return

    const checkSegment = () => {
      const segment = track.prayerSegments?.find(seg => 
        currentTime >= seg.startTime && 
        currentTime < seg.startTime + 5
      )

      if (segment && segment.waitForResponse) {
        pause()
        setCurrentSegment(segment)
        startListening()
      }
    }

    const interval = setInterval(checkSegment, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, track.prayerSegments])

  // Background sounds
  useEffect(() => {
    if (backgroundAudioRef.current) {
      if (backgroundSound) {
        backgroundAudioRef.current.src = `/sounds/${backgroundSound}.mp3`
        backgroundAudioRef.current.loop = true
        backgroundAudioRef.current.volume = 0.1
        if (isPlaying) backgroundAudioRef.current.play()
      } else {
        backgroundAudioRef.current.pause()
      }
    }
  }, [backgroundSound, isPlaying])

  const play = async () => {
    if (audioRef.current) {
      await audioRef.current.play()
      setIsPlaying(true)
      if (backgroundAudioRef.current && backgroundSound) {
        backgroundAudioRef.current.play()
      }
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause()
      }
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) return

    setIsListening(true)
    setShowResponse(false)
    recognitionRef.current.start()

    if (currentSegment?.responseTimeout) {
      responseTimeoutRef.current = setTimeout(() => {
        setShowResponse(true)
      }, currentSegment.responseTimeout)
    }
  }

  const handleUserResponse = (response: string) => {
    if (!currentSegment?.expectedResponse) return

    const isCorrect = response.includes(
      currentSegment.expectedResponse.toLowerCase()
    )

    if (isCorrect) {
      play()
      setCurrentSegment(null)
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current)
      }
    } else {
      setShowResponse(true)
    }
  }

  const handleModeChange = (newMode: PlayerMode) => {
    setMode(newMode)
    
    // Dostosuj ustawienia dla trybu
    switch (newMode) {
      case 'meditation':
        setPlaybackRate(0.8)
        setBackgroundSound('nature')
        break
      case 'focus':
        setPlaybackRate(1)
        setBackgroundSound('whitenoise')
        break
      case 'sleep':
        setPlaybackRate(0.9)
        setBackgroundSound('rain')
        break
      default:
        setPlaybackRate(1)
        setBackgroundSound(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
      {/* Tryby odtwarzania */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['standard', 'interactive', 'meditation', 'study', 'sleep', 'focus'] as PlayerMode[]).map((playerMode) => (
          <button
            key={playerMode}
            onClick={() => handleModeChange(playerMode)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              mode === playerMode
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {playerMode.charAt(0).toUpperCase() + playerMode.slice(1)}
          </button>
        ))}
      </div>

      {/* Główny interfejs playera */}
      <div className="relative aspect-video mb-6">
        {/* Wizualizacja dla trybu medytacji */}
        {mode === 'meditation' && (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg"
          />
        )}

        {/* Panel interaktywny */}
        <AnimatePresence>
          {currentSegment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-8 text-center"
            >
              <div>
                <h3 className="text-2xl mb-4">{currentSegment.text}</h3>
                {isListening && (
                  <p className="text-green-400">Słucham...</p>
                )}
                {showResponse && (
                  <div>
                    <p className="text-yellow-400 mb-2">Oczekiwana odpowiedź:</p>
                    <p>{currentSegment.expectedResponse}</p>
                    <button
                      onClick={play}
                      className="mt-4 px-4 py-2 bg-primary rounded"
                    >
                      Kontynuuj
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio */}
        <audio
          ref={audioRef}
          src={track.url}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime)
              onProgress?.(audioRef.current.currentTime)
            }
          }}
          onEnded={() => {
            setIsPlaying(false)
            onComplete?.()
          }}
        />

        {/* Background Audio */}
        <audio ref={backgroundAudioRef} loop />
      </div>

      {/* Kontrolki */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={track.duration}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value)
              setCurrentTime(time)
              if (audioRef.current) {
                audioRef.current.currentTime = time
              }
            }}
            className="flex-1"
          />
          <span className="text-sm">
            {formatTime(track.duration)}
          </span>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime -= 10
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            -10s
          </button>
          
          <button
            onClick={() => isPlaying ? pause() : play()}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white"
          >
            <span className="material-icons">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime += 10
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            +10s
          </button>
        </div>

        {/* Additional controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-icons text-gray-600">volume_up</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setVolume(value)
                if (audioRef.current) {
                  audioRef.current.volume = value
                }
              }}
              className="w-24"
            />
          </div>

          <select
            value={playbackRate}
            onChange={(e) => {
              const value = parseFloat(e.target.value)
              setPlaybackRate(value)
              if (audioRef.current) {
                audioRef.current.playbackRate = value
              }
            }}
            className="px-2 py-1 rounded border"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      {/* Chapters */}
      {track.chapters && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Rozdziały</h3>
          <div className="space-y-2">
            {track.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = chapter.startTime
                  }
                }}
                className={`w-full text-left p-2 rounded ${
                  currentTime >= chapter.startTime
                    ? 'bg-primary/10'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{chapter.title}</span>
                  <span className="text-sm text-gray-500">
                    {formatTime(chapter.startTime)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const formatTime = (seconds: number = 0) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
