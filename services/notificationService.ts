import { supabase } from '@/configs/supabase';
import { Database } from '@/types/supabase';
import { EmailService } from './email/EmailService';

type MassIntention = Database['public']['Tables']['masses']['Row'];

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Schedule reminders for a mass intention
   * @param intention Mass intention details
   */
  public async scheduleIntentionReminders(intention: MassIntention) {
    if (!intention.date) return;

    const intentionDate = new Date(intention.date);
    const now = new Date();

    // Schedule reminders at different intervals
    const reminderTimes = [
      { days: 7, type: 'week_before' },
      { days: 1, type: 'day_before' },
      { hours: 1, type: 'hour_before' }
    ];

    for (const reminder of reminderTimes) {
      const reminderDate = new Date(intentionDate);
      if ('days' in reminder) {
        reminderDate.setDate(reminderDate.getDate() - reminder.days);
      } else if ('hours' in reminder) {
        reminderDate.setHours(reminderDate.getHours() - reminder.hours);
      }

      // Only schedule future reminders
      if (reminderDate > now) {
        await this.createReminder({
          intention_id: intention.id,
          type: reminder.type,
          scheduled_for: reminderDate.toISOString(),
          parish_id: intention.parish_id,
          metadata: {
            intention_for: intention.intention_for,
            mass_date: intention.date,
            reminder_type: reminder.type
          }
        });
      }
    }
  }

  /**
   * Create a reminder in the database
   */
  private async createReminder(data: {
    intention_id: string;
    type: string;
    scheduled_for: string;
    parish_id: string;
    metadata: Record<string, any>;
  }) {
    const { error } = await supabase
      .from('reminders')
      .insert({
        intention_id: data.intention_id,
        type: data.type,
        scheduled_for: data.scheduled_for,
        parish_id: data.parish_id,
        metadata: data.metadata,
        status: 'pending'
      });

    if (error) {
      console.error('Failed to create reminder:', error);
    }
  }

  /**
   * Send a notification about a mass intention
   */
  public async sendIntentionNotification(intentionId: string, type: string) {
    const { data: intention, error } = await supabase
      .from('masses')
      .select('*, parishes(*)')
      .eq('id', intentionId)
      .single();

    if (error || !intention) {
      console.error('Failed to fetch intention:', error);
      return;
    }

    // Send email notification
    await this.emailService.sendIntentionReminder(
      intention.email,
      {
        intention_for: intention.intention_for,
        mass_date: intention.date,
        parish_name: intention.parishes?.name || 'Unknown Parish',
        type: type
      },
      'en'  // TODO: Get user's preferred language
    );

    // Update reminder status
    await supabase
      .from('reminders')
      .update({ status: 'sent' })
      .eq('intention_id', intentionId)
      .eq('type', type);
  }
}
