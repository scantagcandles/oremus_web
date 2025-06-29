import { Database } from './supabase';

export type NotificationType = 
  | 'payment_confirmation' 
  | 'payment_failure' 
  | 'refund_confirmation' 
  | 'mass_intention_reminder' 
  | 'course_enrollment' 
  | 'course_completion'
  | 'password_reset'
  | 'welcome'
  | 'email_verification'
  | 'parish_registration'
  | 'webhook_failure'
  | 'new_announcement'
  | 'report_ready';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  scheduledFor: string;
  sentAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  subject: string;
  template: string;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: string;
  metadata?: Record<string, unknown>;
}
