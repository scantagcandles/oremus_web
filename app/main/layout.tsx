// web/app/(main)/layout.tsx
import { Suspense } from 'react'
import { getServerUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation user={user} />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}

// web/components/layout/Navigation.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { 
  Home, Flame, Globe, Tv, Church, ShoppingBag, 
  Users, Heart, User as UserIcon, Menu, X,
  Music, GraduationCap, Library
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import GlassCard from '@/components/glass/GlassCard'

interface NavigationProps {
  user: User
}

const navItems = [
  { 
    id: 'home',
    label: 'Główna',
    href: '/',
    icon: Home,
    color: 'text-secondary'
  },
  { 
    id: 'candle',
    label: 'Święta Świeca',
    href: '/candle',
    icon: Flame,
    color: 'text-prayer',
    highlight: true
  },
  { 
    id: 'prayer',
    label: 'Modlitwa',
    href: '/prayer',
    icon: Globe,
    color: 'text-prayer'
  },
  { 
    id: 'mass',
    label: 'Msze',
    href: '/mass',
    icon: Tv,
    color: 'text-mass'
  },
  { 
    id: 'order-mass',
    label: 'Zamów Mszę',
    href: '/order-mass',
    icon: Church,
    color: 'text-mass',
    isNew: true
  },
  { 
    id: 'shop',
    label: 'Sklep',
    href: '/shop',
    icon: ShoppingBag,
    color: 'text-warning'
  },
  { 
    id: 'player',
    label: 'ODB Player',
    href: '/player',
    icon: Music,
    color: 'text-player',
    isNew: true
  },
  { 
    id: 'academy',
    label: 'Akademia',
    href: '/academy',
    icon: GraduationCap,
    color: 'text-academy',
    isNew: true
  },
  { 
    id: 'library',
    label: 'Biblioteka',
    href: '/library',
    icon: Library,
    color: 'text-library',
    isNew: true
  },
  { 
    id: 'community',
    label: 'Wspólnota',
    href: '/community',
    icon: Users,
    color: 'text-info'
  },
  { 
    id: 'spirituality',
    label: 'Duchowość',
    href: '/spirituality',
    icon: Heart,
    color: 'text-prayer'
  },
  { 
    id: 'profile',
    label: 'Profil',
    href: '/profile',
    icon: UserIcon,
    color: 'text-secondary'
  },
]

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Mobile Bottom Navigation
  if (isMobile) {
    const mobileNavItems = navItems.filter(item => 
      ['home', 'candle', 'prayer', 'shop', 'profile'].includes(item.id)
    )

    return (
      <>
        {/* Mobile Top Bar */}
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3">
          <GlassCard className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-secondary" />
              <span className="text-xl font-bold text-secondary">OREMUS</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-secondary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </GlassCard>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-30 pt-20 px-4 bg-black/80 backdrop-blur-lg"
            >
              <GlassCard className="p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <nav className="grid gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          "hover:bg-glass-white active:scale-95",
                          isActive && "bg-glass-secondary"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", item.color)} />
                        <span className="text-white font-medium">{item.label}</span>
                        {item.isNew && (
                          <span className="ml-auto text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-bold">
                            NOWE
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
          <GlassCard className="flex items-center justify-around h-16">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                    "hover:bg-glass-white active:scale-95",
                    isActive && "bg-glass-secondary"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? item.color : "text-white/70")} />
                  <span className={cn(
                    "text-[10px]",
                    isActive ? "text-secondary" : "text-white/70"
                  )}>
                    {item.label}
                  </span>
                  {item.highlight && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </Link>
              )
            })}
          </GlassCard>
        </nav>
      </>
    )
  }

  // Tablet Side Navigation
  if (isTablet) {
    return (
      <aside className="fixed left-0 top-0 bottom-0 w-64 p-4 z-40">
        <GlassCard className="h-full flex flex-col">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-bold text-secondary">OREMUS</span>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      "hover:bg-glass-white active:scale-95",
                      isActive && "bg-glass-secondary"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", item.color)} />
                    <span className="text-white font-medium">{item.label}</span>
                    {item.isNew && (
                      <span className="ml-auto text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-bold">
                        NOWE
                      </span>
                    )}
                    {item.highlight && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-secondary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
          
          <div className="p-4 border-t border-glass-white">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-10 h-10 bg-glass-secondary rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </aside>
    )
  }

  // Desktop Top Navigation
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
      <GlassCard className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-secondary">OREMUS</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    "hover:bg-glass-white active:scale-95",
                    isActive && "bg-glass-secondary"
                  )}
                >
                  <Icon className={cn("w-4 h-4", item.color)} />
                  <span className="text-white font-medium">{item.label}</span>
                  {item.isNew && (
                    <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-bold">
                      NOWE
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-glass-white transition-all"
          >
            <div className="w-8 h-8 bg-glass-secondary rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-white text-sm">{user.email}</span>
          </Link>
        </div>
      </GlassCard>
    </header>
  )
}
