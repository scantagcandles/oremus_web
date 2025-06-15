import { FC } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2,
  LineChart,
  PieChart,
  Filter,
  Download,
  ChevronDown
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassSelect } from '@/components/glass/GlassSelect'
import { GlassButton } from '@/components/glass/GlassButton'
import { AnalyticsCard } from './AnalyticsCard'
import { dateRanges } from '@/lib/constants'

export const AnalyticsDashboard: FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analityka</h2>

        <div className="flex flex-wrap gap-4">
          <GlassSelect
            options={dateRanges}
            defaultValue="week"
          />
          <GlassButton variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </GlassButton>
          <GlassButton variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Eksportuj
          </GlassButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Przychód całkowity"
          value="12 450 zł"
          trend={{ value: "+8.2%", positive: true }}
          icon={LineChart}
        />
        <AnalyticsCard
          title="Średnia wartość"
          value="85 zł"
          trend={{ value: "+2.1%", positive: true }}
          icon={BarChart2}
        />
        <AnalyticsCard
          title="Liczba intencji"
          value="146"
          trend={{ value: "-4.3%", positive: false }}
          icon={PieChart}
        />
        <AnalyticsCard
          title="Współczynnik konwersji"
          value="68%"
          trend={{ value: "+5.4%", positive: true }}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Trend przychodów</h3>
            <GlassButton variant="secondary" className="gap-2">
              Miesiąc
              <ChevronDown className="w-4 h-4" />
            </GlassButton>
          </div>
          <div className="h-64">
            {/* Revenue Chart */}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Rozkład intencji</h3>
            <GlassButton variant="secondary" className="gap-2">
              Ten tydzień
              <ChevronDown className="w-4 h-4" />
            </GlassButton>
          </div>
          <div className="h-64">
            {/* Intentions Distribution Chart */}
          </div>
        </GlassCard>
      </div>

      {/* Detailed Stats */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Szczegółowe metryki</h3>
          <div className="flex gap-4">
            <GlassSelect
              options={[
                { value: 'financial', label: 'Finansowe' },
                { value: 'intentions', label: 'Intencje' },
                { value: 'users', label: 'Użytkownicy' }
              ]}
              defaultValue="financial"
            />
            <GlassButton variant="secondary">
              <Download className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-white">
                <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Metryka</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-white/70">Wartość</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-white/70">Zmiana</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-white/70">Trend</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample row */}
              <tr className="border-b border-glass-white">
                <td className="px-4 py-3 text-sm text-white">Średni przychód dzienny</td>
                <td className="px-4 py-3 text-right text-sm text-white">420 zł</td>
                <td className="px-4 py-3 text-right text-sm text-success">+12.5%</td>
                <td className="px-4 py-3 text-right">
                  <TrendingUp className="w-4 h-4 text-success inline" />
                </td>
              </tr>
              {/* Add more rows */}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
