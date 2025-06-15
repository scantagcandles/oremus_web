'use client'

import { useState } from 'react'

interface Prayer {
  id: string
  title: string
  category: string
  duration: number
  tags: string[]
}

interface PrayerMapProps {
  prayers: Prayer[]
  onPrayerSelect: (prayer: Prayer) => void
}

export default function PrayerMap({ prayers, onPrayerSelect }: PrayerMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [...new Set(prayers.map(p => p.category))]
  
  const filteredPrayers = prayers.filter(prayer => {
    const matchesCategory = !selectedCategory || prayer.category === selectedCategory
    const matchesSearch = !searchQuery || 
      prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Szukaj modlitwy..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Wszystkie kategorie</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Prayer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPrayers.map(prayer => (
          <button
            key={prayer.id}
            onClick={() => onPrayerSelect(prayer)}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="font-semibold mb-2">{prayer.title}</h3>
            <div className="text-sm text-gray-600">
              <p>Kategoria: {prayer.category}</p>
              <p>Czas trwania: {Math.round(prayer.duration / 60)}min</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {prayer.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {filteredPrayers.length === 0 && (
        <p className="text-center text-gray-600">
          Nie znaleziono modlitw spełniających kryteria wyszukiwania
        </p>
      )}
    </div>
  )
}
