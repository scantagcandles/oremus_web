// web/app/(main)/spirituality/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, BookOpen, Sparkles, Sun, Moon, Cloud,
  Calendar, Clock, ChevronRight, Play, Pause,
  Volume2, Download, Share2, Bookmark, Coffee,
  Feather, Mountain, Waves, TreePine, Star
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

// Daily content types
const contentTypes = [
  { id: 'reflection', name: 'Rozważanie', icon: Sun },
  { id: 'meditation', name: 'Medytacja', icon: Cloud },
  { id: 'examination', name: 'Rachunek sumienia', icon: Moon },
  { id: 'saint', name: 'Święty dnia', icon: Star },
  { id: 'wisdom', name: 'Myśl dnia', icon: Feather }
]

// Today's content
const todayContent = {
  date: new Date(),
  liturgicalDay: 'Środa 2. tygodnia zwykłego',
  saintOfDay: {
    name: 'św. Antoni Opat',
    dates: '251-356',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    quote: 'Życie bez prób czyni człowieka nieużytecznym.',
    biography: 'Pustelnik egipski, ojciec życia monastycznego. Sprzedał cały majątek i rozdał ubogim, by całkowicie poświęcić się Bogu.'
  },
  gospel: {
    reference: 'Mk 3, 1-6',
    title: 'Uzdrowienie w szabat',
    text: 'Jezus wszedł ponownie do synagogi. Był tam człowiek, który miał uschłą rękę...',
    reflection: 'Jezus pokazuje nam, że miłość i miłosierdzie są ważniejsze niż literalne przestrzeganie prawa.'
  },
  meditation: {
    title: 'Cisza serca',
    duration: '15 min',
    author: 'o. Jan Góra OP',
    audioUrl: '#'
  },
  thoughtOfDay: {
    text: 'Bóg nie patrzy na to, ile dajesz, ale z jakim sercem dajesz.',
    author: 'św. Matka Teresa z Kalkuty'
  }
}

// Spiritual exercises
const exercises = [
  {
    id: '1',
    title: 'Lectio Divina',
    description: 'Medytacyjne czytanie Pisma Świętego',
    duration: '20 min',
    level: 'Początkujący',
    icon: BookOpen,
    steps: 4,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: '2',
    title: 'Egzamin Ignacjański',
    description: 'Codzienny rachunek sumienia',
    duration: '10 min',
    level: 'Początkujący',
    icon: Moon,
    steps: 5,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '3',
    title: 'Modlitwa Jezusowa',
    description: 'Nieustanna modlitwa serca',
    duration: '15 min',
    level: 'Średniozaawansowany',
    icon: Heart,
    steps: 3,
    color: 'from-pink-500 to-red-500'
  },
  {
    id: '4',
    title: 'Kontemplacja',
    description: 'Milczące trwanie w obecności Boga',
    duration: '30 min',
    level: 'Zaawansowany',
    icon: Mountain,
    steps: 6,
    color: 'from-green-500 to-teal-500'
  }
]

// Retreat programs
const retreats = [
  {
    id: '1',
    title: 'Rekolekcje Ignacjańskie Online',
    description: '5-dniowe rekolekcje w życiu codziennym',
    startDate: new Date(Date.now() + 3600000 * 24 * 7),
    duration: '5 dni',
    guide: 'o. Józef Augustyn SJ',
    participants: 234,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
  },
  {
    id: '2',
    title: 'Weekend Ciszy',
    description: 'Odnowa duchowa w ciszy i modlitwie',
    startDate: new Date(Date.now() + 3600000 * 24 * 14),
    duration: '3 dni',
    guide: 's. Maria Benedykta OSB',
    participants: 45,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
  }
]

// Spiritual journal prompts
const journalPrompts = [
  'Za co jestem dziś wdzięczny Bogu?',
  'W jakich momentach dziś doświadczyłem Bożej obecności?',
  'Co było dla mnie największym wyzwaniem duchowym?',
  'Jak mogę jutro lepiej służyć Bogu i bliźnim?'
]

export default function SpiritualityPage() {
  const [selectedContent, setSelectedContent] = useState('reflection')
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<typeof exercises[0] | null>(null)
  const [showRetreatModal, setShowRetreatModal] = useState(false)
  const [selectedRetreat, setSelectedRetreat] = useState<typeof retreats[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [savedContent, setSavedContent] = useState<string[]>([])
  const [journalEntry, setJournalEntry] = useState('')

  const toggleSaved = (contentId: string) => {
    setSavedContent(prev =>
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    )
    toast.success(
      savedContent.includes(contentId) ? 'Usunięto z zapisanych' : 'Zapisano'
    )
  }

  const startExercise = (exercise: typeof exercises[0]) => {
    setSelectedExercise(exercise)
    setShowExerciseModal(true)
  }

  const joinRetreat = (retreat: typeof retreats[0]) => {
    setSelectedRetreat(retreat)
    setShowRetreatModal(true)
  }

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
            Duchowość
          </h1>
          <p className="text-lg text-white/70">
            Codzienna dawka inspiracji i narzędzia do rozwoju duchowego
          </p>
        </motion.div>

        {/* Today's Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-1">
            {format(todayContent.date, 'EEEE, d MMMM yyyy', { locale: pl })}
          </h2>
          <p className="text-secondary">{todayContent.liturgicalDay}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Content Type Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {contentTypes.map((type) => {
                const Icon = type.icon
                const isActive = selectedContent === type.id
                
                return (
                  <GlassButton
                    key={type.id}
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedContent(type.id)}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4" />
                    {type.name}
                  </GlassButton>
                )
              })}
            </div>

            {/* Daily Content */}
            <GlassCard className="p-6">
              {selectedContent === 'reflection' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Rozważanie Ewangelii
                  </h3>
                  <div className="mb-4">
                    <p className="text-secondary font-medium">{todayContent.gospel.reference}</p>
                    <p className="text-white/70">{todayContent.gospel.title}</p>
                  </div>
                  <div className="bg-glass-white rounded-xl p-4 mb-4">
                    <p className="text-white/80 italic">{todayContent.gospel.text}</p>
                  </div>
                  <p className="text-white/70 mb-4">{todayContent.gospel.reflection}</p>
                  <div className="flex gap-2">
                    <GlassButton
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleSaved('gospel')}
                      className="gap-2"
                    >
                      <Bookmark className={`w-4 h-4 ${
                        savedContent.includes('gospel') ? 'fill-current' : ''
                      }`} />
                      Zapisz
                    </GlassButton>
                    <GlassButton size="sm" variant="secondary" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Udostępnij
                    </GlassButton>
                  </div>
                </div>
              )}

              {selectedContent === 'meditation' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Medytacja dnia
                  </h3>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 mb-4">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {todayContent.meditation.title}
                    </h4>
                    <p className="text-white/70 mb-4">
                      Prowadzi: {todayContent.meditation.author}
                    </p>
                    <div className="flex items-center gap-4">
                      <GlassButton
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="gap-2"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                        {isPlaying ? 'Pauza' : 'Odtwórz'}
                      </GlassButton>
                      <span className="text-white/50">
                        {todayContent.meditation.duration}
                      </span>
                      <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                        <Volume2 className="w-5 h-5 text-white/50" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                        <Download className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'saint' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Święty dnia
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-48 h-64 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={todayContent.saintOfDay.image}
                        alt={todayContent.saintOfDay.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">
                        {todayContent.saintOfDay.name}
                      </h4>
                      <p className="text-secondary mb-3">{todayContent.saintOfDay.dates}</p>
                      <blockquote className="text-white/80 italic mb-4 pl-4 border-l-2 border-secondary">
                        "{todayContent.saintOfDay.quote}"
                      </blockquote>
                      <p className="text-white/70 mb-4">
                        {todayContent.saintOfDay.biography}
                      </p>
                      <GlassButton size="sm" variant="secondary">
                        Czytaj więcej
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'wisdom' && (
                <div className="text-center py-8">
                  <Feather className="w-16 h-16 text-secondary mx-auto mb-6" />
                  <blockquote className="text-2xl text-white mb-4">
                    "{todayContent.thoughtOfDay.text}"
                  </blockquote>
                  <p className="text-secondary">— {todayContent.thoughtOfDay.author}</p>
                </div>
              )}
            </GlassCard>

            {/* Spiritual Exercises */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Ćwiczenia duchowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((exercise) => {
                  const Icon = exercise.icon
                  
                  return (
                    <motion.div
                      key={exercise.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <GlassCard 
                        className="p-6 cursor-pointer group"
                        onClick={() => startExercise(exercise)}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exercise.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1">
                          {exercise.title}
                        </h4>
                        <p className="text-white/70 text-sm mb-3">
                          {exercise.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 text-white/50">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{exercise.duration}</span>
                            </div>
                            <span>•</span>
                            <span>{exercise.level}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Daily Progress */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Twój dzień duchowy
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Modlitwa poranna</span>
                    <span className="text-secondary">✓</span>
                  </div>
                  <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Lektura duchowa</span>
                    <span className="text-white/50">0/15 min</span>
                  </div>
                  <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-0" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Rachunek sumienia</span>
                    <span className="text-white/50">Później</span>
                  </div>
                  <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-0" />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Retreats */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Nadchodzące rekolekcje
              </h3>
              <div className="space-y-3">
                {retreats.map((retreat) => (
                  <div
                    key={retreat.id}
                    className="group cursor-pointer"
                    onClick={() => joinRetreat(retreat)}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={retreat.image}
                          alt={retreat.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate">
                          {retreat.title}
                        </h4>
                        <p className="text-white/50 text-xs">
                          {format(retreat.startDate, 'd MMM', { locale: pl })} • {retreat.duration}
                        </p>
                        <p className="text-white/50 text-xs">
                          {retreat.participants} uczestników
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Spiritual Journal */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Dziennik duchowy
              </h3>
              <div className="bg-glass-white rounded-lg p-3 mb-3">
                <p className="text-white/70 text-sm italic">
                  "{journalPrompts[Math.floor(Math.random() * journalPrompts.length)]}"
                </p>
              </div>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Zapisz swoje refleksje..."
                className="w-full h-24 px-3 py-2 bg-glass-white rounded-lg text-white placeholder:text-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
              <GlassButton size="sm" className="w-full mt-3">
                Zapisz wpis
              </GlassButton>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Szybkie akcje
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <GlassButton size="sm" variant="secondary" className="gap-2">
                  <Coffee className="w-4 h-4" />
                  Kawa z Bogiem
                </GlassButton>
                <GlassButton size="sm" variant="secondary" className="gap-2">
                  <TreePine className="w-4 h-4" />
                  Las duchowy
                </GlassButton>
                <GlassButton size="sm" variant="secondary" className="gap-2">
                  <Waves className="w-4 h-4" />
                  Pokój duszy
                </GlassButton>
                <GlassButton size="sm" variant="secondary" className="gap-2">
                  <Mountain className="w-4 h-4" />
                  Góra Tabor
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Exercise Modal */}
        <GlassModal
          isOpen={showExerciseModal}
          onClose={() => setShowExerciseModal(false)}
          title={selectedExercise?.title}
          size="md"
        >
          {selectedExercise && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedExercise.color} flex items-center justify-center mx-auto mb-4`}>
                  <selectedExercise.icon className="w-10 h-10 text-white" />
                </div>
                <p className="text-white/70">{selectedExercise.description}</p>
              </div>

              <div className="bg-glass-white rounded-xl p-4">
                <h4 className="text-white font-bold mb-3">Przebieg ćwiczenia:</h4>
                <div className="space-y-2">
                  {Array.from({ length: selectedExercise.steps }, (_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Krok {i + 1}: Opis kroku ćwiczenia duchowego
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-white/50 text-sm">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {selectedExercise.duration}
                </div>
                <div className="text-white/50 text-sm">
                  Poziom: {selectedExercise.level}
                </div>
              </div>

              <GlassButton className="w-full">
                Rozpocznij ćwiczenie
              </GlassButton>
            </div>
          )}
        </GlassModal>

        {/* Retreat Modal */}
        <GlassModal
          isOpen={showRetreatModal}
          onClose={() => setShowRetreatModal(false)}
          title={selectedRetreat?.title}
          size="md"
        >
          {selectedRetreat && (
            <div className="space-y-6">
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src={selectedRetreat.image}
                  alt={selectedRetreat.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div>
                <p className="text-white/70 mb-4">{selectedRetreat.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {format(selectedRetreat.startDate, 'd MMMM yyyy', { locale: pl })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>Czas trwania: {selectedRetreat.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Heart className="w-4 h-4" />
                    <span>Prowadzi: {selectedRetreat.guide}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Sparkles className="w-4 h-4" />
                    <span>{selectedRetreat.participants} uczestników</span>
                  </div>
                </div>
              </div>

              <GlassButton className="w-full">
                Zapisz się na rekolekcje
              </GlassButton>
            </div>
          )}
        </GlassModal>
      </div>
    </div>
  )
}