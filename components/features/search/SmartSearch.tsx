'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  title: string
  type: 'prayer' | 'course' | 'video'
  thumbnail?: string
  category?: string
}

interface SmartSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>
  onResultSelect: (result: SearchResult) => void
  userType: 'free' | 'premium'
  aiRecommendations?: boolean
}

export default function SmartSearch({
  onSearch,
  onResultSelect,
  userType,
  aiRecommendations = false
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTimeout = useRef<NodeJS.Timeout>()
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Inicjalizacja Web Speech API
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'pl-PL'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        handleSearch(transcript)
      }

      recognition.onerror = () => {
        setIsListening(false)
        setError('Błąd rozpoznawania mowy')
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    // Załaduj historię wyszukiwania
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    // Limit historii wyszukiwania
    const historyLimit = userType === 'premium' ? 10 : 2
    if (history.length >= historyLimit) {
      setError('Osiągnięto limit historii wyszukiwania')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const searchResults = await onSearch(searchQuery)
      setResults(searchResults)

      // Dodaj do historii
      const newHistory = [searchQuery, ...history.filter(h => h !== searchQuery)].slice(0, historyLimit)
      setHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    } catch (err) {
      setError('Błąd wyszukiwania')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      setError('Twoja przeglądarka nie obsługuje wyszukiwania głosowego')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      setError(null)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('searchHistory')
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (searchTimeout.current) {
              clearTimeout(searchTimeout.current)
            }
            searchTimeout.current = setTimeout(() => {
              handleSearch(e.target.value)
            }, 300)
          }}
          placeholder="Wyszukaj modlitwy, kursy..."
          className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          onClick={toggleVoiceSearch}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
            isListening ? 'bg-red-100' : 'hover:bg-gray-100'
          }`}
        >
          <span className="material-icons">
            {isListening ? 'mic' : 'mic_none'}
          </span>
        </button>
      </div>

      {/* Wyniki wyszukiwania */}
      <AnimatePresence>
        {(results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            {loading ? (
              <div className="p-4 text-center">
                <span className="material-icons animate-spin">refresh</span>
              </div>
            ) : (
              <div className="divide-y">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => onResultSelect(result)}
                    className="w-full p-4 text-left hover:bg-gray-50 flex items-center space-x-4"
                  >
                    {result.thumbnail && (
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{result.title}</h3>
                      {result.category && (
                        <p className="text-sm text-gray-500">{result.category}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historia wyszukiwania */}
      {history.length > 0 && !query && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Historia wyszukiwania</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Wyczyść
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(item)
                  handleSearch(item)
                }}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Błąd */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
