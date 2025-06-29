import { SupabaseClient } from "@supabase/supabase-js";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export class AnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  async trackEvent(event: AnalyticsEvent) {
    try {
      const { error } = await this.supabase.from("analytics_events").insert({
        event_name: event.name,
        properties: event.properties,
        timestamp: event.timestamp || new Date(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  async trackFeatureUsage(feature: string, success: boolean) {
    await this.trackEvent({
      name: "feature_usage",
      properties: {
        feature,
        success,
        modernization: true,
      },
    });
  }

  async trackPerformanceMetric(
    component: string,
    metric: {
      renderTime?: number;
      loadTime?: number;
      interactionTime?: number;
    }
  ) {
    await this.trackEvent({
      name: "performance_metric",
      properties: {
        component,
        ...metric,
      },
    });
  }

  async trackError(error: Error, context?: Record<string, any>) {
    await this.trackEvent({
      name: "error",
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }
}

export const analytics = new AnalyticsService(supabase);
