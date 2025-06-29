'use client'

import Image from 'next/image'
import { GlassCard } from '@/components/glass/GlassCard'
import { useState } from 'react'

export default function TestLogoPage() {
  const [selectedVariant, setSelectedVariant] = useState('original')

  const variants = [
    { id: 'original', name: 'Oryginalne', className: '' },
    { id: 'inverted', name: 'OdwrÃ³cone (biaÅ‚e)', className: 'invert brightness-0 contrast-200' },
    { id: 'gold', name: 'ZÅ‚ote', className: 'invert sepia saturate-200 hue-rotate-15 brightness-110' },
    { id: 'glow', name: 'Ze Å›wieceniem', className: 'invert brightness-0 contrast-200 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]' },
    { id: 'primary', name: 'Niebieskie', className: 'invert sepia saturate-[5] hue-rotate-[200deg] brightness-[0.6]' },
    { id: 'shadow', name: 'Z cieniem', className: 'drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]' },
  ]

  const backgrounds = [
    { id: 'black', name: 'Czarne', className: 'bg-black' },
    { id: 'primary', name: 'Granatowe', className: 'bg-primary' },
    { id: 'glass', name: 'Glass', className: 'bg-white/10 backdrop-blur-xl' },
    { id: 'gradient', name: 'Gradient', className: 'bg-gradient-to-br from-black via-primary/20 to-black' },
  ]

  return (
    <div className="min-h-screen p-6 pt-20 md:pl-70 lg:pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Test Logo OREMUS</h1>
          <p className="text-white/60">Wybierz wariant ktÃ³ry najlepiej pasuje do aplikacji</p>
        </div>

        {/* Kontrolki */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Warianty kolorystyczne</h2>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedVariant === variant.id
                    ? 'bg-secondary text-primary'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* PodglÄ…d na rÃ³Å¼nych tÅ‚ach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {backgrounds.map((bg) => (
            <GlassCard key={bg.id} className="overflow-hidden">
              <div className={`${bg.className} p-8`}>
                <h3 className="text-white/80 text-sm mb-4">{bg.name} tÅ‚o</h3>
                <div className="flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="OREMUS Logo"
                    width={120}
                    height={120}
                    className={variants.find(v => v.id === selectedVariant)?.className}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* PrzykÅ‚ady uÅ¼ycia */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">PrzykÅ‚ady uÅ¼ycia w aplikacji</h2>
          
          <div className="space-y-6">
            {/* Navigation */}
            <div>
              <h3 className="text-white/60 text-sm mb-2">Nawigacja</h3>
              <div className="flex items-center gap-4 p-4 bg-black/50 rounded-lg">
                <Image
                  src="/logo.png"
                  alt="OREMUS"
                  width={32}
                  height={32}
                  className={variants.find(v => v.id === selectedVariant)?.className}
                />
                <span className="text-xl font-bold text-gradient">OREMUS</span>
              </div>
            </div>

            {/* Loading */}
            <div>
              <h3 className="text-white/60 text-sm mb-2">Loading State</h3>
              <div className="flex items-center justify-center p-8 bg-black/50 rounded-lg">
                <div className="text-center">
                  <Image
                    src="/logo.png"
                    alt="Loading"
                    width={64}
                    height={64}
                    className={`${variants.find(v => v.id === selectedVariant)?.className} animate-pulse`}
                  />
                  <div className="mt-4 flex gap-1 justify-center">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Button */}
            <div>
              <h3 className="text-white/60 text-sm mb-2">W przycisku</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-primary rounded-lg transition-all">
                <Image
                  src="/logo.png"
                  alt=""
                  width={20}
                  height={20}
                  className="invert"
                />
                <span className="font-medium">Zapal Å›wiecÄ™</span>
              </button>
            </div>

            {/* Rozmiary */}
            <div>
              <h3 className="text-white/60 text-sm mb-2">RÃ³Å¼ne rozmiary</h3>
              <div className="flex items-end gap-4 p-4 bg-black/50 rounded-lg">
                {[24, 32, 48, 64, 80].map((size) => (
                  <div key={size} className="text-center">
                    <Image
                      src="/logo.png"
                      alt=""
                      width={size}
                      height={size}
                      className={variants.find(v => v.id === selectedVariant)?.className}
                    />
                    <span className="text-xs text-white/40 mt-1">{size}px</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Kod do skopiowania */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Kod do uÅ¼ycia</h2>
          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-white/80">
{`<Image
  src="/logo.png"
  alt="OREMUS"
  width={32}
  height={32}
  className="${variants.find(v => v.id === selectedVariant)?.className}"
/>`}
            </code>
          </pre>
        </GlassCard>
      </div>
    </div>
  )
}
