'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function ChurchFinder() {
  const churches = [
    {
      id: 1,
      name: 'Parafia św. Jana Chrzciciela',
      address: 'ul. Kościelna 1, Warszawa',
      distance: '2.5 km',
      masses: ['07:00', '09:00', '11:00', '18:00']
    },
    {
      id: 2,
      name: 'Parafia Matki Bożej Częstochowskiej',
      address: 'ul. Mariacka 15, Warszawa',
      distance: '3.2 km',
      masses: ['06:30', '08:00', '10:00', '17:30']
    }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            🗺️ Znajdź Parafię
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100">
            Wyszukaj parafie w okolicy i sprawdź harmonogram mszy świętych
          </p>
        </motion.div>

        <div className="space-y-6">
          {churches.map((church, index) => (
            <motion.div
              key={church.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-white">{church.name}</h3>
                    <p className="mb-2 text-blue-200">{church.address}</p>
                    <p className="mb-3 text-sm text-blue-300">📍 {church.distance}</p>
                    <div className="flex flex-wrap gap-2">
                      {church.masses.map((time) => (
                        <span key={time} className="px-2 py-1 text-sm text-blue-300 rounded bg-blue-500/20">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-2xl">⛪</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}