'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Track {
  id: string
  title: string
  url: string
  duration: number
  type: 'audio' | 'video'
  thumbnail?: string
  courseId?: string
  previewDuration?: number
  isPremium?: boolean
}

interface PlayerProps {
  tracks: Track[]
  initialTrackId?: string
  onTrackChange?: (track: Track) => void
  userType: 'free' | 'premium'
}

export default function CorePlayer({
  tracks,
  initialTrackId,
  onTrackChange,
  userType
}: PlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none')
  const [showPreviewPrompt, setShowPreviewPrompt] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (initialTrackId) {
      const track = tracks.find(t => t.id === initialTrackId)
      if (track) {
        setCurrentTrack(track)
        setQueue(tracks.filter(t => t.id !== initialTrackId))
      }
    }
  }, [initialTrackId, tracks])

  const handlePreviewTimeout = () => {
    if (userType === 'free' && currentTrack?.previewDuration) {
      previewTimeoutRef.current = setTimeout(() => {
        pause()
        setShowPreviewPrompt(true)
      }, currentTrack.previewDuration * 1000)
    }
  }

  const play = () => {
    if (currentTrack?.type === 'audio' && audioRef.current) {
      audioRef.current.play()
      handlePreviewTimeout()
    } else if (currentTrack?.type === 'video' && videoRef.current) {
      videoRef.current.play()
      handlePreviewTimeout()
    }
    setIsPlaying(true)
  }

  const pause = () => {
    if (currentTrack?.type === 'audio' && audioRef.current) {
      audioRef.current.pause()
    } else if (currentTrack?.type === 'video' && videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
    }
  }

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    const progress = (currentTime / duration) * 100
    setProgress(progress)
  }

  const handleSeek = (value: number) => {
    const time = (value / 100) * (currentTrack?.duration || 0)
    if (currentTrack?.type === 'audio' && audioRef.current) {
      audioRef.current.currentTime = time
    } else if (currentTrack?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = time
    }
    setProgress(value)
  }

  const playNext = () => {
    if (queue.length === 0) {
      if (repeatMode === 'all') {
        setQueue(tracks.filter(t => t.id !== currentTrack?.id))
      } else {
        return
      }
    }

    const nextTrack = isShuffle
      ? queue[Math.floor(Math.random() * queue.length)]
      : queue[0]

    setCurrentTrack(nextTrack)
    setQueue(queue.filter(t => t.id !== nextTrack.id))
    onTrackChange?.(nextTrack)
  }

  const playPrevious = () => {
    // Implementation for playing previous track
  }

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle)
    if (!isShuffle) {
      setQueue([...queue].sort(() => Math.random() - 0.5))
    }
  }

  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all']
    const currentIndex = modes.indexOf(repeatMode)
    setRepeatMode(modes[(currentIndex + 1) % modes.length])
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      {/* Video Player */}
      {currentTrack?.type === 'video' && (
        <div className="relative aspect-video mb-4">
          <video
            ref={videoRef}
            src={currentTrack.url}
            className="w-full rounded"
            poster={currentTrack.thumbnail}
            onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
            onEnded={() => {
              if (repeatMode === 'one') {
                if (videoRef.current) videoRef.current.play()
              } else {
                playNext()
              }
            }}
          />
        </div>
      )}

      {/* Audio Player */}
      {currentTrack?.type === 'audio' && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
          onEnded={() => {
            if (repeatMode === 'one') {
              if (audioRef.current) audioRef.current.play()
            } else {
              playNext()
            }
          }}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col space-y-4">
        {/* Track Info */}
        <div className="flex items-center space-x-4">
          {currentTrack?.thumbnail && (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-16 h-16 rounded object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold">{currentTrack?.title}</h3>
            {currentTrack?.courseId && (
              <span className="text-sm text-gray-500">Kurs</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            {formatTime(currentTrack?.type === 'audio' ? audioRef.current?.currentTime : videoRef.current?.currentTime)}
          </span>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <span className="text-sm">{formatTime(currentTrack?.duration)}</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full ${isShuffle ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons">shuffle</span>
          </button>
          <button
            onClick={playPrevious}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <span className="material-icons">skip_previous</span>
          </button>
          <button
            onClick={() => (isPlaying ? pause() : play())}
            className="p-4 rounded-full bg-primary text-white hover:bg-primary/90"
          >
            <span className="material-icons">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={playNext}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <span className="material-icons">skip_next</span>
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full ${repeatMode !== 'none' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            <span className="material-icons">
              {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
            </span>
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <span className="material-icons">
            {volume === 0 ? 'volume_off' : 'volume_up'}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const value = parseFloat(e.target.value)
              setVolume(value)
              if (audioRef.current) audioRef.current.volume = value
              if (videoRef.current) videoRef.current.volume = value
            }}
            className="w-24"
          />
        </div>
      </div>

      {/* Preview Prompt */}
      {showPreviewPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg"
        >
          <h4 className="font-semibold mb-2">Wersja Premium</h4>
          <p className="text-sm mb-4">
            Odblokuj pełną wersję, aby kontynuować odtwarzanie
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded">
            Przejdź na Premium
          </button>
        </motion.div>
      )}
    </div>
  )
}

const formatTime = (seconds?: number) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
