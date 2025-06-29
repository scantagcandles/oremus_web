'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function MessagesPage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-6xl py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            💬 Wiadomości
          </h1>
          <p className="text-blue-100">
            Komunikuj się z duchownymi i parafią
          </p>
        </motion.div>

        <GlassCard className="p-8 text-center">
          <div className="mb-4 text-6xl">💬</div>
          <h2 className="mb-4 text-2xl font-bold text-white">System wiadomości w budowie</h2>
          <p className="text-blue-100">Już wkrótce będziesz mógł komunikować się z duchownymi.</p>
        </GlassCard>
      </div>
    </div>
  );
}