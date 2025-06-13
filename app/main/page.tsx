// web/app/(main)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Flame, Globe, Church, ShoppingBag, Users, Heart,
  TrendingUp, Clock, MapPin, Calendar, Music, GraduationCap, Library
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { getActivePrayerCount, getPublicIntentions } from '@/lib/supabase/queries'
import { subscribeToActivePrayers } from '@/lib/supabase/queries'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

// Quick action items
const quickActions = [
  {
    id: 'candle',
    title: 'Zapal Świecę',
    description: 'Rozpocznij modlitwę ze świecą NFC',
    icon: Flame,
    href: '/candle',
    color: 'from-prayer to-secondary',
    highlight: true
  },
  {
    id: 'prayer',
    title: 'Globalna Modlitwa',
    description: 'Dołącz do modlących się',
    icon: Globe,
    href: '/prayer',
    color: 'from-prayer to-prayer/50'
  },
  {
    id: 'mass',
    title: 'Transmisje Mszy',
    description: 'Oglądaj Msze na żywo',
    icon: Church,
    href: '/mass',
    color: 'from-mass to-mass/50'
  },
  {
    id: 'shop',
    title: 'Sklep Świec',
    description: 'Kup święte świece',
    icon: ShoppingBag,
    href: '/shop',
    color: 'from-warning to-warning/50'
  },
  {
    id: 'player',
    title: 'ODB Player',
    description: 'Słuchaj konferencji i muzyki',
    icon: Music,
    href: '/player',
    color: 'from-player to-player/50',
    isNew: true
  },
  {
    id: 'academy',
    title: 'Akademia Formacyjna',
    description: 'Kursy duchowe online',
    icon: GraduationCap,
    href: '/academy',
    color: 'from-academy to-academy/50',
    isNew: true
  }
]

// Statistics cards
const statsConfig = [
  {
    id: 'active-prayers',
    label: 'Modlących się teraz',
    icon: Users,
    color: 'text-prayer',
    suffix: 'osób'
  },
  {
    id: 'candles-lit',
    label: 'Zapalonych świec',
    icon: Flame,
    color: 'text-secondary',
    suffix: 'świec'
  },
  {
    id: 'masses-today',
    label: 'Mszy dzisiaj',
    icon: Church,
    color: 'text-mass',
    suffix: 'transmisji'
  },
  {
    id: 'community-size',
    label: 'Członków wspólnoty',
    icon: Heart,
    color: 'text-error',
    suffix: 'osób'
  }
]

export default function HomePage() {
  const [stats, setStats] = useState({
    'active-prayers': 0,
    'candles-lit': 0,
    'masses-today': 0,
    'community-size': 0
  })
  const [intentions, setIntentions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial data
    loadStats()
    loadIntentions()

    // Subscribe to real-time updates
    const subscription = subscribeToActivePrayers((payload) => {
      console.log('Prayer update:', payload)
      loadStats()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadStats = async () => {
    try {
      const prayerCount = await getActivePrayerCount()
      setStats(prev => ({
        ...prev,
        'active-prayers': prayerCount,
        'candles-lit': Math.floor(prayerCount * 0.7),
        'masses-today': 12,
        'community-size': 15420
      }))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadIntentions = async () => {
    try {
      const data = await getPublicIntentions(5)
      setIntentions(data || [])
    } catch (error) {
      console.error('Error loading intentions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Witaj w <span className="text-secondary">OREMUS</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Wspólnota modlitwy online. Zapal świecę, módl się z innymi, uczestniczaj we Mszach.
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon
            const value = stats[stat.id as keyof typeof stats]
            
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <GlassCard className="p-6 text-center" hover>
                  <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <motion.div
                    className="text-3xl font-bold text-white mb-1"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {value.toLocaleString('pl-PL')}
                  </motion.div>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Szybkie akcje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Link href={action.href}>
                    <GlassCard 
                      className="p-6 h-full group relative overflow-hidden" 
                      hover
                    >
                      {/* Gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <Icon className="w-10 h-10 text-secondary" />
                          {action.isNew && (
                            <span className="text-xs bg-secondary text-primary px-2 py-1 rounded-full font-bold">
                              NOWE
                            </span>
                          )}
                          {action.highlight && (
                            <motion.div
                              className="w-3 h-3 bg-secondary rounded-full"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {action.title}
                        </h3>
                        <p className="text-white/70">
                          {action.description}
                        </p>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Intentions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Najnowsze intencje</h2>
            <Link href="/prayer">
              <GlassButton variant="ghost" size="sm">
                Zobacz wszystkie
              </GlassButton>
            </Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <GlassCard className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-glass-white rounded w-3/4"></div>
                  <div className="h-4 bg-glass-white rounded w-1/2"></div>
                </div>
              </GlassCard>
            ) : intentions.length > 0 ? (
              intentions.map((intention, index) => (
                <motion.div
                  key={intention.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-glass-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white mb-2">{intention.content}</p>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>{intention.profiles?.full_name || 'Anonim'}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(intention.created_at), {
                              addSuffix: true,
                              locale: pl
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <GlassCard className="p-6 text-center">
                <p className="text-white/70">Brak publicznych intencji</p>
              </GlassCard>
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Nadchodzące wydarzenia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-glass-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Msza Święta Online</h3>
                  <p className="text-sm text-white/70 mb-2">Codziennie o 19:00</p>
                  <GlassButton size="sm" variant="secondary">
                    Ustaw przypomnienie
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-glass-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Wspólna Modlitwa Różańcowa</h3>
                  <p className="text-sm text-white/70 mb-2">Każdy piątek o 20:00</p>
                  <GlassButton size="sm" variant="secondary">
                    Dołącz do grupy
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  )
}