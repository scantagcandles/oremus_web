export interface AudioTrack {
  id: string
  title: string
  url: string
  duration: number
  type: 'prayer' | 'meditation' | 'mass' | 'course'
  prayerSegments?: PrayerSegment[]
  hasInteractive: boolean
  chapters?: Chapter[]
  thumbnail?: string
  description?: string
  tags?: string[]
  isPremium: boolean
}

export interface PrayerSegment {
  id: string
  type: 'priest' | 'response' | 'reading' | 'meditation'
  text: string
  startTime: number
  expectedResponse?: string
  waitForResponse?: boolean
  responseTimeout?: number
}

export interface Chapter {
  id: string
  title: string
  startTime: number
  endTime?: number
  description?: string
}

export interface UserProgress {
  userId: string
  trackId: string
  progress: number
  completed: boolean
  lastPlayed: string
  streak: number
}

export interface UserPreferences {
  userId: string
  preferredMode: 'standard' | 'interactive' | 'meditation' | 'study' | 'sleep' | 'focus'
  volume: number
  playbackRate: number
  backgroundSound: string | null
  autoplay: boolean
}
