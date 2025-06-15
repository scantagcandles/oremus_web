'use client'

import { useState, useEffect } from 'react'
import { Map, Marker } from 'react-map-gl'
import { useQuery } from '@tanstack/react-query'
import { searchChurches } from '@/services/churchService'
import { Church } from '@/types/mass'
import { GlassInput } from '../glass/GlassInput'
import { GlassButton } from '../glass/GlassButton'

interface ChurchSelectorProps {
  userLocation: { lat: number; lng: number } | null
  onSelect: (churchId: string) => void
}

export function ChurchSelector({ userLocation, onSelect }: ChurchSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null)

  const { data: churches, isLoading } = useQuery({
    queryKey: ['churches', searchQuery, userLocation],
    queryFn: () => searchChurches(searchQuery, userLocation),
  })

  return (
    <div className="space-y-4">
      <GlassInput
        type="text"
        placeholder="Szukaj kościoła..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="h-[400px] rounded-lg overflow-hidden">
        <Map
          initialViewState={{
            latitude: userLocation?.lat || 52.2297,
            longitude: userLocation?.lng || 21.0122,
            zoom: 11
          }}
        >
          {churches?.map(church => (
            <Marker
              key={church.id}
              latitude={church.location.lat}
              longitude={church.location.lng}
              onClick={() => setSelectedChurch(church)}
            />
          ))}
        </Map>
      </div>

      {selectedChurch && (
        <GlassButton
          onClick={() => onSelect(selectedChurch.id)}
        >
          Wybierz {selectedChurch.name}
        </GlassButton>
      )}
    </div>
  )
}