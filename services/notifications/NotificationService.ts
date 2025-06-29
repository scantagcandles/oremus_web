import { supabase } from '@/configs/supabase';
import { NotificationPayload, NotificationStatus, NotificationTemplate, NotificationType } from '@/types/notifications';
import { EmailService } from '../email/EmailService';
import { TemplateEngine, TemplateVariables } from '../email/TemplateEngine';
import * as EmailTemplates from '../email/templates/emailTemplates';

export class NotificationService {
  private static instance: NotificationService;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async createNotification(payload: NotificationPayload) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        scheduled_for: payload.scheduledFor,
        metadata: payload.metadata,
        status: 'pending' as NotificationStatus,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationTemplate(type: string, name: string): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', type)
      .eq('name', name)
      .single();

    if (error) throw error;
    return data;
  }

  async updateNotificationStatus(id: string, status: NotificationStatus, sentAt?: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        status,
        sent_at: sentAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }
  async processPendingNotifications() {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (error) throw error;

    for (const notification of notifications) {
      try {
        // Get user's email
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', notification.user_id)
          .single();

        if (!user?.email) continue;

        // Determine notification type and use appropriate email template
        await this.sendNotificationEmail(user.email, notification);

        // Update status
        await this.updateNotificationStatus(notification.id, 'sent');
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        await this.updateNotificationStatus(notification.id, 'failed');
      }
    }
  }
  async scheduleNotification(payload: NotificationPayload) {
    // Create the notification
    const notification = await this.createNotification(payload);

    // If it's scheduled for now or in the past, process it immediately
    if (new Date(payload.scheduledFor) <= new Date()) {
      try {
        // Get user's email
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', payload.userId)
          .single();

        if (!user?.email) throw new Error('User email not found');

        // Send email using the appropriate template
        await this.sendNotificationEmail(user.email, {
          type: payload.type,
          title: payload.title,
          message: payload.message,
          metadata: payload.metadata
        });

        await this.updateNotificationStatus(notification.id, 'sent');
      } catch (error) {
        console.error('Failed to send immediate notification:', error);
        await this.updateNotificationStatus(notification.id, 'failed');
        throw error;
      }
    }

    return notification;
  }

  async getNotificationsForUser(userId: string, status?: NotificationStatus) {
    const query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Send notification email based on notification type
   */
  private async sendNotificationEmail(email: string, notification: any) {
    // Extract metadata
    const metadata = notification.metadata || {};
    
    switch (notification.type) {
      case 'mass_intention_reminder':
        await this.emailService.sendIntentionReminder(
          email, 
          {
            intention_for: metadata.intention_for,
            mass_date: metadata.mass_date,
            parish_name: metadata.parish_name,
            type: metadata.reminder_type || 'default'
          },
          metadata.language || 'en'
        );
        break;
        
      case 'payment_confirmation':
        await this.emailService.sendPaymentConfirmation({
          email,
          intentionDetails: metadata.intentionDetails,
          paymentAmount: metadata.paymentAmount,
          currency: metadata.currency,
          receiptUrl: metadata.receiptUrl
        });
        break;
        
      case 'payment_failure':
        await this.emailService.sendPaymentFailure({
          email,
          intentionId: metadata.intentionId,
          amount: metadata.amount,
          currency: metadata.currency,
          error: metadata.error
        });
        break;
        
      case 'refund_confirmation':
        await this.emailService.sendRefundConfirmation({
          email,
          intentionDetails: metadata.intentionDetails,
          amount: metadata.amount,
          currency: metadata.currency
        });
        break;
        
      case 'course_enrollment':
        await this.emailService.sendCourseEnrollment({
          email,
          courseName: metadata.courseName,
          instructorName: metadata.instructorName,
          courseLevel: metadata.courseLevel,
          courseDuration: metadata.courseDuration,
          courseId: metadata.courseId
        });
        break;
        
      case 'course_completion':
        await this.emailService.sendCourseCompletion({
          email,
          courseName: metadata.courseName,
          completionDate: new Date(metadata.completionDate),
          grade: metadata.grade,
          certificateId: metadata.certificateId
        });
        break;
        
      case 'new_announcement':
        await this.emailService.sendNewAnnouncement({
          email,
          title: metadata.title,
          content: metadata.content,
          postedDate: new Date(metadata.postedDate),
          parishId: metadata.parishId
        });
        break;
        
      case 'report_ready':
        await this.emailService.sendReportReady({
          email,
          reportName: metadata.reportName,
          generatedDate: new Date(metadata.generatedDate),
          reportFormat: metadata.reportFormat,
          downloadUrl: metadata.downloadUrl
        });
        break;
        
      case 'webhook_failure':
        await this.emailService.sendWebhookFailureAlert({
          email,
          provider: metadata.provider,
          eventType: metadata.eventType,
          failureTime: new Date(metadata.failureTime),
          retryCount: metadata.retryCount,
          errorMessage: metadata.errorMessage
        });
        break;
        
      default:
        // For generic notifications, use the basic sendEmail method
        await this.emailService.sendEmail({
          to: email,
          subject: notification.title,
          text: notification.message,
          html: notification.html
        });
    }
  }
}
