// web/components/features/player/InteractivePrayerPlayer.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, Play, Pause, SkipForward, Volume2, 
  Church, Heart, CheckCircle, AlertCircle, Loader,
  MessageCircle, Eye, EyeOff, Settings, X
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import GlassModal from '@/components/glass/GlassModal'
import { toast } from 'react-hot-toast'

// Typy dla interaktywnej modlitwy
interface PrayerSegment {
  id: string
  type: 'priest' | 'response' | 'all' | 'instruction'
  text: string
  audioUrl?: string
  expectedResponse?: string
  waitForResponse?: boolean
  duration?: number
}

interface InteractivePrayer {
  id: string
  title: string
  type: 'mass' | 'rosary' | 'litany' | 'responsive'
  segments: PrayerSegment[]
  thumbnail: string
}

// Przykładowa interaktywna msza
const sampleMass: InteractivePrayer = {
  id: '1',
  title: 'Msza Święta - Dialog Liturgiczny',
  type: 'mass',
  thumbnail: 'https://images.unsplash.com/photo-1559882869-0aa7e65ce3da',
  segments: [
    {
      id: '1',
      type: 'priest',
      text: 'W imię Ojca i Syna, i Ducha Świętego.',
      waitForResponse: true,
      expectedResponse: 'Amen',
      duration: 3000
    },
    {
      id: '2',
      type: 'response',
      text: 'Amen.',
      duration: 2000
    },
    {
      id: '3',
      type: 'priest',
      text: 'Pan z wami.',
      waitForResponse: true,
      expectedResponse: 'I z duchem twoim',
      duration: 2000
    },
    {
      id: '4',