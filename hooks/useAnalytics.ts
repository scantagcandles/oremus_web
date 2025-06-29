import { useCallback } from 'react';
import { AnalyticsEvent, AnalyticsPayload, WebhookEvent } from '@/types/analytics';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';

interface UseAnalytics {
  trackEvent: (payload: AnalyticsPayload) => Promise<AnalyticsEvent>;
  getEventsByUser: (userId: string, limit?: number) => Promise<AnalyticsEvent[]>;
  getEventsByEntity: (entityType: string, entityId: string, limit?: number) => Promise<AnalyticsEvent[]>;
  getWebhookMetrics: (period?: 'day' | 'week' | 'month') => Promise<any>;
  getEventMetrics: (period?: 'day' | 'week' | 'month') => Promise<any>;
  getFailedWebhooks: (provider?: string) => Promise<WebhookEvent[]>;
}

export const useAnalytics = (): UseAnalytics => {
  const analytics = AnalyticsService.getInstance();

  const trackEvent = useCallback(async (payload: AnalyticsPayload) => {
    return analytics.trackEvent(payload);
  }, []);

  const getEventsByUser = useCallback(async (userId: string, limit = 100) => {
    return analytics.getEventsByUser(userId, limit);
  }, []);

  const getEventsByEntity = useCallback(async (entityType: string, entityId: string, limit = 100) => {
    return analytics.getEventsByEntity(entityType, entityId, limit);
  }, []);

  const getWebhookMetrics = useCallback(async (period: 'day' | 'week' | 'month' = 'day') => {
    return analytics.getWebhookMetrics(period);
  }, []);

  const getEventMetrics = useCallback(async (period: 'day' | 'week' | 'month' = 'day') => {
    return analytics.getEventMetrics(period);
  }, []);

  const getFailedWebhooks = useCallback(async (provider?: string) => {
    return analytics.getFailedWebhooks(provider);
  }, []);

  return {
    trackEvent,
    getEventsByUser,
    getEventsByEntity,
    getWebhookMetrics,
    getEventMetrics,
    getFailedWebhooks,
  };
};
