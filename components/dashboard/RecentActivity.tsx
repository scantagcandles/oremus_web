// components/dashboard/RecentActivity.tsx
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Calendar,
  MessageCircle,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'order' | 'message' | 'payment' | 'notification';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info' | 'error';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    church?: string;
    priest?: string;
    amount?: number;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

const activityConfig = {
  order: {
    icon: Calendar,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  message: {
    icon: MessageCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  payment: {
    icon: CreditCard,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  notification: {
    icon: Bell,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  }
};

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-400'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400'
  },
  info: {
    icon: Info,
    color: 'text-blue-400'
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-400'
  }
};

export function RecentActivity({ 
  activities, 
  isLoading = false, 
  className,
  maxItems = 6 
}: RecentActivityProps) {
  if (isLoading || !activities) {
    return <RecentActivityLoading className={className} />;
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={cn(
      "backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Ostatnia Aktywność
        </h3>
        <Link 
          href="/user/activity" 
          className="flex items-center gap-1 text-sm transition-colors text-white/60 hover:text-white/80"
        >
          Zobacz wszystkie
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="py-8 text-center text-white/60">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Brak ostatniej aktywności</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity} 
              index={index}
            />
          ))
        )}
      </div>

      {/* View All Button */}
      {activities.length > maxItems && (
        <div className="pt-4 mt-6 border-t border-white/10">
          <Link
            href="/user/activity"
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-4",
              "rounded-lg border border-white/20 text-white/80",
              "hover:bg-white/5 hover:border-white/30 transition-all"
            )}
          >
            Zobacz wszystkie aktywności
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity, index }: { activity: ActivityItem; index: number }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;
  const StatusIcon = activity.status ? statusConfig[activity.status]?.icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        "hover:bg-white/5 transition-colors cursor-pointer"
      )}>
        {/* Icon */}
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bgColor)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {activity.title}
              </h4>
              <p className="mt-1 text-xs text-white/60 line-clamp-2">
                {activity.description}
              </p>
              
              {/* Metadata */}
              {activity.metadata && (
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                  {activity.metadata.church && (
                    <span>{activity.metadata.church}</span>
                  )}
                  {activity.metadata.priest && (
                    <span>• ks. {activity.metadata.priest}</span>
                  )}
                  {activity.metadata.amount && (
                    <span>• {activity.metadata.amount} zł</span>
                  )}
                </div>
              )}
            </div>

            {/* Status & Timestamp */}
            <div className="flex flex-col items-end flex-shrink-0 gap-1 ml-2">
              {StatusIcon && activity.status && (
                <StatusIcon className={cn("w-3 h-3", statusConfig[activity.status].color)} />
              )}
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {activity.actionUrl && activity.actionLabel && (
            <Link
              href={activity.actionUrl}
              className={cn(
                "inline-flex items-center gap-1 mt-2 text-xs",
                "text-blue-400 hover:text-blue-300 transition-colors"
              )}
            >
              {activity.actionLabel}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RecentActivityLoading({ className }: { className?: string }) {
  return (
    <div className={cn(
      "backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="w-32 h-6 rounded-md bg-white/10 animate-pulse" />
        <div className="w-24 h-4 rounded-md bg-white/10 animate-pulse" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 rounded-md bg-white/10 animate-pulse" />
              <div className="w-full h-3 rounded-md bg-white/10 animate-pulse" />
              <div className="w-1/2 h-3 rounded-md bg-white/10 animate-pulse" />
            </div>
            <div className="w-12 h-3 rounded-md bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Utility function for time formatting
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'teraz';
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString('pl-PL', { 
    day: 'numeric', 
    month: 'short' 
  });
}

// Hook for fetching recent activity
export function useRecentActivity(userId?: string) {
  // Mock data - integrate with your existing services
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'order',
      title: 'Nowe zamówienie mszy',
      description: 'Za zdrowie rodziny - msza o 10:00',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      status: 'success',
      actionUrl: '/user/orders/1',
      actionLabel: 'Zobacz szczegóły',
      metadata: {
        church: 'Parafia św. Jana',
        priest: 'Jan Kowalski',
        amount: 25
      }
    },
    {
      id: '2',
      type: 'message',
      title: 'Nowa wiadomość od księdza',
      description: 'Ks. Nowak odpowiedział na Twoją prośbę',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      status: 'info',
      actionUrl: '/user/messages/2',
      actionLabel: 'Przeczytaj',
      metadata: {
        priest: 'Michał Nowak'
      }
    },
    {
      id: '3',
      type: 'payment',
      title: 'Płatność zrealizowana',
      description: 'Płatność za mszę została zaakceptowana',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
      status: 'success',
      metadata: {
        amount: 25
      }
    }
  ];

  return {
    activities: mockActivities,
    isLoading: false,
    error: null,
    refetch: () => {}
  };
}