// web/app/(main)/player/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Music, Play, Pause, SkipBack, SkipForward, Volume2,
  Heart, Share2, Download, Clock, Shuffle, Repeat,
  ChevronRight, Search, Filter, Sparkles, Crown,
  Headphones, Mic, Book, Church, Star, TrendingUp,
  Lock, Check
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { formatTime } from '@/lib/utils'

// Categories
const categories = [
  { id: 'all', name: 'Wszystko', icon: Music },
  { id: 'conferences', name: 'Konferencje', icon: Mic },
  { id: 'meditations', name: 'Medytacje', icon: Headphones },
  { id: 'prayers', name: 'Modlitwy', icon: Church },
  { id: 'audiobooks', name: 'Audiobooki', icon: Book },
  { id: 'music', name: 'Muzyka', icon: Music }
]

// Sample tracks
const tracks = [
  {
    id: '1',
    title: 'Konferencja: Sens cierpienia',
    artist: 'o. Jan Góra OP',
    album: 'Lednica 2023',
    duration: 3240,
    category: 'conferences',
    image: 'https://images.unsplash.com/photo-1492176273113-2d51f47b23b0',
    isPremium: false,
    isNew: true,
    plays: 15420
  },
  {
    id: '2',
    title: 'Medytacja: Spotkanie z Jezusem',
    artist: 'ks. Piotr Pawlukiewicz',
    album: 'Medytacje ignacjańskie',
    duration: 1800,
    category: 'meditations',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    isPremium: true,
    plays: 8932
  },
  {
    id: '3',
    title: 'Różaniec - Tajemnice Radosne',
    artist: 'Wspólnota OREMUS',
    album: 'Modlitwy codzienne',
    duration: 1200,
    category: 'prayers',
    image: 'https://images.unsplash.com/photo-1605982048179-91970d0d3201',
    isPremium: false,
    plays: 23150
  },
  {
    id: '4',
    title: 'Audiobook: Dzienniczek św. Faustyny (rozdział 1)',
    artist: 'Narratorka: Anna Dereszowska',
    album: 'Dzienniczek',
    duration: 2700,
    category: 'audiobooks',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    isPremium: true,
    isNew: true,
    plays: 5621
  },
  {
    id: '5',
    title: 'Barka',
    artist: 'Arka Noego',
    album: 'Pieśni religijne',
    duration: 245,
    category: 'music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    isPremium: false,
    plays: 31240
  },
  {
    id: '6',
    title: 'Konferencja: Miłość i odpowiedzialność',
    artist: 'kard. Karol Wojtyła',
    album: 'Archiwum',
    duration: 5400,
    category: 'conferences',
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637',
    isPremium: true,
    plays: 18750
  }
]

// Playlists
const playlists = [
  {
    id: '1',
    name: 'Medytacje na każdy dzień',
    tracks: 24,
    duration: '8h 30min',
    image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83',
    isPremium: false
  },
  {
    id: '2',
    name: 'Konferencje Lednicy',
    tracks: 156,
    duration: '120h',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
    isPremium: true
  },
  {
    id: '3',
    name: 'Modlitwy poranne',
    tracks: 30,
    duration: '5h',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    isPremium: false
  }
]

interface PlayerState {
  isPlaying: boolean
  currentTrack: typeof tracks[0] | null
  progress: number
  volume: number
  isMuted: boolean
  isRepeat: boolean
  isShuffle: boolean
}

export default function PlayerPage() {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    progress: 0,
    volume: 0.8,
    isMuted: false,
    isRepeat: false,
    isShuffle: false
  })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showDownloads, setShowDownloads] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Filter tracks
  const filteredTracks = tracks.filter(track => {
    if (selectedCategory !== 'all' && track.category !== selectedCategory) {
      return false
    }
    if (searchQuery && !track.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !track.artist.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Play track
  const playTrack = (track: typeof tracks[0]) => {
    if (track.isPremium && !isPremium) {
      setShowPremiumModal(true)
      return
    }
    
    setPlayerState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: 0
    }))
    
    toast.success(`Odtwarzanie: ${track.title}`)
  }

  // Toggle play/pause
  const togglePlay = () => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }

  // Next track
  const nextTrack = () => {
    if (!playerState.currentTrack) return
    
    const currentIndex = filteredTracks.findIndex(t => t.id === playerState.currentTrack?.id)
    const nextIndex = (currentIndex + 1) % filteredTracks.length
    playTrack(filteredTracks[nextIndex])
  }

  // Previous track
  const previousTrack = () => {
    if (!playerState.currentTrack) return
    
    const currentIndex = filteredTracks.findIndex(t => t.id === playerState.currentTrack?.id)
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1
    playTrack(filteredTracks[prevIndex])
  }

  // Toggle favorite
  const toggleFavorite = (trackId: string) => {
    setFavorites(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    )
  }

  // Download track
  const downloadTrack = (track: typeof tracks[0]) => {
    if (track.isPremium && !isPremium) {
      setShowPremiumModal(true)
      return
    }
    
    toast.success(`Pobieranie: ${track.title}`)
    // Here you would implement actual download logic
  }

  // Share track
  const shareTrack = (track: typeof tracks[0]) => {
    navigator.clipboard.writeText(
      `Posłuchaj "${track.title}" w OREMUS Player: https://oremus.app/player/track/${track.id}`
    )
    toast.success('Link skopiowany!')
  }

  // Update progress
  useEffect(() => {
    if (!playerState.isPlaying || !playerState.currentTrack) return
    
    const interval = setInterval(() => {
      setPlayerState(prev => {
        const newProgress = prev.progress + 1
        if (newProgress >= (prev.currentTrack?.duration || 0)) {
          if (prev.isRepeat) {
            return { ...prev, progress: 0 }
          } else {
            nextTrack()
            return prev
          }
        }
        return { ...prev, progress: newProgress }
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [playerState.isPlaying, playerState.currentTrack])

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                ODB Player
                {isPremium && (
                  <Crown className="inline w-8 h-8 text-secondary ml-2" />
                )}
              </h1>
              <p className="text-lg text-white/70">
                Konferencje, medytacje, audiobooki i muzyka religijna
              </p>
            </div>
            {!isPremium && (
              <GlassButton
                onClick={() => setShowPremiumModal(true)}
                className="gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Przejdź na Premium
              </GlassButton>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                placeholder="Szukaj utworów, artystów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <GlassButton
              variant="secondary"
              onClick={() => setShowDownloads(!showDownloads)}
              className="gap-2"
            >
              <Download className="w-5 h-5" />
              Pobrane
            </GlassButton>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              
              return (
                <GlassButton
                  key={category.id}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </GlassButton>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracks List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedCategory === 'all' ? 'Wszystkie utwory' : 
                 categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              
              <div className="space-y-3">
                {filteredTracks.map((track, index) => {
                  const isCurrentTrack = playerState.currentTrack?.id === track.id
                  const isFavorite = favorites.includes(track.id)
                  
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer
                        ${isCurrentTrack ? 'bg-glass-secondary' : 'hover:bg-glass-white'}
                      `}
                      onClick={() => playTrack(track)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={track.image}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                        {track.isPremium && !isPremium && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-secondary" />
                          </div>
                        )}
                        {isCurrentTrack && playerState.isPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Music className="w-6 h-6 text-secondary" />
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium truncate">
                            {track.title}
                          </h3>
                          {track.isNew && (
                            <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-bold">
                              NOWE
                            </span>
                          )}
                        </div>
                        <p className="text-white/70 text-sm truncate">{track.artist}</p>
                        <div className="flex items-center gap-4 text-xs text-white/50 mt-1">
                          <span>{formatTime(track.duration)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {track.plays.toLocaleString('pl-PL')} odtworzeń
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(track.id)
                          }}
                          className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorite ? 'text-error fill-error' : 'text-white/50'
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadTrack(track)
                          }}
                          className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                        >
                          <Download className="w-4 h-4 text-white/50" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            shareTrack(track)
                          }}
                          className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-white/50" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Now Playing */}
            {playerState.currentTrack && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Teraz odtwarzane</h3>
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={playerState.currentTrack.image}
                      alt={playerState.currentTrack.title}
                      fill
                      className="object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                      animate={{ opacity: playerState.isPlaying ? 1 : 0.5 }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-white font-bold">{playerState.currentTrack.title}</h4>
                    <p className="text-white/70 text-sm">{playerState.currentTrack.artist}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{formatTime(playerState.progress)}</span>
                      <span>{formatTime(playerState.currentTrack.duration)}</span>
                    </div>
                    <div className="relative h-1 bg-glass-white rounded-full overflow-hidden">
                      <motion.div
                        className="absolute left-0 top-0 h-full bg-secondary"
                        animate={{ width: `${(playerState.progress / playerState.currentTrack.duration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Playlists */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Popularne playlisty</h3>
              <div className="space-y-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-glass-white transition-all cursor-pointer"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={playlist.image}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                      />
                      {playlist.isPremium && !isPremium && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-secondary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-white/50 text-xs">{playlist.tracks} utworów • {playlist.duration}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50" />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Premium Features */}
            {!isPremium && (
              <GlassCard className="p-6 bg-gradient-to-br from-secondary/20 to-player/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  <Crown className="inline w-5 h-5 text-secondary mr-1" />
                  Premium
                </h3>
                <ul className="space-y-2 text-sm text-white/70 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    Nieograniczony dostęp
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    Pobieranie offline
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    Bez reklam
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    Najwyższa jakość audio
                  </li>
                </ul>
                <GlassButton
                  size="sm"
                  className="w-full"
                  onClick={() => setShowPremiumModal(true)}
                >
                  Wypróbuj za darmo
                </GlassButton>
              </GlassCard>
            )}
          </motion.div>
        </div>

        {/* Fixed Player Bar */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40"
        >
          <GlassCard className="mx-4 mb-4 p-4">
            <div className="flex items-center gap-4">
              {/* Track Info */}
              {playerState.currentTrack ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={playerState.currentTrack.image}
                      alt={playerState.currentTrack.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">
                      {playerState.currentTrack.title}
                    </p>
                    <p className="text-white/50 text-sm truncate">
                      {playerState.currentTrack.artist}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-white/50">
                  Wybierz utwór do odtworzenia
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlayerState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))}
                  className={`p-2 rounded-lg transition-colors ${
                    playerState.isShuffle ? 'text-secondary' : 'text-white/50 hover:text-white'
                  }`}
                  disabled={!playerState.currentTrack}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                
                <button
                  onClick={previousTrack}
                  className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
                  disabled={!playerState.currentTrack}
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="p-3 bg-secondary rounded-full text-primary hover:bg-secondary/90 transition-colors"
                  disabled={!playerState.currentTrack}
                >
                  {playerState.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                
                <button
                  onClick={nextTrack}
                  className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
                  disabled={!playerState.currentTrack}
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setPlayerState(prev => ({ ...prev, isRepeat: !prev.isRepeat }))}
                  className={`p-2 rounded-lg transition-colors ${
                    playerState.isRepeat ? 'text-secondary' : 'text-white/50 hover:text-white'
                  }`}
                  disabled={!playerState.currentTrack}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                  className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="w-24 h-1 bg-glass-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${playerState.isMuted ? 0 : playerState.volume * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Premium Modal */}
        <GlassModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          title="ODB Player Premium"
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-full mb-4"
              >
                <Crown className="w-10 h-10 text-secondary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Odblokuj pełny dostęp
              </h3>
              <p className="text-white/70">
                Słuchaj bez ograniczeń, pobieraj offline
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Ponad 10 000 godzin treści',
                'Ekskluzywne konferencje i medytacje',
                'Pobieranie do słuchania offline',
                'Najwyższa jakość audio',
                'Bez reklam',
                'Wsparcie dla twórców treści'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <GlassCard className="p-4 border-2 border-secondary">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">Premium Miesięczny</h4>
                  <span className="text-2xl font-bold text-secondary">19,99 zł</span>
                </div>
                <p className="text-white/50 text-sm">Anuluj w każdej chwili</p>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">Premium Roczny</h4>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-secondary">199 zł</span>
                    <p className="text-white/50 text-xs">Oszczędzasz 40 zł</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="flex gap-3">
              <GlassButton
                className="flex-1"
                onClick={() => {
                  setIsPremium(true)
                  setShowPremiumModal(false)
                  toast.success('Witaj w ODB Player Premium!')
                }}
              >
                Rozpocznij darmowy okres próbny
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => setShowPremiumModal(false)}
              >
                Może później
              </GlassButton>
            </div>

            <p className="text-white/50 text-xs text-center">
              7 dni za darmo, potem 19,99 zł/miesiąc. Anuluj w każdej chwili.
            </p>
          </div>
        </GlassModal>
      </div>
    </div>
  )
}