import { supabase } from '@/configs/supabase';
import { AnalyticsEvent, AnalyticsPayload, WebhookEvent, WebhookStatus } from '@/types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async trackEvent(payload: AnalyticsPayload): Promise<AnalyticsEvent> {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: payload.userId,
        event_type: payload.eventType,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        metadata: payload.metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async recordWebhookEvent(
    provider: string,
    eventType: string,
    payload?: Record<string, unknown>
  ): Promise<WebhookEvent> {
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        provider,
        event_type: eventType,
        status: 'received' as WebhookStatus,
        payload,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWebhookStatus(
    id: string,
    status: WebhookStatus,
    errorMessage?: string
  ): Promise<void> {    const update: Partial<WebhookEvent> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'processed') {
      update.processedAt = new Date().toISOString();
    } else if (status === 'failed') {
      update.errorMessage = errorMessage;
      const { data: retryCount, error: rpcError } = await supabase.rpc('increment_retry_count', { webhook_id: id });
      if (rpcError) throw rpcError;
      update.retryCount = retryCount;
    }

    const { error } = await supabase
      .from('webhook_events')
      .update(update)
      .eq('id', id);

    if (error) throw error;
  }

  async getEventsByUser(userId: string, limit = 100): Promise<AnalyticsEvent[]> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getEventsByEntity(
    entityType: string,
    entityId: string,
    limit = 100
  ): Promise<AnalyticsEvent[]> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getFailedWebhooks(provider?: string): Promise<WebhookEvent[]> {
    let query = supabase
      .from('webhook_events')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false });

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getWebhookMetrics(period: 'day' | 'week' | 'month' = 'day') {
    const { data, error } = await supabase
      .rpc('get_webhook_metrics', { time_period: period });

    if (error) throw error;
    return data;
  }

  async getEventMetrics(period: 'day' | 'week' | 'month' = 'day') {
    const { data, error } = await supabase
      .rpc('get_event_metrics', { time_period: period });

    if (error) throw error;
    return data;
  }
}
