// =============================================================================
// PLIK 1: app/admin/dashboard/page.tsx - ADMIN DASHBOARD
// =============================================================================
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    {
      title: 'Zamówione Msze',
      value: '12',
      change: '+3',
      changeType: 'positive',
      period: 'Ten miesiąc',
      icon: '⛪',
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/intentions'
    },
    {
      title: 'Oczekujące',
      value: '3',
      change: '-1',
      changeType: 'positive', 
      period: 'Ten tydzień',
      icon: '⏳',
      color: 'from-yellow-500 to-orange-500',
      href: '/admin/intentions?status=pending'
    },
    {
      title: 'Odprawione',
      value: '8',
      change: '+2',
      changeType: 'positive',
      period: 'Ten miesiąc',
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      href: '/admin/intentions?status=completed'
    },
    {
      title: 'Nadchodzące',
      value: '2',
      change: '0',
      changeType: 'neutral',
      period: 'Ten tydzień',
      icon: '📅',
      color: 'from-purple-500 to-pink-500',
      href: '/admin/intentions?status=upcoming'
    }
  ];

  const quickActions = [
    {
      title: 'Intencje mszalne',
      description: 'Zarządzaj intencjami i harmonogramem',
      href: '/admin/intentions',
      icon: '📝',
      color: 'from-blue-500 to-purple-500',
      badge: '3 nowe'
    },
    {
      title: 'Analityka',
      description: 'Statystyki i raporty parafii',
      href: '/admin/analytics',
      icon: '📈',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Ogłoszenia',
      description: 'Publikuj ogłoszenia parafialne',
      href: '/admin/announcements',
      icon: '📢',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Księża',
      description: 'Zarządzaj duchownymi',
      href: '/admin/priests',
      icon: '👨‍💼',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Płatności',
      description: 'System płatności i rozliczeń',
      href: '/admin/payments',
      icon: '💳',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Monitoring',
      description: 'Status systemu i alerty',
      href: '/admin/monitoring',
      icon: '📡',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'intention',
      title: 'Nowa intencja mszalna',
      description: 'Jan Kowalski zamówił mszę na 25.06.2025',
      time: '2 min temu',
      icon: '➕',
      color: 'text-green-400'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Płatność otrzymana',
      description: 'Wpłata 50 zł za intencję #1234',
      time: '15 min temu',
      icon: '💰',
      color: 'text-blue-400'
    },
    {
      id: 3,
      type: 'priest',
      title: 'Harmonogram zaktualizowany',
      description: 'ks. Jan Nowak dodał dyspozycyjność',
      time: '1h temu',
      icon: '📅',
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                Panel Administracyjny
              </h1>
              <p className="text-blue-100">
                Zarządzaj parafią i monitoruj aktywność
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex p-1 rounded-lg bg-slate-800/50">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    timeRange === range 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 dni' : range === '30d' ? '30 dni' : '90 dni'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <Link key={stat.title} href={stat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <GlassCard className="p-6 transition-transform cursor-pointer hover:scale-105 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <div className={`text-sm px-2 py-1 rounded ${
                      stat.changeType === 'positive' ? 'text-green-400 bg-green-400/10' :
                      stat.changeType === 'negative' ? 'text-red-400 bg-red-400/10' :
                      'text-gray-400 bg-gray-400/10'
                    }`}>
                      {stat.change !== '0' && (stat.changeType === 'positive' ? '+' : '')}{stat.change}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{stat.period}</div>
                  </div>
                </GlassCard>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="mb-6 text-2xl font-bold text-white">Szybkie akcje</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => (
                  <Link key={action.title} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <GlassCard className="relative h-full p-4 transition-transform cursor-pointer hover:scale-105 group">
                        {action.badge && (
                          <div className="absolute px-2 py-1 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                            {action.badge}
                          </div>
                        )}
                        <div className={`w-12 h-12 mb-3 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-white">{action.title}</h3>
                        <p className="text-sm text-blue-200">{action.description}</p>
                      </GlassCard>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Ostatnia aktywność</h3>
                  <Link href="/admin/activity" className="text-sm text-blue-400 hover:text-blue-300">
                    Zobacz wszystko
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm ${activity.color}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        <p className="text-sm text-blue-200 truncate">{activity.description}</p>
                        <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PLIK 2: app/admin/intentions/page.tsx - ZARZĄDZANIE INTENCJAMI
// =============================================================================
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';

export default function IntentionsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'Wszystkie', count: 12 },
    { value: 'pending', label: 'Oczekujące', count: 3 },
    { value: 'scheduled', label: 'Zaplanowane', count: 5 },
    { value: 'completed', label: 'Odprawione', count: 4 }
  ];

  const intentions = [
    {
      id: 1,
      requester: 'Jan Kowalski',
      email: 'jan.kowalski@email.com',
      intention: 'W intencji za zmarłą matkę Marię',
      requestedDate: '2025-06-25',
      requestedTime: '18:00',
      amount: 50,
      status: 'pending',
      createdAt: '2025-06-21 14:30',
      priest: null,
      notes: ''
    },
    {
      id: 2,
      requester: 'Anna Nowak',
      email: 'anna.nowak@email.com',
      intention: 'Za zdrowie rodziny',
      requestedDate: '2025-06-24',
      requestedTime: '09:00',
      amount: 30,
      status: 'scheduled',
      createdAt: '2025-06-20 16:45',
      priest: 'ks. Jan Nowak',
      notes: 'Msza w kaplicy bocznej'
    },
    {
      id: 3,
      requester: 'Piotr Wiśniewski',
      email: 'piotr.wisniewski@email.com',
      intention: 'Za dusze zmarłych rodziców',
      requestedDate: '2025-06-23',
      requestedTime: '07:00',
      amount: 40,
      status: 'completed',
      createdAt: '2025-06-19 10:15',
      priest: 'ks. Marek Kowal',
      notes: 'Msza odprawiona'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'scheduled': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Oczekujące';
      case 'scheduled': return 'Zaplanowane';
      case 'completed': return 'Odprawione';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                📝 Intencje Mszalne
              </h1>
              <p className="text-blue-100">
                Zarządzaj intencjami mszalnymi i harmonogramem
              </p>
            </div>
            
            <GlassButton href="/admin/intentions/new">
              ➕ Dodaj intencję
            </GlassButton>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-6">
              
              {/* Search */}
              <div className="flex-1 max-w-md">
                <GlassInput
                  placeholder="Szukaj po nazwisku, intencji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="flex space-x-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      statusFilter === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-white border rounded-lg bg-slate-800/50 border-slate-600"
              >
                <option value="all">Wszystkie daty</option>
                <option value="today">Dzisiaj</option>
                <option value="week">Ten tydzień</option>
                <option value="month">Ten miesiąc</option>
              </select>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4"
        >
          {statusOptions.slice(1).map((status, index) => (
            <GlassCard key={status.value} className="p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-white">{status.count}</div>
              <div className="text-sm text-blue-200">{status.label}</div>
            </GlassCard>
          ))}
          <GlassCard className="p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-white">120 zł</div>
            <div className="text-sm text-blue-200">Przychód miesiąc</div>
          </GlassCard>
        </motion.div>

        {/* Intentions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {intentions.map((intention, index) => (
            <motion.div
              key={intention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <GlassCard className="p-6 hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2 space-x-3">
                      <h3 className="text-lg font-semibold text-white">{intention.requester}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(intention.status)}`}>
                        {getStatusLabel(intention.status)}
                      </span>
                    </div>
                    <p className="mb-2 text-blue-200">{intention.intention}</p>
                    <div className="grid grid-cols-1 gap-4 text-sm text-gray-300 md:grid-cols-3">
                      <div>
                        <span className="text-gray-400">Data:</span> {intention.requestedDate}
                      </div>
                      <div>
                        <span className="text-gray-400">Godzina:</span> {intention.requestedTime}
                      </div>
                      <div>
                        <span className="text-gray-400">Kwota:</span> {intention.amount} zł
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span> {intention.email}
                      </div>
                      <div>
                        <span className="text-gray-400">Ksiądz:</span> {intention.priest || 'Nie przypisany'}
                      </div>
                      <div>
                        <span className="text-gray-400">Utworzono:</span> {intention.createdAt}
                      </div>
                    </div>
                    {intention.notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-400">Notatki:</span> {intention.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex ml-4 space-x-2">
                    <button className="p-2 text-blue-400 transition-colors rounded-lg bg-blue-500/20 hover:bg-blue-500/30">
                      ✏️
                    </button>
                    <button className="p-2 text-green-400 transition-colors rounded-lg bg-green-500/20 hover:bg-green-500/30">
                      ✅
                    </button>
                    <button className="p-2 text-red-400 transition-colors rounded-lg bg-red-500/20 hover:bg-red-500/30">
                      🗑️
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="flex justify-center space-x-2">
            <button className="px-4 py-2 text-gray-400 transition-colors rounded-lg bg-slate-800/50 hover:text-white">
              ← Poprzednia
            </button>
            <span className="px-4 py-2 text-white bg-blue-500 rounded-lg">1</span>
            <button className="px-4 py-2 text-gray-400 transition-colors rounded-lg bg-slate-800/50 hover:text-white">
              2
            </button>
            <button className="px-4 py-2 text-gray-400 transition-colors rounded-lg bg-slate-800/50 hover:text-white">
              Następna →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// PLIK 3: app/(main)/order-mass/page.tsx - ZAMAWIANIE MSZY (NAPRAWIONE)
// =============================================================================
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';
import { useAuth } from '@/hooks/useAuth';

export default function OrderMassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Church Selection
    selectedChurch: '',
    
    // Step 2: Date & Time
    selectedDate: '',
    selectedTime: '',
    
    // Step 3: Intention Details
    intentionText: '',
    requesterName: '',
    requesterEmail: user?.email || '',
    requesterPhone: '',
    amount: 30,
    
    // Step 4: Additional Options
    isPublic: true,
    sendReminder: true,
    specialRequests: ''
  });

  const churches = [
    { id: 1, name: 'Parafia św. Jana Chrzciciela', address: 'ul. Kościelna 1, Warszawa', distance: '2.5 km' },
    { id: 2, name: 'Parafia Matki Bożej Częstochowskiej', address: 'ul. Mariacka 15, Warszawa', distance: '3.2 km' },
    { id: 3, name: 'Parafia św. Józefa', address: 'ul. Świętojańska 8, Warszawa', distance: '4.1 km' }
  ];

  const timeSlots = ['07:00', '08:00', '09:00', '18:00', '19:00'];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Here would be the actual payment integration
      console.log('Submitting order:', formData);
      
      // Simulate payment process
      router.push('/payment/success?order_id=12345');
    } catch (error) {
      console.error('Order submission error:', error);
    }
  };

  const stepTitles = [
    'Wybierz parafię',
    'Wybierz datę i godzinę', 
    'Szczegóły intencji',
    'Opcje dodatkowe',
    'Potwierdzenie i płatność'
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-4xl py-8 mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            ⛪ Zamów Mszę Świętą
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100">
            Zamów intencję mszalną w wybranej parafii
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4 space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-blue-500 text-white' :
                  'bg-slate-700 text-gray-400'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && <div className="w-8 h-0.5 bg-slate-700 mx-2" />}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">
              Krok {currentStep}: {stepTitles[currentStep - 1]}
            </h2>
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8">
            
            {/* Step 1: Church Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="mb-6 text-2xl font-bold text-white">Wybierz parafię</h3>
                <div className="space-y-4">
                  {churches.map((church) => (
                    <label key={church.id} className="block">
                      <input
                        type="radio"
                        name="church"
                        value={church.id}
                        checked={formData.selectedChurch === church.id.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedChurch: e.target.value }))}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        formData.selectedChurch === church.id.toString()
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}>
                        <h4 className="text-lg font-semibold text-white">{church.name}</h4>
                        <p className="text-sm text-blue-200">{church.address}</p>
                        <p className="text-sm text-gray-400">{church.distance