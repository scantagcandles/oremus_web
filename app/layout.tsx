'use client'

import { useEffect } from 'react'
import { useServiceWorkerRegistration } from '@/hooks/useServiceWorkerRegistration'
import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/layout/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Oremus',
  description: 'Platforma modlitewna',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Register service worker
  useServiceWorkerRegistration()

  return (
    <html lang="pl">
      <body className={inter.className}>
        <Navigation />
        <main className="container mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
