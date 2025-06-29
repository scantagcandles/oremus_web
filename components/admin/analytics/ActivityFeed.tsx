"use client";

import React, { useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEvent } from "@/types/analytics";

interface ActivityItemProps {
  event: AnalyticsEvent;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ event }) => {
  const getActivityIcon = (eventType: string) => {
    switch (eventType) {
      case "view":
        return "👁️";
      case "create":
        return "📝";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      case "complete":
        return "✅";
      case "enroll":
        return "📚";
      case "payment":
        return "💳";
      case "webhook":
        return "🔄";
      default:
        return "📌";
    }
  };

  const getActivityDescription = (event: AnalyticsEvent) => {
    const metadata = event.metadata as Record<string, any>;
    switch (event.eventType) {
      case "view":
        return `viewed ${event.entityType} ${metadata?.name || ""}`;
      case "create":
        return `created new ${event.entityType} ${metadata?.name || ""}`;
      case "update":
        return `updated ${event.entityType} ${metadata?.name || ""}`;
      case "delete":
        return `deleted ${event.entityType} ${metadata?.name || ""}`;
      case "complete":
        return `completed ${event.entityType} ${metadata?.name || ""}`;
      case "enroll":
        return `enrolled in course ${metadata?.courseName || ""}`;
      case "payment":
        return `made a payment of ${metadata?.amount} ${metadata?.currency}`;
      case "webhook":
        return `received ${event.entityType} webhook from ${metadata?.provider}`;
      default:
        return `interacted with ${event.entityType}`;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="text-xl">{getActivityIcon(event.eventType)}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          {getActivityDescription(event)}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(event.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const ActivityFeed: React.FC = () => {
  const { getEventsByUser } = useAnalytics();
  const [activities, setActivities] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // For demo purposes, we're getting all events
        // In production, you might want to filter by user or date
        const events = await getEventsByUser("system", 50);
        setActivities(events);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [getEventsByUser]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold px-4">Recent Activity</h2>
      <div className="divide-y divide-gray-100">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} event={activity} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
