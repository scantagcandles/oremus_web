'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function LivePage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            ▶️ Transmisje na żywo
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100">
            Oglądaj msze święte i nabożeństwa online
          </p>
        </motion.div>

        <GlassCard className="p-8 text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="mb-4 text-2xl font-bold text-white">System transmisji w budowie!</h2>
          <p className="text-lg text-blue-100">
            Pracujemy nad systemem transmisji na żywo. Już wkrótce będziesz mógł oglądać msze święte online.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}