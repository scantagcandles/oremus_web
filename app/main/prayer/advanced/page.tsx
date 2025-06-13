// web/app/(main)/player/advanced/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  // Player Controls
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
  Volume2, VolumeX, Maximize2, Minimize2,
  // Features
  Mic, MicOff, Church, Book, Radio, Music, Headphones,
  MessageCircle, Users, Calendar, Clock, Timer,
  // UI
  ChevronRight, X, Settings, Download, Share2, Heart,
  Bookmark, History, TrendingUp, Award, Sparkles,
  // Modes
  Moon, Sun, Zap, Waves, Mountain, Coffee,
  // Interactive
  MessageSquare, Eye, EyeOff, CheckCircle, AlertCircle
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import { toast } from 'react-hot-toast'

// ===== TYPY =====
interface PlayerMode {
  id: string
  name: string
  icon: any
  color: string
  description: string
}

interface AudioContent {
  id: string
  title: string
  author: string
  type: 'conference' | 'meditation' | 'prayer' | 'music' | 'audiobook' | 'podcast' | 'interactive'
  duration: number
  url: string
  thumbnail: string
  isPremium?: boolean
  hasTranscript?: boolean
  hasInteractive?: boolean
  chapters?: Chapter[]
  prayerSegments?: PrayerSegment[]
}

interface Chapter {
  id: string
  title: string
  startTime: number
  endTime: number
}

interface PrayerSegment {
  id: string
  type: 'priest' | 'response' | 'all' | 'instruction'
  text: string
  startTime: number
  expectedResponse?: string
  waitForResponse?: boolean
  responseTimeout?: number
}

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isRepeat: boolean
  isShuffle: boolean
  playbackSpeed: number
  currentMode: string
  isInteractiveMode: boolean
  isTranscriptVisible: boolean
  isSleepTimerActive: boolean
  sleepTimerMinutes: number
}

// ===== TRYBY ODTWARZANIA =====
const playerModes: PlayerMode[] = [
  {
    id: 'standard',
    name: 'Standardowy',
    icon: Play,
    color: 'from-blue-500 to-purple-500',
    description: 'Normalny tryb odtwarzania'
  },
  {
    id: 'interactive',
    name: 'Interaktywna Modlitwa',
    icon: Church,
    color: 'from-purple-500 to-pink-500',
    description: 'Dialog liturgiczny z odpowiedziami'
  },
  {
    id: 'meditation',
    name: 'Medytacja',
    icon: Mountain,
    color: 'from-green-500 to-teal-500',
    description: 'Tryb medytacyjny z ambientem'
  },
  {
    id: 'study',
    name: 'Studium',
    icon: Book,
    color: 'from-yellow-500 to-orange-500',
    description: 'Z notatkami i zakładkami'
  },
  {
    id: 'sleep',
    name: 'Sen',
    icon: Moon,
    color: 'from-indigo-500 to-purple-500',
    description: 'Automatyczne wyciszanie'
  },
  {
    id: 'focus',
    name: 'Skupienie',
    icon: Zap,
    color: 'from-red-500 to-pink-500',
    description: 'Binaural beats i koncentracja'
  }
]

// ===== PRZYKŁADOWA ZAWARTOŚĆ =====
const sampleContent: AudioContent = {
  id: '1',
  title: 'Msza Święta - Liturgia Słowa',
  author: 'ks. Jan Kowalski',
  type: 'interactive',
  duration: 1800,
  url: '/audio/mass-sample.mp3',
  thumbnail: 'https://images.unsplash.com/photo-1559882869-0aa7e65ce3da',
  hasTranscript: true,
  hasInteractive: true,
  chapters: [
    { id: '1', title: 'Wprowadzenie', startTime: 0, endTime: 120 },
    { id: '2', title: 'Pierwsze czytanie', startTime: 120, endTime: 480 },
    { id: '3', title: 'Psalm responsoryjny', startTime: 480, endTime: 720 },
    { id: '4', title: 'Ewangelia', startTime: 720, endTime: 1200 },
    { id: '5', title: 'Homilia', startTime: 1200, endTime: 1800 }
  ],
  prayerSegments: [
    {
      id: '1',
      type: 'priest',
      text: 'Pan z wami.',
      startTime: 10,
      expectedResponse: 'I z duchem twoim',
      waitForResponse: true,
      responseTimeout: 5000
    },
    {
      id: '2',
      type: 'priest',
      text: 'Słuchajcie słowa Bożego.',
      startTime: 120,
      expectedResponse: 'Bogu niech będą dzięki',
      waitForResponse: true,
      responseTimeout: 5000
    },
    {
      id: '3',
      type: 'all',
      text: 'Chwała Tobie, Chryste.',
      startTime: 720,
      waitForResponse: false
    }
  ]
}

export default function AdvancedODBPlayer() {
  // ===== STATE =====
  const [currentContent, setCurrentContent] = useState<AudioContent>(sampleContent)
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isRepeat: false,
    isShuffle: false,
    playbackSpeed: 1,
    currentMode: 'standard',
    isInteractiveMode: false,
    isTranscriptVisible: false,
    isSleepTimerActive: false,
    sleepTimerMinutes: 30
  })
  
  const [isRecording, setIsRecording] = useState(false)
  const [currentSegment, setCurrentSegment] = useState<PrayerSegment | null>(null)
  const [userResponse, setUserResponse] = useState('')
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const recognitionRef = useRef<any>(null)
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ===== SPEECH RECOGNITION SETUP =====
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'pl-PL'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        
        setUserResponse(transcript)
        
        // Sprawdź czy odpowiedź jest poprawna
        if (currentSegment?.expectedResponse) {
          const isCorrect = transcript.toLowerCase().includes(
            currentSegment.expectedResponse.toLowerCase()
          )
          if (isCorrect) {
            handleCorrectResponse()
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
    }
  }, [currentSegment])

  // ===== INTERACTIVE MODE HANDLER =====
  useEffect(() => {
    if (playerState.isInteractiveMode && playerState.isPlaying && currentContent.prayerSegments) {
      const segment = currentContent.prayerSegments.find(
        seg => seg.startTime <= playerState.currentTime && 
               seg.startTime + 5 > playerState.currentTime
      )
      
      if (segment && segment.waitForResponse && segment.id !== currentSegment?.id) {
        pauseAndWaitForResponse(segment)
      }
    }
  }, [playerState.currentTime, playerState.isInteractiveMode])

  // ===== FUNKCJE PLAYERA =====
  const togglePlay = () => {
    if (audioRef.current) {
      if (playerState.isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
    }
  }

  const changeMode = (modeId: string) => {
    setPlayerState(prev => ({
      ...prev,
      currentMode: modeId,
      isInteractiveMode: modeId === 'interactive'
    }))
    
    // Specjalne ustawienia dla trybów
    switch (modeId) {
      case 'meditation':
        setPlayerState(prev => ({ ...prev, playbackSpeed: 0.8 }))
        break
      case 'study':
        setPlayerState(prev => ({ ...prev, isTranscriptVisible: true }))
        break
      case 'sleep':
        activateSleepTimer(30)
        break
    }
    
    setShowModeSelector(false)
    toast.success(`Tryb: ${playerModes.find(m => m.id === modeId)?.name}`)
  }

  const pauseAndWaitForResponse = (segment: PrayerSegment) => {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlayerState(prev => ({ ...prev, isPlaying: false }))
      setCurrentSegment(segment)
      toast.info(`Twoja kolej: "${segment.expectedResponse}"`)
      
      // Auto-start recording
      startRecording()
      
      // Timeout jeśli użytkownik nie odpowie
      setTimeout(() => {
        if (currentSegment?.id === segment.id) {
          resumeAfterResponse()
        }
      }, segment.responseTimeout || 5000)
    }
  }

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start()
      setIsRecording(true)
      setUserResponse('')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleCorrectResponse = () => {
    toast.success('Świetnie! 🙏')
    stopRecording()
    resumeAfterResponse()
  }

  const resumeAfterResponse = () => {
    setCurrentSegment(null)
    setUserResponse('')
    if (audioRef.current) {
      audioRef.current.play()
      setPlayerState(prev => ({ ...prev, isPlaying: true }))
    }
  }

  const skipToChapter = (chapter: Chapter) => {
    if (audioRef.current) {
      audioRef.current.currentTime = chapter.startTime
      setPlayerState(prev => ({ ...prev, currentTime: chapter.startTime }))
    }
    setShowChapters(false)
  }

  const activateSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }
    
    setPlayerState(prev => ({
      ...prev,
      isSleepTimerActive: true,
      sleepTimerMinutes: minutes
    }))
    
    sleepTimerRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause()
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          isSleepTimerActive: false
        }))
        toast.info('Timer snu zakończony')
      }
    }, minutes * 60 * 1000)
    
    toast.success(`Timer snu: ${minutes} minut`)
  }

  const changePlaybackSpeed = (speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
      setPlayerState(prev => ({ ...prev, playbackSpeed: speed }))
    }
  }

  // ===== RENDER =====
  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ODB Player Premium
            <Sparkles className="inline w-8 h-8 text-secondary ml-2" />
          </h1>
          <p className="text-lg text-white/70">
            Zaawansowany odtwarzacz duchowych treści
          </p>
        </motion.div>

        {/* Main Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isFullscreen ? 'fixed inset-0 z-50 p-8' : ''}`}
        >
          <GlassCard className="p-6 md:p-8">
            {/* Current Mode Indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {playerModes.find(m => m.id === playerState.currentMode) && (
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${
                    playerModes.find(m => m.id === playerState.currentMode)!.color
                  }`}>
                    {(() => {
                      const mode = playerModes.find(m => m.id === playerState.currentMode)!
                      const Icon = mode.icon
                      return <Icon className="w-6 h-6 text-white" />
                    })()}
                  </div>
                )}
                <div>
                  <h3 className="text-white font-bold">
                    {playerModes.find(m => m.id === playerState.currentMode)?.name}
                  </h3>
                  <p className="text-white/50 text-sm">
                    {playerModes.find(m => m.id === playerState.currentMode)?.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModeSelector(true)}
                  className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                >
                  <Settings className="w-5 h-5 text-white/70" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-white/70" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-white/70" />
                  )}
                </button>
              </div>
            </div>

            {/* Album Art & Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden">
                <img
                  src={currentContent.thumbnail}
                  alt={currentContent.title}
                  className="w-full h-full object-cover"
                />
                {playerState.isInteractiveMode && (
                  <div className="absolute top-4 right-4 p-2 bg-purple-500 rounded-full animate-pulse">
                    <Church className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentContent.title}
                </h2>
                <p className="text-white/70 mb-4">{currentContent.author}</p>
                
                {/* Interactive Mode Response */}
                {playerState.isInteractiveMode && currentSegment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-purple-500/20 rounded-xl border border-purple-500/30"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Church className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">Ksiądz:</p>
                        <p className="text-white/90">{currentSegment.text}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-white/70 text-sm mb-2">Twoja odpowiedź:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-3 bg-glass-white rounded-lg">
                            <p className="text-white">
                              {userResponse || currentSegment.expectedResponse}
                            </p>
                          </div>
                          <button
                            onClick={() => isRecording ? stopRecording() : startRecording()}
                            className={`p-3 rounded-lg transition-all ${
                              isRecording 
                                ? 'bg-red-500 animate-pulse' 
                                : 'bg-glass-white hover:bg-glass-secondary'
                            }`}
                          >
                            {isRecording ? (
                              <MicOff className="w-5 h-5 text-white" />
                            ) : (
                              <Mic className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={resumeAfterResponse}
                      className="mt-3 text-sm text-purple-400 hover:text-purple-300"
                    >
                      Pomiń i kontynuuj →
                    </button>
                  </motion.div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentContent.hasTranscript && (
                    <button
                      onClick={() => setPlayerState(prev => ({
                        ...prev,
                        isTranscriptVisible: !prev.isTranscriptVisible
                      }))}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        playerState.isTranscriptVisible
                          ? 'bg-glass-secondary text-white'
                          : 'bg-glass-white text-white/70 hover:text-white'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Tekst
                    </button>
                  )}
                  
                  {currentContent.chapters && (
                    <button
                      onClick={() => setShowChapters(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-glass-white rounded-lg text-white/70 hover:text-white text-sm transition-all"
                    >
                      <Book className="w-4 h-4" />
                      Rozdziały
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowStats(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-glass-white rounded-lg text-white/70 hover:text-white text-sm transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Statystyki
                  </button>
                </div>

                {/* Playback Speed */}
                <div className="flex items-center gap-4">
                  <span className="text-white/50 text-sm">Prędkość:</span>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded text-sm transition-all ${
                        playerState.playbackSpeed === speed
                          ? 'bg-secondary text-primary'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/50 mb-2">
                <span>{formatTime(playerState.currentTime)}</span>
                <span>{formatTime(currentContent.duration)}</span>
              </div>
              <div className="relative h-2 bg-glass-white rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-secondary"
                  style={{ width: `${(playerState.currentTime / currentContent.duration) * 100}%` }}
                />
                {/* Chapter markers */}
                {currentContent.chapters?.map(chapter => (
                  <div
                    key={chapter.id}
                    className="absolute top-0 w-0.5 h-full bg-white/30"
                    style={{ left: `${(chapter.startTime / currentContent.duration) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                <Shuffle className={`w-5 h-5 ${
                  playerState.isShuffle ? 'text-secondary' : 'text-white/70'
                }`} />
              </button>
              
              <button className="p-3 rounded-lg hover:bg-glass-white transition-colors">
                <SkipBack className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-4 bg-secondary rounded-full hover:bg-secondary/90 transition-colors"
              >
                {playerState.isPlaying ? (
                  <Pause className="w-8 h-8 text-primary" />
                ) : (
                  <Play className="w-8 h-8 text-primary" />
                )}
              </button>
              
              <button className="p-3 rounded-lg hover:bg-glass-white transition-colors">
                <SkipForward className="w-6 h-6 text-white" />
              </button>
              
              <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                <Repeat className={`w-5 h-5 ${
                  playerState.isRepeat ? 'text-secondary' : 'text-white/70'
                }`} />
              </button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                  <Heart className="w-5 h-5 text-white/70" />
                </button>
                <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                  <Download className="w-5 h-5 text-white/70" />
                </button>
                <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                  <Share2 className="w-5 h-5 text-white/70" />
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                {playerState.isSleepTimerActive && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-glass-white rounded-lg">
                    <Timer className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">
                      {playerState.sleepTimerMinutes} min
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                    className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                  >
                    {playerState.isMuted ? (
                      <VolumeX className="w-5 h-5 text-white/70" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white/70" />
                    )}
                  </button>
                  <div className="w-24 h-1 bg-glass-white rounded-full">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${playerState.volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript (jeśli włączony) */}
            {playerState.isTranscriptVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-glass-white rounded-xl max-h-64 overflow-y-auto"
              >
                <h3 className="text-white font-bold mb-3">Tekst</h3>
                <div className="space-y-2 text-white/70">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                  <p className="text-white">
                    <span className="text-secondary font-medium">[00:45]</span> Aktualnie odtwarzany fragment
                  </p>
                  <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Mode Selector Modal */}
        <GlassModal
          isOpen={showModeSelector}
          onClose={() => setShowModeSelector(false)}
          title="Wybierz tryb odtwarzania"
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerModes.map((mode) => {
              const Icon = mode.icon
              const isActive = playerState.currentMode === mode.id
              
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => changeMode(mode.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-secondary bg-glass-secondary'
                      : 'border-glass-white bg-glass-white hover:border-glass-secondary'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-1">{mode.name}</h3>
                  <p className="text-white/70 text-sm">{mode.description}</p>
                  {isActive && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-secondary">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Aktywny</span>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
          
          {/* Dodatkowe opcje */}
          <div className="mt-6 space-y-4">
            <h4 className="text-white font-bold mb-3">Opcje dodatkowe</h4>
            
            {/* Sleep Timer */}
            <div className="flex items-center justify-between p-3 bg-glass-white rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-white/70" />
                <span className="text-white">Timer snu</span>
              </div>
              <GlassSelect
                value={playerState.sleepTimerMinutes.toString()}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value)
                  setPlayerState(prev => ({ ...prev, sleepTimerMinutes: minutes }))
                  if (minutes > 0) activateSleepTimer(minutes)
                }}
                options={[
                  { value: '0', label: 'Wyłączony' },
                  { value: '15', label: '15 minut' },
                  { value: '30', label: '30 minut' },
                  { value: '60', label: '1 godzina' },
                  { value: '120', label: '2 godziny' }
                ]}
              />
            </div>

            {/* Background Sounds */}
            <div className="flex items-center justify-between p-3 bg-glass-white rounded-lg">
              <div className="flex items-center gap-3">
                <Waves className="w-5 h-5 text-white/70" />
                <span className="text-white">Dźwięki tła</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded hover:bg-glass-secondary transition-colors">
                  <Waves className="w-4 h-4 text-white/70" />
                </button>
                <button className="p-2 rounded hover:bg-glass-secondary transition-colors">
                  <TreePine className="w-4 h-4 text-white/70" />
                </button>
                <button className="p-2 rounded hover:bg-glass-secondary transition-colors">
                  <Coffee className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
          </div>
        </GlassModal>

        {/* Chapters Modal */}
        <GlassModal
          isOpen={showChapters}
          onClose={() => setShowChapters(false)}
          title="Rozdziały"
          size="md"
        >
          <div className="space-y-2">
            {currentContent.chapters?.map((chapter, index) => {
              const isActive = playerState.currentTime >= chapter.startTime && 
                              playerState.currentTime < chapter.endTime
              
              return (
                <button
                  key={chapter.id}
                  onClick={() => skipToChapter(chapter)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-glass-secondary border border-secondary'
                      : 'bg-glass-white hover:bg-glass-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-secondary font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{chapter.title}</p>
                        <p className="text-white/50 text-sm">
                          {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2 text-secondary">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                        <span className="text-sm">Teraz</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </GlassModal>

        {/* Statistics Modal */}
        <GlassModal
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          title="Twoje statystyki"
          size="md"
        >
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-4 text-center">
                <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">127h</div>
                <p className="text-white/70 text-sm">Czas słuchania</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <Award className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">47</div>
                <p className="text-white/70 text-sm">Ukończone</p>
              </GlassCard>
            </div>

            {/* Daily Streak */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold">Codzienna seria</h4>
                <div className="flex items-center gap-1 text-secondary">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">12 dni</span>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded ${
                      i < 5 ? 'bg-secondary' : 'bg-glass-white'
                    }`}
                  />
                ))}
              </div>
            </GlassCard>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-white font-bold mb-3">Ulubione kategorie</h4>
              <div className="space-y-2">
                {[
                  { name: 'Konferencje', percent: 40, color: 'bg-blue-500' },
                  { name: 'Medytacje', percent: 30, color: 'bg-purple-500' },
                  { name: 'Modlitwy', percent: 20, color: 'bg-pink-500' },
                  { name: 'Audiobooki', percent: 10, color: 'bg-green-500' }
                ].map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{cat.name}</span>
                      <span className="text-white/70">{cat.percent}%</span>
                    </div>
                    <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color}`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassModal>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={currentContent.url}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget
            setPlayerState(prev => ({
              ...prev,
              currentTime: audio.currentTime,
              duration: audio.duration || 0
            }))
          }}
          onEnded={() => {
            if (playerState.isRepeat) {
              audioRef.current?.play()
            } else {
              setPlayerState(prev => ({ ...prev, isPlaying: false }))
            }
          }}
        />
      </div>
    </div>
  )
}

// Helper function
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}