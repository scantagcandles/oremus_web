import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/layout/Navigation'
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'

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
  return (
    <html lang="pl">
      <body className={inter.className}>
        <ServiceWorkerProvider />
        <Navigation />
        <main className="container mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
}