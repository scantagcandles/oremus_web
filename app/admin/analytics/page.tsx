import { Metadata } from 'next';
import CourseMetrics from '@/components/admin/analytics/CourseMetrics';
import ActivityFeed from '@/components/admin/analytics/ActivityFeed';
import WebhookMonitor from '@/components/admin/monitoring/WebhookMonitor';
import NotificationMetrics from '@/components/admin/monitoring/NotificationMetrics';
import { GlassCard } from '@/components/glass/GlassCard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard - Oremus CMS',
  description: 'View system analytics, course metrics, and activity monitoring',
};

const AnalyticsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and user engagement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Metrics Section */}
        <div className="lg:col-span-2">
          <GlassCard>
            <CourseMetrics timeframe="week" />
          </GlassCard>
        </div>

        {/* Notifications Section */}
        <div>
          <GlassCard>
            <NotificationMetrics timeframe="week" />
          </GlassCard>
        </div>

        {/* Webhook Monitor */}
        <div className="lg:col-span-2">
          <GlassCard>
            <WebhookMonitor />
          </GlassCard>
        </div>

        {/* Activity Feed */}
        <div>
          <GlassCard>
            <ActivityFeed />
          </GlassCard>
        </div>
      </div>

      {/* Key Stats Summary */}
      <div className="mt-6">
        <GlassCard>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">System Health</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">API Status</div>
                <div className="mt-1 text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-green-700">Uptime last 30 days</div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Database</div>
                <div className="mt-1 text-2xl font-bold text-blue-600">45ms</div>
                <div className="text-sm text-blue-700">Avg response time</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">Storage</div>
                <div className="mt-1 text-2xl font-bold text-purple-600">82%</div>
                <div className="text-sm text-purple-700">Available space</div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">Tasks</div>
                <div className="mt-1 text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-yellow-700">Running processes</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
