import { Database } from './supabase';

export type EventType = 'view' | 'create' | 'update' | 'delete' | 'complete' | 'enroll' | 'payment' | 'webhook';
export type EntityType = 'course' | 'lesson' | 'quiz' | 'payment' | 'mass' | 'intention' | 'webhook';
export type WebhookStatus = 'received' | 'processed' | 'failed';
export type ReportType = 'payment' | 'course' | 'user' | 'webhook' | 'custom';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: EventType;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  status: WebhookStatus;
  payload?: Record<string, unknown>;
  errorMessage?: string;
  retryCount: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: ReportType;
  schedule?: string;
  query: string;
  parameters?: Record<string, unknown>;
  recipients: string[];
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsPayload {
  userId?: string;
  eventType: EventType;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}
