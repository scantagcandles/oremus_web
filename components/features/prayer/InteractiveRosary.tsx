'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface RosaryBead {
  id: number
  type: 'our-father' | 'hail-mary' | 'glory-be'
  completed: boolean
}

interface RosaryMystery {
  id: number
  title: string
  description: string
  meditation: string
  image?: string
}

const mysteries = {
  joyful: [
    {
      id: 1,
      title: 'Zwiastowanie',
      description: 'Archanioł Gabriel zwiastuje Maryi, że zostanie Matką Bożą',
      meditation: 'Rozważamy pokorę Maryi i Jej bezwarunkowe "fiat"...'
    },
    // ... pozostałe tajemnice radosne
  ],
  sorrowful: [
    // ... tajemnice bolesne
  ],
  glorious: [
    // ... tajemnice chwalebne
  ],
  luminous: [
    // ... tajemnice światła
  ]
}

interface InteractiveRosaryProps {
  type?: keyof typeof mysteries
  onComplete?: () => void
  userType: 'free' | 'premium'
}

export default function InteractiveRosary({
  type = 'joyful',
  onComplete,
  userType
}: InteractiveRosaryProps) {
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0)
  const [beads, setBeads] = useState<RosaryBead[]>(generateBeads())
  const [currentBeadIndex, setCurrentBeadIndex] = useState(0)
  const [showMeditation, setShowMeditation] = useState(false)

  function generateBeads(): RosaryBead[] {
    const beads: RosaryBead[] = []
    // Krzyżyk
    beads.push({ id: 0, type: 'glory-be', completed: false })
    
    // Pierwsze trzy paciorki
    for (let i = 1; i <= 3; i++) {
      beads.push({ id: i, type: 'hail-mary', completed: false })
    }
    
    // Pięć dziesiątek
    for (let decade = 0; decade < 5; decade++) {
      // Ojcze Nasz
      beads.push({ id: beads.length, type: 'our-father', completed: false })
      
      // 10 Zdrowaś Mario
      for (let i = 0; i < 10; i++) {
        beads.push({ id: beads.length, type: 'hail-mary', completed: false })
      }
      
      // Chwała Ojcu
      beads.push({ id: beads.length, type: 'glory-be', completed: false })
    }
    
    return beads
  }

  const handleBeadClick = (beadIndex: number) => {
    if (beadIndex !== currentBeadIndex) return

    const newBeads = [...beads]
    newBeads[beadIndex].completed = true
    setBeads(newBeads)

    if (beadIndex === beads.length - 1) {
      onComplete?.()
    } else {
      setCurrentBeadIndex(beadIndex + 1)
    }
  }

  const getCurrentPrayer = () => {
    const currentBead = beads[currentBeadIndex]
    switch (currentBead.type) {
      case 'our-father':
        return 'Ojcze nasz...'
      case 'hail-mary':
        return 'Zdrowaś Mario...'
      case 'glory-be':
        return 'Chwała Ojcu...'
    }
  }

  const getMysteryProgress = () => {
    const mysteriesCompleted = Math.floor(currentBeadIndex / 11) // każda tajemnica ma 11 paciorków
    return `${mysteriesCompleted}/5 tajemnic`
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lewa kolumna - różaniec */}
        <div className="relative">
          <div className="flex flex-wrap justify-center gap-2">
            {beads.map((bead, index) => (
              <motion.button
                key={bead.id}
                onClick={() => handleBeadClick(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-8 h-8 rounded-full ${
                  bead.completed
                    ? 'bg-primary'
                    : index === currentBeadIndex
                    ? 'bg-primary/60 animate-pulse'
                    : 'bg-gray-300'
                } ${
                  bead.type === 'our-father' ? 'w-10 h-10' : ''
                }`}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold mb-4">
              {getCurrentPrayer()}
            </h3>
            <p className="text-gray-600">{getMysteryProgress()}</p>
          </div>
        </div>

        {/* Prawa kolumna - tajemnice */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            {mysteries[type][currentMysteryIndex].title}
          </h2>

          {mysteries[type][currentMysteryIndex].image && (
            <img
              src={mysteries[type][currentMysteryIndex].image}
              alt={mysteries[type][currentMysteryIndex].title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}

          <p className="text-gray-600 mb-4">
            {mysteries[type][currentMysteryIndex].description}
          </p>

          <button
            onClick={() => setShowMeditation(!showMeditation)}
            className="text-primary hover:underline"
          >
            {showMeditation ? 'Ukryj rozważanie' : 'Pokaż rozważanie'}
          </button>

          <AnimatePresence>
            {showMeditation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded"
              >
                <p className="text-sm">
                  {mysteries[type][currentMysteryIndex].meditation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timer dla wersji Free */}
      {userType === 'free' && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">
            Pozostało: 5:00 (wersja Free)
          </p>
          <button className="mt-2 text-primary hover:underline">
            Przejdź na Premium
          </button>
        </div>
      )}
    </div>
  )
}
