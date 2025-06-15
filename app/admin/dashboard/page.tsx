'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, TrendingUp, Users, DollarSign,
  Clock, AlertTriangle, Church, Calendar,
  BarChart2, PieChart, LineChart, Maximize2
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassSelect } from '@/components/glass/GlassSelect'
import { GlassButton } from '@/components/glass/GlassButton'
import { 
  StatsCard,
  TrendChart, 
  PieChartComponent,
  LineChartComponent,
  MetricsTable
} from '@/components/admin/analytics'
import { DataGrid } from '@/components/admin/DataGrid'
import { dateRanges } from '@/lib/constants'

export default function AdminDashboard() {
  const [selectedDateRange, setSelectedDateRange] = useState('today')
  const [selectedView, setSelectedView] = useState('overview')

  // Example stats data
  const stats = {
    intentions: {
      total: 156,
      trend: '+12%',
      isPositive: true
    },
    revenue: {
      total: '8,450 zł',
      trend: '+8%',
      isPositive: true
    },
    churches: {
      total: 24,
      trend: '0%',
      isPositive: true
    },
    pendingIntentions: {
      total: 12,
      trend: '-25%',
      isPositive: true
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel Administratora</h1>
            <p className="text-white/70">Zarządzaj intencjami i monitoruj system</p>
          </div>

          <div className="flex gap-4">
            <GlassSelect
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              options={dateRanges}
            />
            <GlassButton onClick={() => setSelectedView(selectedView === 'overview' ? 'detailed' : 'overview')}>
              <Maximize2 className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard
            title="Intencje"
            value={stats.intentions.total}
            trend={stats.intentions.trend}
            isPositive={stats.intentions.isPositive}
            icon={Calendar}
            color="text-secondary"
          />
          <StatsCard
            title="Przychód"
            value={stats.revenue.total}
            trend={stats.revenue.trend}
            isPositive={stats.revenue.isPositive}
            icon={DollarSign}
            color="text-success"
          />
          <StatsCard
            title="Aktywne parafie"
            value={stats.churches.total}
            trend={stats.churches.trend}
            isPositive={stats.churches.isPositive}
            icon={Church}
            color="text-mass"
          />
          <StatsCard
            title="Oczekujące"
            value={stats.pendingIntentions.total}
            trend={stats.pendingIntentions.trend}
            isPositive={stats.pendingIntentions.isPositive}
            icon={Clock}
            color="text-warning"
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Przychody</h3>
            <TrendChart
              data={[
                { date: '2025-01', value: 4500 },
                { date: '2025-02', value: 5200 },
                { date: '2025-03', value: 4800 },
                { date: '2025-04', value: 6100 },
                { date: '2025-05', value: 7200 },
                { date: '2025-06', value: 8450 }
              ]}
            />
          </GlassCard>

          {/* Intention Distribution */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Rozkład intencji</h3>
            <PieChartComponent
              data={[
                { name: 'Dziękczynne', value: 35 },
                { name: 'Za zmarłych', value: 30 },
                { name: 'O zdrowie', value: 20 },
                { name: 'Inne', value: 15 }
              ]}
            />
          </GlassCard>
        </div>

        {/* Recent Activity */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Ostatnia aktywność</h3>
            <GlassButton variant="secondary">
              Zobacz wszystko
            </GlassButton>
          </div>
          
          <DataGrid
            data={[
              {
                id: 1,
                type: 'intention',
                status: 'pending',
                date: '2025-06-14',
                church: 'Bazylika św. Krzyża',
                amount: '120 zł'
              },
              // Add more items here
            ]}
            columns={[
              { field: 'type', headerName: 'Typ' },
              { field: 'status', headerName: 'Status' },
              { field: 'date', headerName: 'Data' },
              { field: 'church', headerName: 'Parafia' },
              { field: 'amount', headerName: 'Kwota' }
            ]}
          />
        </GlassCard>
      </div>
    </div>
  )
}
