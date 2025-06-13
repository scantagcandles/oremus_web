// web/next.config.js - ZAKTUALIZOWANY
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'unsplash-images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
        }
      }
    },
    {
      urlPattern: /\/api\/(candles|prayers|churches)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = withPWA(nextConfig)

// web/public/manifest.json - ROZSZERZONY
{
  "name": "OREMUS - Wspólnota modlitwy online",
  "short_name": "OREMUS",
  "description": "Zapal świecę, módl się z innymi, uczestniczuj we Mszach online",
  "theme_color": "#1a237e",
  "background_color": "#000000",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/?source=pwa",
  "id": "com.oremus.app",
  "categories": ["lifestyle", "education"],
  "lang": "pl",
  "dir": "ltr",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "label": "Strona główna"
    },
    {
      "src": "/screenshots/candle.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "label": "System świec"
    },
    {
      "src": "/screenshots/prayer.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "label": "Globalna modlitwa"
    }
  ],
  "shortcuts": [
    {
      "name": "Zapal świecę",
      "short_name": "Świeca",
      "description": "Zapal wirtualną świecę",
      "url": "/candle?source=pwa",
      "icons": [{ "src": "/icons/candle.png", "sizes": "192x192" }]
    },
    {
      "name": "Transmisja Mszy",
      "short_name": "Msza",
      "description": "Zobacz transmisje na żywo",
      "url": "/mass?source=pwa",
      "icons": [{ "src": "/icons/mass.png", "sizes": "192x192" }]
    }
  ],
  "related_applications": [],
  "protocol_handlers": [
    {
      "protocol": "web+oremus",
      "url": "/?url=%s"
    }
  ]
}

// web/components/common/InstallPWA.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Handle install prompt
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show banner if not installed and not dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        setShowInstallBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA is installed')
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installed')
      }
      
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  const dismissBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <GlassCard className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary rounded-xl">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">
                  Zainstaluj aplikację OREMUS
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  Szybszy dostęp, działanie offline, powiadomienia o modlitwach
                </p>
                
                {isIOS ? (
                  <p className="text-white/50 text-xs">
                    Naciśnij <span className="text-secondary">Udostępnij</span> i wybierz "Dodaj do ekranu głównego"
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <GlassButton
                      size="sm"
                      onClick={handleInstall}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Zainstaluj
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant="secondary"
                      onClick={dismissBanner}
                    >
                      Później
                    </GlassButton>
                  </div>
                )}
              </div>
              
              <button
                onClick={dismissBanner}
                className="p-1 hover:bg-glass-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// web/hooks/useOffline.ts
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast.success('Połączenie przywrócone')
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast.error('Brak połączenia z internetem')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}

// Dodaj do app/layout.tsx
import { InstallPWA } from '@/components/common/InstallPWA'

// W body dodaj:
<InstallPWA />