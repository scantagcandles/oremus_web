'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function PrayersPage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center mb-4 space-x-2 text-blue-300">
            <Link href="/main/library" className="transition-colors hover:text-white">Biblioteka</Link>
            <span>›</span>
            <span className="text-white">Modlitwy</span>
          </nav>
          <h1 className="text-3xl font-bold text-white md:text-4xl">🙏 Modlitwy</h1>
        </motion.div>

        <GlassCard className="p-8 text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="mb-4 text-2xl font-bold text-white">Wkrótce dostępne!</h2>
          <p className="text-blue-100">Sekcja Modlitwy jest w trakcie przygotowania.</p>
        </GlassCard>
      </div>
    </div>
  );
}