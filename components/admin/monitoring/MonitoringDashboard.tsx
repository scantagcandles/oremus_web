import { FC } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Lock,
  MonitorCheck,
  Server,
  Shield,
  ThermometerSun,
  Zap,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassSelect } from '@/components/glass/GlassSelect'
import { GlassButton } from '@/components/glass/GlassButton'
import { AnalyticsCard } from '../analytics/AnalyticsCard'
import { monitoringAlerts } from '@/lib/constants'

export const MonitoringDashboard: FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Monitoring</h2>
        
        <div className="flex flex-wrap gap-4">
          <GlassSelect
            options={[
              { value: 'all', label: 'Wszystkie systemy' },
              { value: 'web', label: 'Frontend' },
              { value: 'api', label: 'API' },
              { value: 'db', label: 'Baza danych' },
              { value: 'queue', label: 'Kolejki' }
            ]}
            defaultValue="all"
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

      {/* System Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Status systemu"
          value="Działa"
          className="border-l-4 border-success"
          icon={Server}
        />
        <AnalyticsCard
          title="Uptime"
          value="99.98%"
          trend={{ value: "30 dni", positive: true }}
          icon={Activity}
        />
        <AnalyticsCard
          title="Czas odpowiedzi"
          value="124ms"
          trend={{ value: "-12ms", positive: true }}
          icon={Zap}
        />
        <AnalyticsCard
          title="Błędy (24h)"
          value="3"
          trend={{ value: "+2", positive: false }}
          icon={AlertTriangle}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Wykorzystanie zasobów</h3>
          <div className="space-y-4">
            {/* CPU Usage */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70">CPU</span>
                <span className="text-sm text-white">45%</span>
              </div>
              <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                <div className="h-full bg-info w-[45%]" />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70">RAM</span>
                <span className="text-sm text-white">72%</span>
              </div>
              <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[72%]" />
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70">Disk</span>
                <span className="text-sm text-white">28%</span>
              </div>
              <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                <div className="h-full bg-success w-[28%]" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Status usług</h3>
          <div className="space-y-4">
            {[
              { name: 'Frontend', status: 'operational', latency: '89ms' },
              { name: 'API', status: 'operational', latency: '124ms' },
              { name: 'Database', status: 'operational', latency: '45ms' },
              { name: 'Queue', status: 'degraded', latency: '235ms' },
              { name: 'Storage', status: 'operational', latency: '67ms' }
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'operational' ? 'bg-success' :
                    service.status === 'degraded' ? 'bg-warning' :
                    'bg-error'
                  }`} />
                  <span className="text-white">{service.name}</span>
                </div>
                <span className="text-white/70">{service.latency}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Alerts */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-6">Ostatnie alerty</h3>
        <div className="space-y-4">
          {[
            {
              id: 1,
              type: 'warning',
              message: 'Wysokie wykorzystanie CPU',
              timestamp: '2 min temu',
              icon: ThermometerSun
            },
            {
              id: 2,
              type: 'error',
              message: 'Błąd połączenia z bazą danych',
              timestamp: '15 min temu',
              icon: Database
            },
            {
              id: 3,
              type: 'success',
              message: 'System automatycznie naprawiony',
              timestamp: '1h temu',
              icon: MonitorCheck
            }
          ].map((alert) => (
            <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg bg-glass-white">
              <div className={`p-2 rounded-lg ${
                alert.type === 'error' ? 'bg-error/20 text-error' :
                alert.type === 'warning' ? 'bg-warning/20 text-warning' :
                'bg-success/20 text-success'
              }`}>
                <alert.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{alert.message}</p>
                <p className="text-white/50 text-sm">{alert.timestamp}</p>
              </div>
              <GlassButton variant="secondary" size="sm">
                Szczegóły
              </GlassButton>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Security Overview */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-6">Bezpieczeństwo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-success">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Firewall aktywny</span>
            </div>
            <p className="text-white/70 text-sm">
              Ostatni atak: 3 dni temu
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-success">
              <Lock className="w-5 h-5" />
              <span className="font-medium">SSL/TLS aktywne</span>
            </div>
            <p className="text-white/70 text-sm">
              Certyfikat ważny: 89 dni
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">0 podatności</span>
            </div>
            <p className="text-white/70 text-sm">
              Ostatni skan: 2h temu
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
