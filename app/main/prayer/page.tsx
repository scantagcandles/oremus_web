// web/app/(main)/prayer/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  Globe, Users, Heart, MapPin, Search, Filter,
  ChevronRight, Flame, Clock, Share2, MessageCircle
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassTextarea } from '@/components/glass/GlassTextarea'
import GlassModal from '@/components/glass/GlassModal'
import { getActivePrayerCount, getPublicIntentions, getActiveCandles } from '@/lib/supabase/queries'
import { subscribeToIntentions, subscribeToActivePrayers } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

// Dynamic import for map component (to avoid SSR issues)
const MapComponent = dynamic(() => import('@/components/features/prayer/PrayerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-glass-white rounded-2xl flex items-center justify-center">
      <div className="text-white/50">Ładowanie mapy...</div>
    </div>
  )
})

interface Intention {
  id: string
  content: string
  user_id: string
  created_at: string
  prayer_count: number
  is_public: boolean
  profiles?: {
    full_name: string
    avatar_url: string | null
  }
}

interface ActiveCandle {
  id: string
  location: { lat: number; lng: number }
  city: string
  country: string
  intention?: string
  user_name?: string
}

export default function PrayerPage() {
  const [activePrayerCount, setActivePrayerCount] = useState(0)
  const [intentions, setIntentions] = useState<Intention[]>([])
  const [activeCandles, setActiveCandles] = useState<ActiveCandle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'popular'>('recent')
  const [showAddIntention, setShowAddIntention] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null)
  const [newIntention, setNewIntention] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
    
    // Subscribe to real-time updates
    const prayerSub = subscribeToActivePrayers(() => {
      loadActivePrayerCount()
    })

    const intentionSub = subscribeToIntentions('global', () => {
      loadIntentions()
    })

    return () => {
      prayerSub.unsubscribe()
      intentionSub.unsubscribe()
    }
  }, [filterType])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      loadActivePrayerCount(),
      loadIntentions(),
      loadActiveCandles()
    ])
    setLoading(false)
  }

  const loadActivePrayerCount = async () => {
    try {
      const count = await getActivePrayerCount()
      setActivePrayerCount(count)
    } catch (error) {
      console.error('Error loading prayer count:', error)
    }
  }

  const loadIntentions = async () => {
    try {
      let data = await getPublicIntentions(50)
      
      // Apply filters
      if (filterType === 'popular') {
        data = data?.sort((a, b) => (b.prayer_count || 0) - (a.prayer_count || 0)) || []
      }
      
      setIntentions(data || [])
    } catch (error) {
      console.error('Error loading intentions:', error)
    }
  }

  const loadActiveCandles = async () => {
    try {
      const candles = await getActiveCandles()
      
      // Transform to map format
      const mapCandles = candles?.map(candle => ({
        id: candle.id,
        location: {
          lat: candle.location?.lat || 52.2297,
          lng: candle.location?.lng || 21.0122
        },
        city: candle.city || 'Nieznane',
        country: candle.country || 'Polska',
        intention: candle.prayer_sessions?.[0]?.intention,
        user_name: candle.prayer_sessions?.[0]?.profiles?.full_name
      })) || []
      
      setActiveCandles(mapCandles)
    } catch (error) {
      console.error('Error loading candles:', error)
    }
  }

  const submitIntention = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Musisz być zalogowany')
      return
    }

    try {
      const { error } = await supabase
        .from('prayer_intentions')
        .insert({
          user_id: user.id,
          content: newIntention,
          is_public: isPublic,
          candle_id: 'global'
        })

      if (error) throw error

      toast.success('Intencja została dodana')
      setNewIntention('')
      setShowAddIntention(false)
      loadIntentions()
    } catch (error) {
      console.error('Error submitting intention:', error)
      toast.error('Nie udało się dodać intencji')
    }
  }

  const prayForIntention = async (intentionId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Musisz być zalogowany')
      return
    }

    try {
      // Record prayer
      const { error } = await supabase
        .from('intention_prayers')
        .insert({
          intention_id: intentionId,
          user_id: user.id
        })

      if (error && error.code !== '23505') { // Ignore duplicate error
        throw error
      }

      // Update local count
      setIntentions(prev => prev.map(intention => 
        intention.id === intentionId 
          ? { ...intention, prayer_count: (intention.prayer_count || 0) + 1 }
          : intention
      ))

      toast.success('Modlisz się w tej intencji')
    } catch (error) {
      console.error('Error praying for intention:', error)
      toast.error('Nie udało się zapisać modlitwy')
    }
  }

  const shareIntention = (intention: Intention) => {
    setSelectedIntention(intention)
    setShowShareModal(true)
  }

  const filteredIntentions = intentions.filter(intention =>
    intention.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Globalna Modlitwa
          </h1>
          <p className="text-lg text-white/70">
            Połącz się duchowo z modlącymi się na całym świecie
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <GlassCard className="p-6 text-center">
            <Users className="w-10 h-10 text-prayer mx-auto mb-3" />
            <motion.div
              className="text-3xl font-bold text-white mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
            >
              {activePrayerCount.toLocaleString('pl-PL')}
            </motion.div>
            <p className="text-white/70">Modlących się teraz</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Flame className="w-10 h-10 text-secondary mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {activeCandles.length.toLocaleString('pl-PL')}
            </div>
            <p className="text-white/70">Płonących świec</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Heart className="w-10 h-10 text-error mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {intentions.length.toLocaleString('pl-PL')}
            </div>
            <p className="text-white/70">Intencji modlitewnych</p>
          </GlassCard>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Mapa modlących się</h2>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4" />
                <span>Świece płonące na świecie</span>
              </div>
            </div>
            <div className="h-[400px] rounded-xl overflow-hidden">
              <MapComponent candles={activeCandles} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Intentions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <GlassInput
                placeholder="Szukaj intencji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <GlassButton
                variant={filterType === 'recent' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('recent')}
              >
                Najnowsze
              </GlassButton>
              <GlassButton
                variant={filterType === 'popular' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('popular')}
              >
                Popularne
              </GlassButton>
              <GlassButton
                onClick={() => setShowAddIntention(true)}
                className="gap-2"
              >
                <Heart className="w-4 h-4" />
                Dodaj intencję
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              <GlassCard className="p-6 col-span-full">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-glass-white rounded w-3/4"></div>
                  <div className="h-4 bg-glass-white rounded w-1/2"></div>
                </div>
              </GlassCard>
            ) : filteredIntentions.length > 0 ? (
              filteredIntentions.map((intention, index) => (
                <motion.div
                  key={intention.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-4 h-full">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-glass-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white mb-3">{intention.content}</p>
                        <div className="flex items-center justify-between gap-4">
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => prayForIntention(intention.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-glass-white hover:bg-glass-secondary transition-colors"
                            >
                              <Heart className="w-4 h-4 text-prayer" />
                              <span className="text-sm text-white">
                                {intention.prayer_count || 0}
                              </span>
                            </button>
                            <button
                              onClick={() => shareIntention(intention)}
                              className="p-1 rounded-lg hover:bg-glass-white transition-colors"
                            >
                              <Share2 className="w-4 h-4 text-white/50" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <GlassCard className="p-6 col-span-full text-center">
                <p className="text-white/70">Brak intencji do wyświetlenia</p>
              </GlassCard>
            )}
          </div>
        </motion.div>

        {/* Add Intention Modal */}
        <GlassModal
          isOpen={showAddIntention}
          onClose={() => setShowAddIntention(false)}
          title="Dodaj intencję modlitewną"
          size="md"
        >
          <div className="space-y-6">
            <GlassTextarea
              label="Twoja intencja"
              placeholder="Za co chcesz się modlić?"
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              rows={4}
            />
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary"
              />
              <span className="text-white">
                Udostępnij publicznie (anonimowo)
              </span>
            </label>

            <div className="flex gap-4">
              <GlassButton
                onClick={submitIntention}
                disabled={!newIntention.trim()}
                className="flex-1"
              >
                Dodaj intencję
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => setShowAddIntention(false)}
                className="flex-1"
              >
                Anuluj
              </GlassButton>
            </div>
          </div>
        </GlassModal>

        {/* Share Modal */}
        <GlassModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Udostępnij intencję"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-white/70">
              Podziel się tą intencją ze znajomymi
            </p>
            <div className="flex gap-2">
              <GlassButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Pomódl się ze mną w intencji: "${selectedIntention?.content}" - https://oremus.app/prayer`
                  )
                  toast.success('Skopiowano do schowka')
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
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://oremus.app/prayer')}`,
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