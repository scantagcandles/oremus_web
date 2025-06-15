// components/layout/Navigation.tsx

// Na początku pliku dodaj import:
import { OremusLogo } from '@/components/common/logo'

// MOBILE - Zamień sekcję z Flame na:
<>
    // MOBILE - Zamień sekcję z Flame na:
    <Link href="/(main)" className="flex items-center">
        <OremusLogo size="xs" effect="subtle-glow" priority />
    </Link>
    // TABLET - Zamień sekcję z Flame na:
    <Link href="/(main)" className="flex items-center">
        <OremusLogo size="sm" effect="glow" animated priority />
    </Link>
    // DESKTOP - Zamień sekcję z Flame na:
    <Link href="/(main)" className="flex items-center">
        <OremusLogo size="sm" effect="subtle-glow" animated priority />
    </Link></>
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Flame, Globe, Tv, ShoppingBag, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const navItems = [
    { href: '/(main)', icon: Home, label: 'Główna' },
    { href: '/(main)/candle', icon: Flame, label: 'Świeca' },
    { href: '/(main)/prayer', icon: Globe, label: 'Modlitwa' },
    { href: '/(main)/mass', icon: Tv, label: 'Msze' },
    { href: '/(main)/shop', icon: ShoppingBag, label: 'Sklep' },
    { href: '/(main)/profile', icon: User, label: 'Profil' },
  ]

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href ? 'text-yellow-500' : 'text-white/70'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    )
  }

  // Tablet Side Navigation
  if (isTablet) {
    return (
      <nav className="fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-lg border-r border-white/10 z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-yellow-500 mb-8">OREMUS</h1>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  pathname === item.href 
                    ? 'bg-yellow-500/20 text-yellow-500' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    )
  }

  // Desktop Top Navigation
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-yellow-500">OREMUS</h1>
          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href 
                    ? 'bg-yellow-500/20 text-yellow-500' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}