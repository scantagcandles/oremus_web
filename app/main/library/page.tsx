// web/app/(main)/library/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Library, Book, FileText, Download, Eye, Heart,
  Search, Filter, Clock, Star, BookOpen, Bookmark,
  Share2, ChevronRight, Lock, Sparkles, TrendingUp,
  Calendar, User, Tag, Globe, Sun, Moon
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

// Book categories
const categories = [
  { id: 'all', name: 'Wszystkie', icon: Library },
  { id: 'spirituality', name: 'Duchowość', icon: Sun },
  { id: 'theology', name: 'Teologia', icon: Book },
  { id: 'prayer', name: 'Modlitewniki', icon: BookOpen },
  { id: 'saints', name: 'Życiorysy świętych', icon: Star },
  { id: 'documents', name: 'Dokumenty Kościoła', icon: FileText },
  { id: 'history', name: 'Historia', icon: Clock }
]

// Books data
const books = [
  {
    id: '1',
    title: 'Dzienniczek św. Faustyny',
    author: 'św. Faustyna Kowalska',
    category: 'spirituality',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    pages: 700,
    language: 'Polski',
    year: 2023,
    publisher: 'Wydawnictwo WAM',
    rating: 4.9,
    downloads: 15234,
    description: 'Mistyczne doświadczenia apostołki Bożego Miłosierdzia.',
    isFree: true,
    isNew: false,
    isFeatured: true,
    format: ['PDF', 'EPUB', 'MOBI'],
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Katechizm Kościoła Katolickiego',
    author: 'Kościół Katolicki',
    category: 'documents',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    pages: 865,
    language: 'Polski',
    year: 2022,
    publisher: 'Pallottinum',
    rating: 5.0,
    downloads: 23456,
    description: 'Oficjalny wykład nauki Kościoła katolickiego.',
    isFree: true,
    isFeatured: true,
    format: ['PDF', 'EPUB'],
    size: '5.1 MB'
  },
  {
    id: '3',
    title: 'O naśladowaniu Chrystusa',
    author: 'Tomasz à Kempis',
    category: 'spirituality',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
    pages: 320,
    language: 'Polski',
    year: 2021,
    publisher: 'Wydawnictwo Esprit',
    rating: 4.8,
    downloads: 8932,
    description: 'Klasyczne dzieło literatury ascetycznej.',
    isFree: false,
    isPremium: true,
    price: 19.99,
    format: ['PDF', 'EPUB', 'MOBI'],
    size: '1.8 MB'
  },
  {
    id: '4',
    title: 'Życie Jezusa',
    author: 'ks. Jan Twardowski',
    category: 'theology',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    pages: 245,
    language: 'Polski',
    year: 2023,
    publisher: 'Wydawnictwo Apostolicum',
    rating: 4.7,
    downloads: 5621,
    description: 'Poetyckie rozważania o życiu Chrystusa.',
    isFree: true,
    isNew: true,
    format: ['PDF'],
    size: '1.2 MB'
  },
  {
    id: '5',
    title: 'Modlitewnik Oremus',
    author: 'Wspólnota OREMUS',
    category: 'prayer',
    cover: 'https://images.unsplash.com/photo-1519074180254-66f74d1f263f',
    pages: 450,
    language: 'Polski',
    year: 2024,
    publisher: 'OREMUS',
    rating: 5.0,
    downloads: 34567,
    description: 'Kompletny zbiór modlitw na każdą okazję.',
    isFree: true,
    isNew: true,
    isFeatured: true,
    format: ['PDF', 'EPUB'],
    size: '3.2 MB'
  },
  {
    id: '6',
    title: 'Święty Jan Paweł II - Biografia',
    author: 'George Weigel',
    category: 'saints',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    pages: 1024,
    language: 'Polski',
    year: 2020,
    publisher: 'Znak',
    rating: 4.9,
    downloads: 12890,
    description: 'Definitywna biografia papieża Polaka.',
    isFree: false,
    isPremium: true,
    price: 39.99,
    format: ['PDF', 'EPUB'],
    size: '8.5 MB'
  }
]

// Reading lists
const readingLists = [
  {
    id: '1',
    name: 'Wielki Post 2024',
    books: 12,
    icon: '✝️'
  },
  {
    id: '2',
    name: 'Klasyka duchowości',
    books: 25,
    icon: '📿'
  },
  {
    id: '3',
    name: 'Dla początkujących',
    books: 10,
    icon: '🌱'
  }
]

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<typeof books[0] | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [downloadedBooks, setDownloadedBooks] = useState<string[]>(['1', '5'])
  const [readingMode, setReadingMode] = useState<'light' | 'dark'>('light')
  const [isPremium, setIsPremium] = useState(false)

  // Filter books
  const filteredBooks = books
    .filter(book => {
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false
      }
      if (searchQuery && !book.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !book.author.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.year - a.year
        case 'rating':
          return b.rating - a.rating
        case 'popular':
        default:
          return b.downloads - a.downloads
      }
    })

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  const downloadBook = (book: typeof books[0]) => {
    if (book.isPremium && !isPremium) {
      toast.error('Ta książka wymaga konta Premium')
      return
    }
    
    setDownloadedBooks(prev => [...prev, book.id])
    toast.success(`Pobrano: ${book.title}`)
  }

  const openBook = (book: typeof books[0]) => {
    setSelectedBook(book)
    setShowBookModal(true)
  }

  const readBook = (book: typeof books[0]) => {
    if (book.isPremium && !isPremium) {
      toast.error('Ta książka wymaga konta Premium')
      return
    }
    
    toast.success(`Otwieranie: ${book.title}`)
    // Here you would open the book reader
  }

  // User stats
  const userStats = {
    booksRead: 12,
    currentlyReading: 3,
    favorites: favorites.length,
    readingStreak: 7
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
            Biblioteka Cyfrowa
          </h1>
          <p className="text-lg text-white/70">
            Tysiące książek religijnych w jednym miejscu
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
            <Book className="w-8 h-8 text-library mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.booksRead}</div>
            <p className="text-sm text-white/70">Przeczytane</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.currentlyReading}</div>
            <p className="text-sm text-white/70">W trakcie</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Heart className="w-8 h-8 text-error mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.favorites}</div>
            <p className="text-sm text-white/70">Ulubione</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-academy mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.readingStreak}</div>
            <p className="text-sm text-white/70">Dni z rzędu</p>
          </GlassCard>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                placeholder="Szukaj książek, autorów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <GlassSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'popular', label: 'Najpopularniejsze' },
                { value: 'newest', label: 'Najnowsze' },
                { value: 'rating', label: 'Najlepiej oceniane' }
              ]}
            />
            <GlassButton
              variant="secondary"
              onClick={() => setReadingMode(readingMode === 'light' ? 'dark' : 'light')}
              className="gap-2"
            >
              {readingMode === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              {readingMode === 'light' ? 'Tryb nocny' : 'Tryb dzienny'}
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

        {/* Reading Lists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Listy lektur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {readingLists.map((list) => (
              <GlassCard key={list.id} className="p-4 group cursor-pointer" hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{list.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{list.name}</h3>
                      <p className="text-white/50 text-sm">{list.books} książek</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50" />
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Books Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedCategory === 'all' ? 'Wszystkie książki' : 
             categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book, index) => {
              const isFavorite = favorites.includes(book.id)
              const isDownloaded = downloadedBooks.includes(book.id)
              
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GlassCard className="h-full group" hover>
                    <div className="flex gap-4 p-6">
                      {/* Book Cover */}
                      <div className="relative w-32 flex-shrink-0">
                        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                          <Image
                            src={book.cover}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                          {book.isPremium && !isPremium && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-secondary" />
                            </div>
                          )}
                        </div>
                        {/* Badges */}
                        <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                          {book.isNew && (
                            <span className="px-2 py-0.5 bg-secondary text-primary text-xs font-bold rounded-full">
                              NOWE
                            </span>
                          )}
                          {book.isFeatured && (
                            <span className="px-2 py-0.5 bg-library text-white text-xs font-bold rounded-full">
                              POLECANE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-2">{book.author}</p>
                        
                        <p className="text-white/60 text-sm mb-3 line-clamp-2 flex-1">
                          {book.description}
                        </p>

                        {/* Meta info */}
                        <div className="space-y-1 text-xs text-white/50 mb-3">
                          <div className="flex items-center gap-3">
                            <span>{book.pages} stron</span>
                            <span>•</span>
                            <span>{book.year}</span>
                            <span>•</span>
                            <span>{book.language}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>{book.publisher}</span>
                            <span>•</span>
                            <span>{book.size}</span>
                          </div>
                        </div>

                        {/* Rating and stats */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(book.rating)
                                      ? 'text-secondary fill-secondary'
                                      : 'text-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white/70 text-xs">{book.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/50">
                            <Download className="w-3 h-3" />
                            <span>{book.downloads.toLocaleString('pl-PL')}</span>
                          </div>
                        </div>

                        {/* Formats */}
                        <div className="flex gap-1 mb-3">
                          {book.format.map((fmt) => (
                            <span
                              key={fmt}
                              className="px-2 py-0.5 bg-glass-white rounded text-xs text-white/70"
                            >
                              {fmt}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {isDownloaded ? (
                            <GlassButton
                              size="sm"
                              className="flex-1"
                              onClick={() => readBook(book)}
                            >
                              <Eye className="w-4 h-4" />
                              Czytaj
                            </GlassButton>
                          ) : (
                            <GlassButton
                              size="sm"
                              className="flex-1"
                              onClick={() => openBook(book)}
                              variant={book.isPremium && !isPremium ? "secondary" : "primary"}
                            >
                              {book.isFree ? 'Pobierz' : book.isPremium ? (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  {book.price} zł
                                </>
                              ) : 'Szczegóły'}
                            </GlassButton>
                          )}
                          <button
                            onClick={() => toggleFavorite(book.id)}
                            className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFavorite ? 'text-error fill-error' : 'text-white/50'
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `Polecam książkę "${book.title}" - https://oremus.app/library/${book.id}`
                              )
                              toast.success('Link skopiowany!')
                            }}
                            className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-white/50" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Book Details Modal */}
        <GlassModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          title={selectedBook?.title}
          size="lg"
        >
          {selectedBook && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover and actions */}
                <div>
                  <div className="relative w-full max-w-sm mx-auto">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                      <Image
                        src={selectedBook.cover}
                        alt={selectedBook.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    {downloadedBooks.includes(selectedBook.id) ? (
                      <GlassButton
                        className="w-full gap-2"
                        onClick={() => {
                          readBook(selectedBook)
                          setShowBookModal(false)
                        }}
                      >
                        <Eye className="w-5 h-5" />
                        Czytaj teraz
                      </GlassButton>
                    ) : (
                      <>
                        {selectedBook.isFree ? (
                          <GlassButton
                            className="w-full gap-2"
                            onClick={() => {
                              downloadBook(selectedBook)
                            }}
                          >
                            <Download className="w-5 h-5" />
                            Pobierz za darmo
                          </GlassButton>
                        ) : selectedBook.isPremium ? (
                          <GlassButton
                            className="w-full gap-2"
                            onClick={() => {
                              if (isPremium) {
                                downloadBook(selectedBook)
                              } else {
                                toast.error('Ta książka wymaga konta Premium')
                              }
                            }}
                          >
                            <Sparkles className="w-5 h-5" />
                            {isPremium ? 'Pobierz' : `Kup za ${selectedBook.price} zł`}
                          </GlassButton>
                        ) : null}
                      </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleFavorite(selectedBook.id)}
                        className="gap-2"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(selectedBook.id)
                              ? 'text-error fill-error'
                              : ''
                          }`}
                        />
                        {favorites.includes(selectedBook.id) ? 'W ulubionych' : 'Dodaj do ulubionych'}
                      </GlassButton>
                      <GlassButton variant="secondary" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Udostępnij
                      </GlassButton>
                    </div>
                  </div>
                </div>

                {/* Book details */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedBook.title}</h2>
                  <p className="text-lg text-white/70 mb-4">{selectedBook.author}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedBook.rating)
                              ? 'text-secondary fill-secondary'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                      <span className="text-white ml-1">{selectedBook.rating}</span>
                    </div>
                    <span className="text-white/50">
                      {selectedBook.downloads.toLocaleString('pl-PL')} pobrań
                    </span>
                  </div>

                  <p className="text-white/70 mb-6">{selectedBook.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Szczegóły książki</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-white/50">Wydawca:</span>
                          <p className="text-white">{selectedBook.publisher}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Rok wydania:</span>
                          <p className="text-white">{selectedBook.year}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Liczba stron:</span>
                          <p className="text-white">{selectedBook.pages}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Język:</span>
                          <p className="text-white">{selectedBook.language}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Rozmiar:</span>
                          <p className="text-white">{selectedBook.size}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Kategoria:</span>
                          <p className="text-white">
                            {categories.find(c => c.id === selectedBook.category)?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Dostępne formaty</h3>
                      <div className="flex gap-2">
                        {selectedBook.format.map((fmt) => (
                          <span
                            key={fmt}
                            className="px-3 py-1 bg-glass-white rounded-lg text-white"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-glass-white rounded-xl p-4">
                      <h3 className="text-white font-bold mb-2">O autorze</h3>
                      <p className="text-white/70 text-sm">
                        {selectedBook.author} to uznany autor literatury religijnej,
                        którego dzieła inspirują miliony czytelników na całym świecie.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassModal>
      </div>
    </div>
  )
}