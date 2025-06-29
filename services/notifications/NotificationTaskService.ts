import { supabase } from '@/configs/supabase';
import { TaskScheduler } from '@/lib/utils/TaskScheduler';
import { NotificationService } from '@/services/notifications/NotificationService';
import { EmailService } from '@/services/email/EmailService';

export class NotificationTaskService {
  private static instance: NotificationTaskService;
  private scheduler: TaskScheduler;
  private notificationService: NotificationService;
  private emailService: EmailService;

  private constructor() {
    this.scheduler = TaskScheduler.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.emailService = EmailService.getInstance();
    this.initializeTasks();
  }

  public static getInstance(): NotificationTaskService {
    if (!NotificationTaskService.instance) {
      NotificationTaskService.instance = new NotificationTaskService();
    }
    return NotificationTaskService.instance;
  }

  private initializeTasks(): void {
    // Process pending notifications every minute
    this.scheduler.registerTask({
      id: 'process-notifications',
      cronExpression: '* * * * *',
      fn: async () => {
        await this.processPendingNotifications();
      },
    });

    // Clean up old notifications daily at midnight
    this.scheduler.registerTask({
      id: 'cleanup-notifications',
      cronExpression: '0 0 * * *',
      fn: async () => {
        await this.cleanupOldNotifications();
      },
    });

    // Retry failed notifications every 5 minutes
    this.scheduler.registerTask({
      id: 'retry-failed-notifications',
      cronExpression: '*/5 * * * *',
      fn: async () => {
        await this.retryFailedNotifications();
      },
    });
  }

  private async processPendingNotifications(): Promise<void> {
    try {
      await this.notificationService.processPendingNotifications();
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  private async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Archive sent notifications older than 30 days
      const { error } = await supabase
        .from('notification_logs')
        .insert(
          supabase
            .from('scheduled_notifications')
            .select('*')
            .eq('status', 'sent')
            .lt('sent_at', thirtyDaysAgo.toISOString())
        );

      if (error) throw error;

      // Delete archived notifications
      await supabase
        .from('scheduled_notifications')
        .delete()
        .eq('status', 'sent')
        .lt('sent_at', thirtyDaysAgo.toISOString());
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  private async retryFailedNotifications(): Promise<void> {
    try {
      const { data: failedNotifications, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', 3);

      if (error) throw error;

      for (const notification of failedNotifications) {
        try {
          // Get user's email
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', notification.user_id)
            .single();

          if (!user?.email) continue;

          // Attempt to send the notification
          await this.emailService.sendEmail({
            to: user.email,
            subject: notification.title,
            text: notification.message,
          });

          // Update notification status
          await supabase
            .from('scheduled_notifications')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', notification.id);
        } catch (error) {
          console.error(`Failed to retry notification ${notification.id}:`, error);
          
          // Increment retry count
          await supabase
            .from('scheduled_notifications')
            .update({
              retry_count: notification.retry_count + 1,
              error_message: String(error),
              updated_at: new Date().toISOString(),
            })
            .eq('id', notification.id);
        }
      }
    } catch (error) {
      console.error('Error retrying failed notifications:', error);
    }
  }
}
