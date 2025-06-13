// web/components/features/prayer/PrayerMap.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Flame, X } from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface Candle {
  id: string
  location: {
    lat: number
    lng: number
  }
  city: string
  country: string
  intention?: string
  user_name?: string
}

interface PrayerMapProps {
  candles: Candle[]
  center?: [number, number]
  zoom?: number
}

export default function PrayerMap({ 
  candles, 
  center = [19.145, 51.919], // Center of Poland
  zoom = 5 
}: PrayerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [selectedCandle, setSelectedCandle] = useState<Candle | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add 3D buildings
    map.current.on('load', () => {
      if (!map.current) return

      // Add 3D buildings layer
      const layers = map.current.getStyle().layers
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id

      map.current.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#1a237e',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      )

      // Add glow effect for candles
      map.current.addSource('candles-glow', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: candles.map(candle => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [candle.location.lng, candle.location.lat]
            },
            properties: {
              id: candle.id
            }
          }))
        }
      })

      map.current.addLayer({
        id: 'candles-glow',
        type: 'circle',
        source: 'candles-glow',
        paint: {
          'circle-radius': {
            stops: [[0, 20], [20, 40]]
          },
          'circle-color': '#FFD700',
          'circle-opacity': 0.2,
          'circle-blur': 1
        }
      })
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    candles.forEach(candle => {
      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'candle-marker'
      el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl group-hover:bg-yellow-400/50 transition-all"></div>
          <div class="relative w-8 h-8 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          </div>
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([candle.location.lng, candle.location.lat])
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedCandle(candle)
        map.current?.flyTo({
          center: [candle.location.lng, candle.location.lat],
          zoom: 12,
          pitch: 60,
          bearing: Math.random() * 360,
          duration: 2000,
          essential: true
        })
      })

      markers.current.push(marker)
    })

    // Update glow layer
    if (map.current.getSource('candles-glow')) {
      (map.current.getSource('candles-glow') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: candles.map(candle => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [candle.location.lng, candle.location.lat]
          },
          properties: {
            id: candle.id
          }
        }))
      })
    }
  }, [candles])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-10">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-white">
            <Flame className="w-5 h-5 text-secondary" />
            <span className="text-sm font-medium">
              {candles.length} płonących świec
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Selected Candle Popup */}
      <AnimatePresence>
        {selectedCandle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-20 max-w-sm mx-auto"
          >
            <GlassCard className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-secondary" />
                  <h3 className="text-white font-bold">Świeca</h3>
                </div>
                <button
                  onClick={() => setSelectedCandle(null)}
                  className="p-1 rounded-lg hover:bg-glass-white transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedCandle.city}, {selectedCandle.country}</span>
                </div>
                
                {selectedCandle.user_name && (
                  <p className="text-white">
                    Zapalona przez: <span className="text-secondary">{selectedCandle.user_name}</span>
                  </p>
                )}
                
                {selectedCandle.intention && (
                  <div className="pt-2 border-t border-glass-white">
                    <p className="text-white/70 italic">"{selectedCandle.intention}"</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .candle-marker {
          width: 32px;
          height: 32px;
        }
        
        .mapboxgl-popup-content {
          background: rgba(26, 35, 126, 0.15) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: rgba(26, 35, 126, 0.15) !important;
        }
      `}</style>
    </div>
  )
}