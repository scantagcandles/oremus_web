// web/app/(main)/mass/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  Tv, Church, Calendar, Clock, Users, Heart, 
  Share2, Bell, BellOff, Play, Pause, Volume2,
  VolumeX, Maximize2, MessageCircle, Send
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import GlassModal from '@/components/glass/GlassModal'
import { format, addDays, isSameDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

// Dynamic import for video player
const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-glass-white rounded-2xl flex items-center justify-center">
      <div className="text-white/50">Ładowanie transmisji...</div>
    </div>
  )
})

interface MassStream {
  id: string
  title: string
  church: string
  city: string
  startTime: string
  endTime: string
  streamUrl: string
  thumbnail: string
  isLive: boolean
  viewerCount: number
  description?: string
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
}

const upcomingMasses: MassStream[] = [
  {
    id: '1',
    title: 'Msza Święta Niedzielna',
    church: 'Bazylika św. Krzyża',
    city: 'Warszawa',
    startTime: '2025-06-08T10:00:00',
    endTime: '2025-06-08T11:00:00',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1559882869-0aa7e65ce3da',
    isLive: true,
    viewerCount: 1234
  },
  {
    id: '2',
    title: 'Msza Święta Poranna',
    church: 'Kościół Mariacki',
    city: 'Kraków',
    startTime: '2025-06-08T07:00:00',
    endTime: '2025-06-08T08:00:00',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c',
    isLive: false,
    viewerCount: 567
  },
  {
    id: '3',
    title: 'Msza Święta Wieczorna',
    church: 'Katedra Wawelska',
    city: 'Kraków',
    startTime: '2025-06-08T18:00:00',
    endTime: '2025-06-08T19:00:00',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1559559386-e2febf5bad4f',
    isLive: false,
    viewerCount: 0
  }
]

export default function MassPage() {
  const [selectedMass, setSelectedMass] = useState<MassStream | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showChat, setShowChat] = useState(true)
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    // Auto-select first live mass
    const liveMass = upcomingMasses.find(mass => mass.isLive)
    if (liveMass) {
      setSelectedMass(liveMass)
    }

    // Load notification preference
    const savedNotification = localStorage.getItem('massNotifications')
    setNotificationEnabled(savedNotification === 'true')

    // Simulate chat messages
    const interval = setInterval(() => {
      if (selectedMass?.isLive) {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          user: `Użytkownik${Math.floor(Math.random() * 100)}`,
          message: 'Amen 🙏',
          timestamp: new Date()
        }].slice(-50)) // Keep last 50 messages
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedMass])

  const toggleNotifications = async () => {
    if (!notificationEnabled) {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationEnabled(true)
        localStorage.setItem('massNotifications', 'true')
        toast.success('Powiadomienia włączone')
      } else {
        toast.error('Brak uprawnień do powiadomień')
      }
    } else {
      setNotificationEnabled(false)
      localStorage.setItem('massNotifications', 'false')
      toast.success('Powiadomienia wyłączone')
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'Ty',
      message: newMessage,
      timestamp: new Date()
    }])
    
    setNewMessage('')
  }

  const shareMass = () => {
    setShowShareModal(true)
  }

  const getMassesForDate = (date: Date) => {
    return upcomingMasses.filter(mass => 
      isSameDay(new Date(mass.startTime), date)
    )
  }

  const currentDateMasses = getMassesForDate(selectedDate)

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
            Transmisje Mszy Świętych
          </h1>
          <p className="text-lg text-white/70">
            Uczestnictwuj we Mszy online z dowolnego miejsca
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              {selectedMass ? (
                <>
                  {/* Video Player */}
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                    <ReactPlayer
                      url={selectedMass.streamUrl}
                      playing={playing}
                      volume={volume}
                      muted={muted}
                      width="100%"
                      height="100%"
                      controls={false}
                    />
                    
                    {/* Live indicator */}
                    {selectedMass.isLive && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-error rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium">NA ŻYWO</span>
                      </div>
                    )}

                    {/* Viewer count */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-glass-black rounded-full">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">{selectedMass.viewerCount}</span>
                    </div>

                    {/* Controls overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setPlaying(!playing)}
                          className="p-2 bg-glass-white rounded-lg hover:bg-glass-secondary transition-colors"
                        >
                          {playing ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => setMuted(!muted)}
                          className="p-2 bg-glass-white rounded-lg hover:bg-glass-secondary transition-colors"
                        >
                          {muted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </button>

                        <div className="flex-1" />

                        <button
                          onClick={() => {/* Full screen logic */}}
                          className="p-2 bg-glass-white rounded-lg hover:bg-glass-secondary transition-colors"
                        >
                          <Maximize2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mass Info */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedMass.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-white/70">
                      <div className="flex items-center gap-2">
                        <Church className="w-4 h-4" />
                        <span>{selectedMass.church}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(selectedMass.startTime), 'HH:mm')} - 
                          {format(new Date(selectedMass.endTime), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <GlassButton
                      variant="secondary"
                      onClick={toggleNotifications}
                      className="gap-2"
                    >
                      {notificationEnabled ? (
                        <>
                          <BellOff className="w-4 h-4" />
                          Wyłącz powiadomienia
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Włącz powiadomienia
                        </>
                      )}
                    </GlassButton>
                    
                    <GlassButton
                      variant="secondary"
                      onClick={shareMass}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Udostępnij
                    </GlassButton>

                    <GlassButton
                      variant="secondary"
                      onClick={() => setShowChat(!showChat)}
                      className="gap-2 lg:hidden"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {showChat ? 'Ukryj czat' : 'Pokaż czat'}
                    </GlassButton>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-glass-white rounded-xl flex items-center justify-center">
                  <p className="text-white/50">Wybierz transmisję z listy</p>
                </div>
              )}
            </GlassCard>

            {/* Mobile Chat */}
            {showChat && selectedMass?.isLive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 lg:hidden"
              >
                <GlassCard className="p-4">
                  <h3 className="text-lg font-bold text-white mb-4">Czat na żywo</h3>
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="text-secondary font-medium">{msg.user}:</span>
                        <span className="text-white ml-2">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <GlassInput
                      placeholder="Napisz wiadomość..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <GlassButton onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Calendar */}
            <GlassCard className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">Kalendarz</h3>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, i) => {
                  const date = addDays(new Date(), i - 3)
                  const isSelected = isSameDay(date, selectedDate)
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-2 rounded-lg text-center transition-all
                        ${isSelected 
                          ? 'bg-secondary text-primary' 
                          : 'bg-glass-white text-white hover:bg-glass-secondary'
                        }
                      `}
                    >
                      <div className="text-xs">
                        {format(date, 'EEE', { locale: pl })}
                      </div>
                      <div className="text-lg font-bold">
                        {format(date, 'd')}
                      </div>
                    </button>
                  )
                })}
              </div>
            </GlassCard>

            {/* Mass Schedule */}
            <GlassCard className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">
                Harmonogram - {format(selectedDate, 'd MMMM', { locale: pl })}
              </h3>
              <div className="space-y-3">
                {currentDateMasses.length > 0 ? (
                  currentDateMasses.map((mass) => {
                    const isSelected = selectedMass?.id === mass.id
                    
                    return (
                      <button
                        key={mass.id}
                        onClick={() => setSelectedMass(mass)}
                        className={`
                          w-full p-3 rounded-xl text-left transition-all
                          ${isSelected 
                            ? 'bg-glass-secondary border border-secondary' 
                            : 'bg-glass-white hover:bg-glass-secondary'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-white">
                            {format(new Date(mass.startTime), 'HH:mm')}
                          </span>
                          {mass.isLive && (
                            <span className="text-xs bg-error text-white px-2 py-0.5 rounded-full">
                              NA ŻYWO
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-white/70">
                          {mass.church}, {mass.city}
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <p className="text-white/50 text-center py-4">
                    Brak transmisji w tym dniu
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Desktop Chat */}
            {selectedMass?.isLive && (
              <GlassCard className="p-4 hidden lg:block">
                <h3 className="text-lg font-bold text-white mb-4">Czat na żywo</h3>
                <div className="h-64 overflow-y-auto mb-4 space-y-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="text-secondary font-medium">{msg.user}:</span>
                      <span className="text-white ml-2">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <GlassInput
                    placeholder="Napisz wiadomość..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <GlassButton onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>

        {/* Share Modal */}
        <GlassModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Udostępnij transmisję"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-white/70">
              Zaproś znajomych do wspólnego uczestnictwa we Mszy
            </p>
            <div className="flex gap-2">
              <GlassButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Dołącz do mnie na transmisji Mszy Świętej: https://oremus.app/mass/${selectedMass?.id}`
                  )
                  toast.success('Link skopiowany!')
                  setShowShareModal(false)
                }}
              >
                Kopiuj link
              </GlassButton>
              <GlassButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://oremus.app/mass/${selectedMass?.id}`)}`,
                    '_blank'
                  )
                  setShowShareModal(false)
                }}
              >
                Facebook
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </div>
  )
}