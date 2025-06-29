"use client";

import React, { useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { WebhookEvent } from "@/types/analytics";
import { GlassCard } from "@/components/glass/GlassCard";

interface WebhookStatusProps {
  status: "received" | "processed" | "failed";
  count: number;
}

const StatusBadge: React.FC<WebhookStatusProps> = ({ status, count }) => {
  const colors = {
    received: "bg-blue-100 text-blue-800",
    processed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${colors[status]}`}>
      {status}: {count}
    </span>
  );
};

const WebhookMonitor: React.FC = () => {
  const { getFailedWebhooks } = useAnalytics();
  const [failedWebhooks, setFailedWebhooks] = useState<WebhookEvent[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<
    string | undefined
  >();

  useEffect(() => {
    const fetchFailedWebhooks = async () => {
      try {
        const webhooks = await getFailedWebhooks(selectedProvider);
        setFailedWebhooks(webhooks);
      } catch (error) {
        console.error("Error fetching failed webhooks:", error);
      }
    };

    fetchFailedWebhooks();
  }, [selectedProvider, getFailedWebhooks]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Webhook Monitor</h2>{" "}
        <select
          aria-label="Filter by provider"
          value={selectedProvider || ""}
          onChange={(e) => setSelectedProvider(e.target.value || undefined)}
          className="p-2 border rounded-lg bg-white/50 backdrop-blur-sm"
        >
          <option value="">All Providers</option>
          <option value="stripe">Stripe</option>
          <option value="supabase">Supabase</option>
        </select>
      </div>

      <div className="space-y-4">
        {failedWebhooks.length > 0 ? (
          failedWebhooks.map((webhook) => (
            <GlassCard key={webhook.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{webhook.provider}</h3>
                  <p className="text-sm text-gray-600">{webhook.eventType}</p>
                </div>
                <StatusBadge
                  status={webhook.status}
                  count={webhook.retryCount}
                />
              </div>
              {webhook.errorMessage && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                  {webhook.errorMessage}
                </div>
              )}
              <div className="mt-2 text-sm text-gray-500">
                Failed at: {new Date(webhook.createdAt).toLocaleString()}
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No failed webhooks found
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookMonitor;
