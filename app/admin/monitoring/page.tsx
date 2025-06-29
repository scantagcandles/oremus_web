import { Metadata } from 'next';
import WebhookMonitor from '@/components/admin/monitoring/WebhookMonitor';
import NotificationMetrics from '@/components/admin/monitoring/NotificationMetrics';
import { GlassCard } from '@/components/glass/GlassCard';

export const metadata: Metadata = {
  title: 'System Monitoring - Oremus CMS',
  description: 'Monitor system health, webhooks, and notifications',
};

export default function MonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <WebhookMonitor />
        </GlassCard>

        <GlassCard>
          <NotificationMetrics timeframe="day" />
        </GlassCard>
      </div>

      <div className="mt-6">
        <GlassCard>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatusCard
                label="API Status"
                status="healthy"
                message="All systems operational"
              />
              <StatusCard
                label="Database"
                status="healthy"
                message="Connected"
              />
              <StatusCard
                label="Email Service"
                status="healthy"
                message="Sending normally"
              />
              <StatusCard
                label="Task Runner"
                status="healthy"
                message="Processing jobs"
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

interface StatusCardProps {
  label: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, status, message }) => {
  const statusColors = {
    healthy: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`p-4 rounded-lg ${statusColors[status]}`}>
      <h3 className="font-medium">{label}</h3>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
};
