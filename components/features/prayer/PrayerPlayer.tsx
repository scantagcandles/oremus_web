'use client'

import { useState, useRef, useEffect } from 'react'

interface Prayer {
  id: string
  title: string
  audioUrl: string
  duration: number
  thumbnail?: string
  text?: string
  language?: string
}

export default function PrayerPlayer({ prayer }: { prayer: Prayer }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [showText, setShowText] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
      audioRef.current.volume = volume
    }
  }, [speed, volume])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = (parseInt(e.target.value) / 100) * audioRef.current.duration
      audioRef.current.currentTime = time
      setProgress(parseInt(e.target.value))
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {prayer.thumbnail && (
        <img
          src={prayer.thumbnail}
          alt={prayer.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{prayer.title}</h3>
        
        {prayer.text && (
          <button
            onClick={() => setShowText(!showText)}
            className="text-sm text-primary mb-2 hover:underline"
          >
            {showText ? 'Ukryj tekst' : 'Pokaż tekst'}
          </button>
        )}

        {showText && prayer.text && (
          <div className="mb-4 p-4 bg-gray-50 rounded text-sm">
            <p>{prayer.text}</p>
            {prayer.language && (
              <span className="text-xs text-gray-500 mt-2 block">
                Język: {prayer.language}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? (
              <span className="material-icons">pause</span>
            ) : (
              <span className="material-icons">play_arrow</span>
            )}
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full"
            />
            {audioRef.current && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(audioRef.current.currentTime)}</span>
                <span>{formatTime(audioRef.current.duration)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-gray-500">volume_up</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={prayer.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
