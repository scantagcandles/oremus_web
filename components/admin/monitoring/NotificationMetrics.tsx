"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/glass/GlassCard";
import { NotificationStatus } from "@/types/notifications";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationMetricsProps {
  timeframe: "day" | "week" | "month";
}

interface MetricCardProps {
  label: string;
  value: number;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, className }) => (
  <div className={`text-center p-4 ${className}`}>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const NotificationMetrics: React.FC<NotificationMetricsProps> = ({
  timeframe,
}) => {
  const { getNotifications } = useNotifications();
  const [metrics, setMetrics] = useState({
    pending: 0,
    sent: 0,
    failed: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // In a real app, you might want to add a date filter based on timeframe
        const [pending, sent, failed] = await Promise.all([
          getNotifications("system", "pending"),
          getNotifications("system", "sent"),
          getNotifications("system", "failed"),
        ]);

        setMetrics({
          pending: pending.length,
          sent: sent.length,
          failed: failed.length,
        });
      } catch (error) {
        console.error("Error fetching notification metrics:", error);
      }
    };

    fetchMetrics();
  }, [timeframe, getNotifications]);

  const statusColors = {
    pending: "bg-yellow-50",
    sent: "bg-green-50",
    failed: "bg-red-50",
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Notification Status</h2>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Pending"
          value={metrics.pending}
          className={statusColors.pending}
        />
        <MetricCard
          label="Sent"
          value={metrics.sent}
          className={statusColors.sent}
        />
        <MetricCard
          label="Failed"
          value={metrics.failed}
          className={statusColors.failed}
        />
      </div>

      {metrics.failed > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-red-800 mb-2">
            Failed Notifications
          </div>
          <div className="text-sm text-gray-600">
            There are {metrics.failed} notifications that failed to send. Please
            check the logs for more details.
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMetrics;
