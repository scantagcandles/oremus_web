// web/app/(main)/academy/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, BookOpen, Users, Clock, Star, Award,
  Play, Lock, CheckCircle, Calendar, TrendingUp, 
  ChevronRight, Filter, Search, Download, Share2,
  Certificate, Target, BarChart3, Sparkles
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

// Course categories
const categories = [
  { id: 'all', name: 'Wszystkie kursy' },
  { id: 'spirituality', name: 'Duchowość' },
  { id: 'theology', name: 'Teologia' },
  { id: 'bible', name: 'Biblia' },
  { id: 'prayer', name: 'Modlitwa' },
  { id: 'liturgy', name: 'Liturgia' },
  { id: 'history', name: 'Historia Kościoła' }
]

// Courses data
const courses = [
  {
    id: '1',
    title: 'Wprowadzenie do modlitwy kontemplacyjnej',
    instructor: 'o. Jan Góra OP',
    category: 'prayer',
    level: 'Początkujący',
    duration: '6 tygodni',
    lessons: 24,
    students: 1234,
    rating: 4.8,
    price: 0,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    description: 'Naucz się podstaw modlitwy kontemplacyjnej i pogłęb swoją relację z Bogiem.',
    isNew: true,
    isFeatured: true,
    progress: 0
  },
  {
    id: '2',
    title: 'Lectio Divina - czytanie Pisma Świętego',
    instructor: 'ks. prof. Waldemar Chrostowski',
    category: 'bible',
    level: 'Średniozaawansowany',
    duration: '8 tygodni',
    lessons: 32,
    students: 876,
    rating: 4.9,
    price: 149,
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65',
    description: 'Odkryj starożytną metodę medytacyjnego czytania Biblii.',
    isPremium: true,
    progress: 0
  },
  {
    id: '3',
    title: 'Podstawy teologii dogmatycznej',
    instructor: 'ks. dr hab. Grzegorz Strzelczyk',
    category: 'theology',
    level: 'Zaawansowany',
    duration: '12 tygodni',
    lessons: 48,
    students: 432,
    rating: 4.7,
    price: 299,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    description: 'Systematyczny kurs z podstaw teologii katolickiej.',
    isPremium: true,
    progress: 0
  },
  {
    id: '4',
    title: 'Duchowość ignacjańska',
    instructor: 'o. Józef Augustyn SJ',
    category: 'spirituality',
    level: 'Początkujący',
    duration: '4 tygodnie',
    lessons: 16,
    students: 2156,
    rating: 5.0,
    price: 0,
    image: 'https://images.unsplash.com/photo-1559882864-b92a50ab5e88',
    description: 'Poznaj duchowość św. Ignacego Loyoli i ćwiczenia duchowe.',
    isFeatured: true,
    progress: 45
  },
  {
    id: '5',
    title: 'Liturgia Godzin - modlitwa Kościoła',
    instructor: 's. Maria Benedykta OSB',
    category: 'liturgy',
    level: 'Początkujący',
    duration: '3 tygodnie',
    lessons: 12,
    students: 654,
    rating: 4.6,
    price: 0,
    image: 'https://images.unsplash.com/photo-1565193566173-7a1e2bb65816',
    description: 'Naucz się odmawiać brewiarz i poznaj rytm modlitwy Kościoła.',
    progress: 100,
    isCompleted: true
  },
  {
    id: '6',
    title: 'Historia Kościoła w Polsce',
    instructor: 'prof. dr hab. Jan Walkusz',
    category: 'history',
    level: 'Średniozaawansowany',
    duration: '10 tygodni',
    lessons: 40,
    students: 321,
    rating: 4.8,
    price: 199,
    image: 'https://images.unsplash.com/photo-1569163139394-de4b5a4e8e8a',
    description: 'Poznaj dzieje Kościoła katolickiego w Polsce od początków do dziś.',
    isPremium: true,
    isNew: true,
    progress: 0
  }
]

// Learning paths
const learningPaths = [
  {
    id: '1',
    title: 'Droga katechumena',
    description: 'Przygotowanie do sakramentów inicjacji',
    courses: 8,
    duration: '6 miesięcy',
    icon: '✝️'
  },
  {
    id: '2',
    title: 'Formacja liturgiczna',
    description: 'Dla ministrantów i szafarzy',
    courses: 5,
    duration: '3 miesiące',
    icon: '🕊️'
  },
  {
    id: '3',
    title: 'Biblijna podróż',
    description: 'Od Księgi Rodzaju do Apokalipsy',
    courses: 12,
    duration: '1 rok',
    icon: '📖'
  }
]

export default function AcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(['4', '5'])
  
  // Filter courses
  const filteredCourses = courses
    .filter(course => {
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false
      }
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.instructor.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.isNew ? 1 : -1
        case 'rating':
          return b.rating - a.rating
        case 'popularity':
        default:
          return b.students - a.students
      }
    })

  const enrollInCourse = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId])
    toast.success('Zapisano na kurs!')
    setShowCourseModal(false)
  }

  const openCourse = (course: typeof courses[0]) => {
    setSelectedCourse(course)
    setShowCourseModal(true)
  }

  // Stats
  const userStats = {
    coursesCompleted: 1,
    coursesInProgress: 2,
    totalHours: 24,
    certificates: 1
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
            Akademia Formacyjna
          </h1>
          <p className="text-lg text-white/70">
            Kursy duchowe, teologiczne i biblijne online
          </p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <GlassCard className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-academy mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.coursesCompleted}</div>
            <p className="text-sm text-white/70">Ukończone kursy</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.coursesInProgress}</div>
            <p className="text-sm text-white/70">W trakcie</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Clock className="w-8 h-8 text-player mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.totalHours}h</div>
            <p className="text-sm text-white/70">Czas nauki</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.certificates}</div>
            <p className="text-sm text-white/70">Certyfikaty</p>
          </GlassCard>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <GlassInput
                placeholder="Szukaj kursów, instruktorów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <GlassSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            />
            <GlassSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'popularity', label: 'Najpopularniejsze' },
                { value: 'newest', label: 'Najnowsze' },
                { value: 'rating', label: 'Najlepiej oceniane' }
              ]}
            />
          </div>
        </motion.div>

        {/* Learning Paths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ścieżki nauki</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningPaths.map((path) => (
              <GlassCard key={path.id} className="p-6 group cursor-pointer" hover>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{path.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{path.title}</h3>
                    <p className="text-sm text-white/70 mb-2">{path.description}</p>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span>{path.courses} kursów</span>
                      <span>•</span>
                      <span>{path.duration}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedCategory === 'all' ? 'Wszystkie kursy' : 
             categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const isEnrolled = enrolledCourses.includes(course.id)
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GlassCard className="h-full group" hover>
                    <div className="relative">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-2xl">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {course.isNew && (
                            <span className="px-3 py-1 bg-secondary text-primary text-xs font-bold rounded-full">
                              NOWOŚĆ
                            </span>
                          )}
                          {course.isFeatured && (
                            <span className="px-3 py-1 bg-academy text-white text-xs font-bold rounded-full">
                              POLECANE
                            </span>
                          )}
                          {course.isPremium && (
                            <span className="px-3 py-1 bg-warning text-primary text-xs font-bold rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              PREMIUM
                            </span>
                          )}
                        </div>

                        {/* Price or status */}
                        <div className="absolute bottom-4 right-4">
                          {isEnrolled ? (
                            course.isCompleted ? (
                              <div className="flex items-center gap-1 px-3 py-1 bg-academy rounded-full">
                                <CheckCircle className="w-4 h-4 text-white" />
                                <span className="text-white text-sm font-medium">Ukończony</span>
                              </div>
                            ) : (
                              <div className="px-3 py-1 bg-glass-black rounded-full">
                                <span className="text-white text-sm font-medium">
                                  {course.progress}% ukończone
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="px-3 py-1 bg-glass-black rounded-full">
                              <span className="text-white text-lg font-bold">
                                {course.price === 0 ? 'Darmowy' : `${course.price} zł`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-2">
                          <span className="text-xs text-white/50">{course.level}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-white/70 text-sm mb-3">
                          {course.instructor}
                        </p>

                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.lessons} lekcji</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.students}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(course.rating)
                                    ? 'text-secondary fill-secondary'
                                    : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-white/70 text-sm">{course.rating}</span>
                        </div>

                        {/* Progress bar for enrolled courses */}
                        {isEnrolled && !course.isCompleted && (
                          <div className="mb-4">
                            <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-academy"
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action button */}
                        <GlassButton
                          className="w-full"
                          onClick={() => openCourse(course)}
                          variant={isEnrolled ? "secondary" : "primary"}
                        >
                          {isEnrolled ? (
                            course.isCompleted ? 'Zobacz certyfikat' : 'Kontynuuj naukę'
                          ) : (
                            course.isPremium && course.price > 0 ? 'Szczegóły kursu' : 'Rozpocznij kurs'
                          )}
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Course Details Modal */}
        <GlassModal
          isOpen={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          title={selectedCourse?.title}
          size="lg"
        >
          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <Image
                    src={selectedCourse.image}
                    alt={selectedCourse.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm px-3 py-1 bg-glass-white rounded-full text-white/70">
                      {selectedCourse.level}
                    </span>
                    <span className="text-sm px-3 py-1 bg-glass-white rounded-full text-white/70">
                      {categories.find(c => c.id === selectedCourse.category)?.name}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{selectedCourse.instructor}</h3>
                  <p className="text-white/70 mb-4">{selectedCourse.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>Czas trwania: {selectedCourse.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <BookOpen className="w-4 h-4" />
                      <span>Liczba lekcji: {selectedCourse.lessons}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Users className="w-4 h-4" />
                      <span>Uczestników: {selectedCourse.students}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Star className="w-4 h-4" />
                      <span>Ocena: {selectedCourse.rating}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What you'll learn */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Czego się nauczysz:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Podstawy teoretyczne zagadnienia',
                    'Praktyczne zastosowanie w życiu',
                    'Pogłębienie życia duchowego',
                    'Narzędzia do dalszego rozwoju'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-academy flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum preview */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Program kursu:</h4>
                <div className="space-y-2">
                  {['Wprowadzenie', 'Podstawy teoretyczne', 'Ćwiczenia praktyczne', 'Podsumowanie'].map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-glass-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-glass-secondary rounded-full flex items-center justify-center">
                          <span className="text-secondary text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-white">Moduł {index + 1}: {module}</span>
                      </div>
                      <span className="text-white/50 text-sm">{Math.floor(selectedCourse.lessons / 4)} lekcji</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor info */}
              <div className="bg-glass-white rounded-xl p-4">
                <h4 className="text-lg font-bold text-white mb-2">O instruktorze</h4>
                <p className="text-white/70 text-sm">
                  {selectedCourse.instructor} to uznany ekspert w swojej dziedzinie z wieloletnim doświadczeniem
                  w nauczaniu i formacji duchowej. Autor wielu publikacji i konferencji.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {enrolledCourses.includes(selectedCourse.id) ? (
                  <GlassButton className="flex-1">
                    {selectedCourse.isCompleted ? 'Pobierz certyfikat' : 'Kontynuuj kurs'}
                  </GlassButton>
                ) : (
                  <>
                    {selectedCourse.price > 0 ? (
                      <GlassButton 
                        className="flex-1"
                        onClick={() => enrollInCourse(selectedCourse.id)}
                      >
                        Kup kurs za {selectedCourse.price} zł
                      </GlassButton>
                    ) : (
                      <GlassButton 
                        className="flex-1"
                        onClick={() => enrollInCourse(selectedCourse.id)}
                      >
                        Zapisz się na kurs
                      </GlassButton>
                    )}
                  </>
                )}
                <GlassButton variant="secondary" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Udostępnij
                </GlassButton>
              </div>
            </div>
          )}
        </GlassModal>
      </div>
    </div>
  )
}