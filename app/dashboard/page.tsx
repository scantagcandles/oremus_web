'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function DashboardPage() {
  const quickActions = [
    {
      title: 'Zamów Mszę',
      description: 'Zamów intencję mszalną',
      href: '/main/order-mass',
      icon: '➕',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Biblioteka',
      description: 'Zasoby duchowe',
      href: '/main/library',
      icon: '📚',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Wiadomości',
      description: 'Komunikacja',
      href: '/messages',
      icon: '💬',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Dashboard
          </h1>
          <p className="text-lg text-blue-100">
            Witaj w swoim osobistym centrum kontroli
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <GlassCard className="p-4 transition-transform cursor-pointer hover:scale-105">
                <div className={`w-12 h-12 mb-3 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-xl`}>
                  {action.icon}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">{action.title}</h3>
                <p className="text-sm text-blue-200">{action.description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}